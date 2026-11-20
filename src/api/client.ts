import type { ApiErrorBody } from './types';

const DEFAULT_API_URL = 'http://localhost:4000/api';
const TOKEN_STORAGE_KEY = 'biscato.accessToken';
const UNAUTHORIZED_STATUS = 401;
const NO_CONTENT_STATUS = 204;
const NETWORK_ERROR_STATUS = 0;
const NETWORK_ERROR_MESSAGE =
  'Não foi possível ligar ao servidor. Verifique a ligação e tente novamente.';
const UNEXPECTED_ERROR_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.';

type HttpMethod = 'GET' | 'POST' | 'PATCH';

interface RequestOptions {
  method: HttpMethod;
  path: string;
  query?: object;
  body?: unknown;
  signal?: AbortSignal;
}

function readConfiguredApiUrl(): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.VITE_API_URL;
}

export const API_URL = (readConfiguredApiUrl() || DEFAULT_API_URL).replace(/\/+$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly details: string[];

  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function getAccessToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    return;
  }
}

export function clearAccessToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    return;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.details.length > 0 ? error.details.join(' ') : error.message;
  }
  return UNEXPECTED_ERROR_MESSAGE;
}

function buildUrl(path: string, query?: object): string {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      params.append(key, String(value));
    }
  }
  const search = params.toString();
  return `${API_URL}${path}${search ? `?${search}` : ''}`;
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiErrorBody).message === 'string'
  );
}

async function readJson(response: Response): Promise<unknown> {
  if (response.status === NO_CONTENT_STATUS) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function toApiError(status: number, payload: unknown): ApiError {
  if (isErrorBody(payload)) {
    return new ApiError(status, payload.message, payload.details ?? []);
  }
  return new ApiError(status, UNEXPECTED_ERROR_MESSAGE);
}

async function sendRequest<T>(options: RequestOptions): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(buildUrl(options.path, options.query), {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(NETWORK_ERROR_STATUS, NETWORK_ERROR_MESSAGE);
  }

  const payload = await readJson(response);

  if (!response.ok) {
    if (response.status === UNAUTHORIZED_STATUS && token) {
      clearAccessToken();
      unauthorizedHandler?.();
    }
    throw toApiError(response.status, payload);
  }

  return payload as T;
}

export function apiGet<T>(path: string, query?: object, signal?: AbortSignal): Promise<T> {
  return sendRequest<T>({ method: 'GET', path, query, signal });
}

export function apiPost<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  return sendRequest<T>({ method: 'POST', path, body, signal });
}

export function apiPatch<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  return sendRequest<T>({ method: 'PATCH', path, body, signal });
}
