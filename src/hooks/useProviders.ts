import { useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { providersApi } from '../api/endpoints';
import { mapProviderSummary } from '../api/mappers';
import { useSession } from '../session/SessionContext';
import type { ProviderProfile } from '../types/biscato';

type LoadStatus = 'loading' | 'ready' | 'error';

const PROVIDERS_PAGE_SIZE = 100;

export function useProviders() {
  const { isDemoSession, user } = useSession();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoSession || (import.meta.env.DEV && !user)) {
      setProviders([]);
      setError(null);
      setStatus('ready');
      return;
    }
    const controller = new AbortController();
    providersApi
      .list({ pageSize: PROVIDERS_PAGE_SIZE }, controller.signal)
      .then((page) => {
        setProviders(page.items.map(mapProviderSummary));
        setStatus('ready');
      })
      .catch((caught) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(caught));
        setStatus('error');
      });
    return () => controller.abort();
  }, [isDemoSession, user]);

  return { providers, setProviders, status, error };
}
