import { apiGet, apiPatch, apiPost } from './client';
import type {
  ApiAuthUser,
  ApiCategory,
  ApiPage,
  ApiProposal,
  ApiProvince,
  ApiProviderDetail,
  ApiProviderSummary,
  ApiRequest,
  ApiSession,
  CreateProposalBody,
  CreateRequestBody,
  LoginBody,
  NeighborhoodsParams,
  ProviderListParams,
  RegisterBody,
  RequestListParams,
  UpdateProviderProfileBody,
} from './types';

function segment(value: string): string {
  return encodeURIComponent(value);
}

export const authApi = {
  register: (body: RegisterBody, signal?: AbortSignal) =>
    apiPost<ApiSession>('/auth/register', body, signal),
  login: (body: LoginBody, signal?: AbortSignal) =>
    apiPost<ApiSession>('/auth/login', body, signal),
  me: (signal?: AbortSignal) => apiGet<ApiAuthUser>('/auth/me', undefined, signal),
};

export const catalogApi = {
  provinces: (signal?: AbortSignal) => apiGet<ApiProvince[]>('/provinces', undefined, signal),
  categories: (signal?: AbortSignal) => apiGet<ApiCategory[]>('/categories', undefined, signal),
};

export const providersApi = {
  list: (params?: ProviderListParams, signal?: AbortSignal) =>
    apiGet<ApiPage<ApiProviderSummary>>('/providers', params, signal),
  neighborhoods: (params?: NeighborhoodsParams, signal?: AbortSignal) =>
    apiGet<string[]>('/providers/neighborhoods', params, signal),
  get: (id: string, signal?: AbortSignal) =>
    apiGet<ApiProviderDetail>(`/providers/${segment(id)}`, undefined, signal),
  me: (signal?: AbortSignal) => apiGet<ApiProviderDetail>('/providers/me', undefined, signal),
  updateMe: (body: UpdateProviderProfileBody, signal?: AbortSignal) =>
    apiPatch<ApiProviderDetail>('/providers/me', body, signal),
};

export const requestsApi = {
  list: (params?: RequestListParams, signal?: AbortSignal) =>
    apiGet<ApiPage<ApiRequest>>('/requests', params, signal),
  get: (id: string, signal?: AbortSignal) =>
    apiGet<ApiRequest>(`/requests/${segment(id)}`, undefined, signal),
  create: (body: CreateRequestBody, signal?: AbortSignal) =>
    apiPost<ApiRequest>('/requests', body, signal),
  cancel: (id: string, signal?: AbortSignal) =>
    apiPatch<ApiRequest>(`/requests/${segment(id)}/cancel`, undefined, signal),
};

export const proposalsApi = {
  listByRequest: (requestId: string, signal?: AbortSignal) =>
    apiGet<ApiProposal[]>(`/requests/${segment(requestId)}/proposals`, undefined, signal),
  create: (requestId: string, body: CreateProposalBody, signal?: AbortSignal) =>
    apiPost<ApiProposal>(`/requests/${segment(requestId)}/proposals`, body, signal),
};
