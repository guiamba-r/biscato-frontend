/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { AuthView } from './components/AuthView';
import { AdminBackofficeView } from './components/AdminBackofficeView';
import { BusinessModelView } from './components/BusinessModelView';
import { CompareProposalsView } from './components/CompareProposalsView';
import { EscrowView } from './components/EscrowView';
import { ExploreView } from './components/ExploreView';
import { LandingView } from './components/LandingView';
import { Navbar } from './components/Navbar';
import { MessagesView } from './components/MessagesView';
import { NewRequestModal } from './components/NewRequestModal';
import { OpportunitiesView } from './components/OpportunitiesView';
import { ProfileView } from './components/ProfileView';
import { SupportView } from './components/SupportView';
import { ProviderProfileModal } from './components/ProviderProfileModal';
import { ProviderServicesView } from './components/ProviderServicesView';
import {
  INITIAL_ESCROW,
  INITIAL_PROVIDERS,
  INITIAL_PROPOSALS,
  INITIAL_REQUESTS,
} from './data/biscatoData';
import { getErrorMessage } from './api/client';
import { proposalsApi, providersApi, requestsApi } from './api/endpoints';
import { mapProposal, mapProviderDetail, mapRequests } from './api/mappers';
import { useProviders } from './hooks/useProviders';
import { useSession } from './session/SessionContext';
import type {
  AppTab,
  ChatConversation,
  ChatMessage,
  ClientPlanState,
  EscrowTransaction,
  GeoCoordinates,
  PaymentMethodId,
  Proposal,
  ProviderProfile,
  ProviderServiceListing,
  ProviderSubscriptionState,
  ProvinceName,
  ServiceCategoryId,
  ServiceRequest,
  UserRole,
} from './types/biscato';
import type { ApiAuthUser } from './api/types';
import type { CreateRequestBody } from './api/types';

type DataStatus = 'idle' | 'loading' | 'ready' | 'error';

const DEMO_STATE_KEY = 'biscato:frontend-demo:v1';
const PUBLISHED_SERVICES_KEY = 'biscato:published-services:v1';
const CHAT_CONVERSATIONS_KEY = 'biscato:chat-conversations:v1';
const SUPPORT_HISTORY_PREFIX = 'biscato:support-history:v1:';
const ADMIN_PORTAL_HASH = '#/operacoes-biscato-7f3c';
type QuoteProvider = Pick<ProviderProfile, 'id' | 'name' | 'category'>;

interface PersistedDemoState {
  demoProviders: ProviderProfile[];
  selectedRequestId: string;
  escrow: EscrowTransaction;
  clientPlan: ClientPlanState;
  providerSubState: ProviderSubscriptionState;
}

interface AdminSupportThread {
  accountId: string;
  messages: Array<{ id: string; senderName: string; text: string; timestamp: string }>;
}

function isAdminPortalRoute(): boolean {
  return window.location.hash === ADMIN_PORTAL_HASH;
}

function readSupportThreads(): AdminSupportThread[] {
  try {
    return Object.keys(window.localStorage)
      .filter((key) => key.startsWith(SUPPORT_HISTORY_PREFIX))
      .flatMap((key) => {
        const accountId = key.slice(SUPPORT_HISTORY_PREFIX.length);
        const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? '[]');
        if (!Array.isArray(parsed)) return [];
        const messages = parsed.filter((message): message is AdminSupportThread['messages'][number] =>
          typeof message?.id === 'string' && typeof message?.senderName === 'string' &&
          typeof message?.text === 'string' && typeof message?.timestamp === 'string',
        );
        return messages.length ? [{ accountId, messages }] : [];
      });
  } catch {
    return [];
  }
}

function readDemoState(): Partial<PersistedDemoState> {
  try {
    const saved = window.localStorage.getItem(DEMO_STATE_KEY);
    return saved ? JSON.parse(saved) as Partial<PersistedDemoState> : {};
  } catch {
    return {};
  }
}

function readPublishedServices(): ProviderServiceListing[] {
  try {
    const saved = window.localStorage.getItem(PUBLISHED_SERVICES_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((service): service is ProviderServiceListing =>
      typeof service?.id === 'string' &&
      typeof service?.providerId === 'string' &&
      typeof service?.providerName === 'string' &&
      typeof service?.title === 'string' &&
      typeof service?.priceMT === 'number' &&
      (service?.status === 'active' || service?.status === 'paused'),
    );
  } catch {
    return [];
  }
}

function readChatConversations(): ChatConversation[] {
  try {
    const saved = window.localStorage.getItem(CHAT_CONVERSATIONS_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((conversation): conversation is ChatConversation =>
      typeof conversation?.id === 'string' &&
      typeof conversation?.requestId === 'string' &&
      typeof conversation?.requestTitle === 'string' &&
      typeof conversation?.clientId === 'string' &&
      typeof conversation?.clientName === 'string' &&
      typeof conversation?.providerId === 'string' &&
      typeof conversation?.providerName === 'string' &&
      typeof conversation?.updatedAt === 'string' &&
      Array.isArray(conversation?.messages) &&
      conversation.messages.every((message: ChatMessage) =>
        typeof message?.id === 'string' &&
        (message?.sender === 'system' || message?.sender === 'client' || message?.sender === 'provider') &&
        typeof message?.senderName === 'string' &&
        typeof message?.text === 'string' &&
        typeof message?.timestamp === 'string',
      ),
    );
  } catch {
    return [];
  }
}

function providerIsOperational(provider: ProviderProfile): boolean {
  return provider.biVerified && provider.subscriptionState !== 'suspended';
}

function distanceBetweenKm(origin: GeoCoordinates, destination: GeoCoordinates): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export default function App() {
  const { user, logout, isDemoSession, updateUserProfile } = useSession();
  const {
    providers,
    setProviders,
    status: providersStatus,
    error: providersError,
  } = useProviders();

  const [savedDemoState] = useState(readDemoState);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [isAdminPortal, setIsAdminPortal] = useState(isAdminPortalRoute);
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('client');
  const [pendingTab, setPendingTab] = useState<AppTab | null>(null);
  const [clientPlan, setClientPlan] = useState<ClientPlanState>(savedDemoState.clientPlan ?? 'free_trial_30d');
  const [providerSubState, setProviderSubState] = useState<ProviderSubscriptionState>(savedDemoState.providerSubState ?? 'active');
  const [demoProviders, setDemoProviders] = useState<ProviderProfile[]>(savedDemoState.demoProviders ?? INITIAL_PROVIDERS);
  const [demoRequests, setDemoRequests] = useState<ServiceRequest[]>(() => INITIAL_REQUESTS.map((request) => ({
    ...request,
    clientId: 'demo-client',
  })));
  const [demoProposals, setDemoProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [publishedServices, setPublishedServices] = useState<ProviderServiceListing[]>(readPublishedServices);
  const [conversations, setConversations] = useState<ChatConversation[]>(readChatConversations);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [providerAccountProfile, setProviderAccountProfile] = useState<ProviderProfile | null>(null);
  const [clientCoordinates, setClientCoordinates] = useState<GeoCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [requestsStatus, setRequestsStatus] = useState<DataStatus>('idle');
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalProviders, setProposalProviders] = useState<ProviderProfile[]>([]);
  const [proposalsStatus, setProposalsStatus] = useState<DataStatus>('idle');
  const [proposalsError, setProposalsError] = useState<string | null>(null);
  const [proposalsReloadKey, setProposalsReloadKey] = useState(0);
  const [providerProposedRequestIds, setProviderProposedRequestIds] = useState<string[]>([]);
  const [requestsReloadKey, setRequestsReloadKey] = useState(0);
  const [selectedRequestId, setSelectedRequestId] = useState<string>(savedDemoState.selectedRequestId ?? '');
  const [escrow, setEscrow] = useState<EscrowTransaction>(savedDemoState.escrow ?? INITIAL_ESCROW);

  const [profileModalProvider, setProfileModalProvider] = useState<ProviderProfile | null>(null);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [newRequestCategory, setNewRequestCategory] = useState<Exclude<ServiceCategoryId, 'all'> | undefined>(undefined);
  const [targetProvider, setTargetProvider] = useState<QuoteProvider | null>(null);
  const [pendingRequest, setPendingRequest] = useState<{
    category: Exclude<ServiceCategoryId, 'all'>;
    provider: QuoteProvider | null;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const syncAdminRoute = () => setIsAdminPortal(isAdminPortalRoute());
    window.addEventListener('hashchange', syncAdminRoute);
    return () => window.removeEventListener('hashchange', syncAdminRoute);
  }, []);

  useEffect(() => {
    if (!isAdminPortal) return;
    if (!user) {
      setPendingTab('business');
      setActiveTab('auth');
      return;
    }
    if (user.role === 'admin') {
      setActiveTab('business');
      return;
    }
    logout();
    setActiveTab('auth');
    notify('Esta conta não tem autorização para o portal de operação.');
  }, [isAdminPortal, user?.id, user?.role]);

  useEffect(() => {
    try {
      const state: PersistedDemoState = {
        demoProviders, selectedRequestId, escrow, clientPlan, providerSubState,
      };
      window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
    } catch {
      // The demo remains usable when browser storage is unavailable.
    }
  }, [demoProviders, selectedRequestId, escrow, clientPlan, providerSubState]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PUBLISHED_SERVICES_KEY, JSON.stringify(publishedServices));
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
  }, [publishedServices]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAT_CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch {
      // Keep messages available in memory if browser storage is unavailable.
    }
  }, [conversations]);

  useEffect(() => {
    const syncConversations = (event: StorageEvent) => {
      if (event.key === CHAT_CONVERSATIONS_KEY) setConversations(readChatConversations());
    };
    window.addEventListener('storage', syncConversations);
    return () => window.removeEventListener('storage', syncConversations);
  }, []);

  const updateProviderData = (
    updater: (current: ProviderProfile[]) => ProviderProfile[],
  ) => {
    setProviders(updater);
    setDemoProviders(updater);
  };

  const providersWithMockData = useMemo(
    () => [...providers, ...demoProviders],
    [providers, demoProviders],
  );

  const supportThreads = useMemo(() => readSupportThreads(), [activeTab, isAdminPortal]);
  const adminProviders = useMemo(
    () => Array.from(new Map(providersWithMockData.map((provider) => [provider.id, provider])).values()),
    [providersWithMockData],
  );
  const adminRequests = requests.length > 0 ? requests : demoRequests;

  useEffect(() => {
    if (user) setUserRole(user.role === 'provider' ? 'provider' : 'client');
  }, [user]);

  useEffect(() => {
    setClientCoordinates(null);
    setLocationError(null);
  }, [user?.id]);

  const requestClientLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Este navegador não disponibiliza a localização.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setClientCoordinates({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationError(null);
        notify('Localização activa. A lista considera prestadores disponíveis até 10 km.');
      },
      () => setLocationError('Não foi possível obter a localização. Autorize o acesso ou tente novamente.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  useEffect(() => {
    if (!user || user.role !== 'provider' || isDemoSession) {
      setProviderAccountProfile(null);
      return;
    }
    const controller = new AbortController();
    providersApi.me(controller.signal)
      .then((profile) => setProviderAccountProfile(mapProviderDetail(profile)))
      .catch(() => undefined);
    return () => controller.abort();
  }, [user?.id, user?.role, isDemoSession]);

  useEffect(() => {
    if (user || !['opportunities', 'proposals', 'messages', 'profile', 'escrow', 'business'].includes(activeTab)) return;
    setPendingTab(activeTab);
    setAuthInitialRole(activeTab === 'opportunities' ? 'provider' : 'client');
    setActiveTab('auth');
    notify('A sua sessão terminou. Entre novamente para continuar.');
  }, [user, activeTab]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  useEffect(() => {
    if (!user || !['opportunities', 'proposals'].includes(activeTab)) {
      if (!user) {
        setRequests([]);
        setProposals([]);
        setProposalProviders([]);
        setProviderProposedRequestIds([]);
        setRequestsStatus('idle');
        setProposalsStatus('idle');
      }
      return;
    }

    if (isDemoSession) {
      const visibleRequests = user.role === 'provider'
        ? demoRequests.filter((request) => request.status === 'open')
        : demoRequests.filter((request) => request.clientId === user.id);
      setRequests(visibleRequests);
      setProviderProposedRequestIds(user.role === 'provider' && user.providerId
        ? demoProposals
          .filter((proposal) => proposal.providerId === user.providerId)
          .map((proposal) => proposal.requestId)
        : []);
      setRequestsError(null);
      setRequestsStatus('ready');
      return;
    }

    const controller = new AbortController();
    let isCurrent = true;
    const loadRequests = async (showLoading = false) => {
      if (showLoading) setRequestsStatus((current) => current === 'ready' ? 'ready' : 'loading');
      try {
        const params = user.role === 'provider'
          ? { status: 'open' as const, pageSize: 100 }
          : { mine: true, pageSize: 100 };
        const page = await requestsApi.list(params, controller.signal);
        if (!isCurrent) return;
        const mappedRequests = mapRequests(page.items).map((request) =>
          user.role === 'client' ? { ...request, clientId: user.id } : request,
        );
        setRequests(mappedRequests);
        if (user.role === 'provider' && activeTab === 'opportunities') {
          const proposalResults = await Promise.allSettled(mappedRequests.map((request) =>
            proposalsApi.listByRequest(request.id, controller.signal),
          ));
          if (!isCurrent) return;
          const ownRequestIds = proposalResults.flatMap((result, index) =>
            result.status === 'fulfilled' && result.value.some((proposal) => proposal.providerId === user.providerId)
              ? [mappedRequests[index].id]
              : [],
          );
          setProviderProposedRequestIds(ownRequestIds);
        }
        setRequestsError(null);
        setRequestsStatus('ready');
      } catch (caught) {
        if (!isCurrent || controller.signal.aborted) return;
        setRequestsError(getErrorMessage(caught));
        setRequestsStatus('error');
      }
    };

    void loadRequests(true);
    const refreshOnFocus = () => void loadRequests();
    window.addEventListener('focus', refreshOnFocus);
    const interval = activeTab === 'opportunities'
      ? window.setInterval(() => void loadRequests(), 30000)
      : undefined;

    return () => {
      isCurrent = false;
      controller.abort();
      window.removeEventListener('focus', refreshOnFocus);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [user?.id, user?.role, user?.providerId, activeTab, requestsReloadKey, isDemoSession, demoRequests, demoProposals]);

  useEffect(() => {
    if (!user || user.role !== 'client' || activeTab !== 'proposals' || requestsStatus !== 'ready') return;
    if (!requests.length) {
      setSelectedRequestId('');
      setProposals([]);
      setProposalProviders([]);
      setProposalsError(null);
      setProposalsStatus('ready');
      return;
    }

    const activeRequestId = requests.some((request) => request.id === selectedRequestId)
      ? selectedRequestId
      : requests[0].id;
    if (activeRequestId !== selectedRequestId) setSelectedRequestId(activeRequestId);

    if (isDemoSession) {
      const requestProposals = demoProposals.filter((proposal) => proposal.requestId === activeRequestId);
      setProposals(requestProposals);
      setProposalProviders(requestProposals.flatMap((proposal) => {
        const provider = providersWithMockData.find((item) => item.id === proposal.providerId);
        return provider ? [provider] : [];
      }));
      setProposalsError(null);
      setProposalsStatus('ready');
      return;
    }

    const controller = new AbortController();
    let isCurrent = true;
    const loadProposals = async (showLoading = false) => {
      if (showLoading) setProposalsStatus((current) => current === 'ready' ? 'ready' : 'loading');
      try {
        const items = await proposalsApi.listByRequest(activeRequestId, controller.signal);
        if (!isCurrent) return;
        const mappedItems = items.map(mapProposal);
        setProposals(mappedItems.map((item) => item.proposal));
        setProposalProviders(mappedItems.map((item) => item.provider));
        setProposalsError(null);
        setProposalsStatus('ready');
      } catch (caught) {
        if (!isCurrent || controller.signal.aborted) return;
        setProposalsError(getErrorMessage(caught));
        setProposalsStatus('error');
      }
    };
    void loadProposals(true);
    const refreshOnFocus = () => void loadProposals();
    window.addEventListener('focus', refreshOnFocus);
    const interval = window.setInterval(() => void loadProposals(), 30000);
    return () => {
      isCurrent = false;
      controller.abort();
      window.removeEventListener('focus', refreshOnFocus);
      window.clearInterval(interval);
    };
  }, [user?.id, user?.role, activeTab, requestsStatus, selectedRequestId, requests, proposalsReloadKey, isDemoSession, demoProposals, providersWithMockData]);

  const handleAuthenticated = (authenticatedUser: ApiAuthUser) => {
    if (pendingRequest) {
      if (authenticatedUser.role !== 'client') {
        setPendingRequest(null);
        setActiveTab('home');
        notify('Esta ação está disponível apenas para contas de cliente.');
        return;
      }
      setNewRequestCategory(pendingRequest.category);
      setTargetProvider(pendingRequest.provider);
      setPendingRequest(null);
      setIsNewRequestOpen(true);
      setActiveTab('explore');
      notify('Sessão iniciada. Complete os dados do seu pedido de orçamento.');
      return;
    }
    if (authenticatedUser.id.startsWith('demo-')) {
      setPendingTab(null);
      setActiveTab(authenticatedUser.role === 'provider' ? 'opportunities' : 'proposals');
      notify('Sessão de demonstração iniciada. Os dados são fictícios e ficam neste navegador.');
      return;
    }
    const destination = pendingTab;
    setPendingTab(null);
    if (destination && canEnterTab(destination, authenticatedUser)) {
      setActiveTab(destination);
      notify('Sessão iniciada com sucesso.');
      return;
    } else {
      setActiveTab('explore');
      if (destination) {
        notify('Sessão iniciada, mas esta conta não tem acesso a essa área.');
        return;
      }
    }
    notify('Sessão iniciada com sucesso.');
  };

  const handleLogout = () => {
    logout();
    setPendingRequest(null);
    setPendingTab(null);
    setIsNewRequestOpen(false);
    setActiveTab('home');
    notify('Sessão terminada.');
  };

  const handleOpenNewRequest = (
    initialCategory?: Exclude<ServiceCategoryId, 'all'>,
    provider?: QuoteProvider
  ) => {
    const category = initialCategory ?? provider?.category ?? 'canalizacao';
    if (!user) {
      setPendingRequest({ category, provider: provider ?? null });
      setPendingTab(null);
      setAuthInitialRole('client');
      setActiveTab('auth');
      notify('Inicie sessão ou crie uma conta para pedir um orçamento.');
      return;
    }
    if (user.role !== 'client') {
      notify('Pedir orçamento está disponível apenas para contas de cliente.');
      return;
    }
    if (!clientCoordinates && !isDemoSession) {
      setActiveTab('explore');
      notify('Partilhe a localização no início para ver e pedir serviços num raio de até 10 km.');
      return;
    }
    if (provider && !isDemoSession && !publicProviders.some((item) => item.id === provider.id)) {
      notify('Este prestador não tem localização confirmada dentro do raio de 10 km.');
      return;
    }
    setNewRequestCategory(category);
    setTargetProvider(provider ?? null);
    setIsNewRequestOpen(true);
  };

  const handlePublishService = (payload: Pick<ProviderServiceListing,
    'title' | 'category' | 'province' | 'neighborhood' | 'priceMT' | 'description'
  >): boolean => {
    if (!user || user.role !== 'provider' || !user.providerId || !currentProvider) {
      notify('Entre como prestador para publicar um serviço.');
      return false;
    }
    if (!providerIsOperational(currentProvider)) {
      notify('Verifique o seu perfil e a subscrição antes de publicar serviços.');
      return false;
    }
    const service: ProviderServiceListing = {
      ...payload,
      id: `service-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      providerId: user.providerId,
      providerName: currentProvider.name,
      providerInitials: currentProvider.initials,
      publishedAt: new Date().toLocaleDateString('pt-MZ'),
      status: 'active',
    };
    setPublishedServices((previous) => [service, ...previous]);
    notify('Serviço publicado e disponível na vitrine dos clientes neste navegador.');
    return true;
  };

  const canManageService = (service: ProviderServiceListing) =>
    !!user && user.role === 'provider' && user.providerId === service.providerId;

  const handleToggleServiceStatus = (serviceId: string) => {
    const service = publishedServices.find((item) => item.id === serviceId);
    if (!service || !canManageService(service)) {
      notify('Só o prestador responsável pode alterar este anúncio.');
      return;
    }
    setPublishedServices((previous) => previous.map((item) => item.id === serviceId
      ? { ...item, status: item.status === 'active' ? 'paused' : 'active' }
      : item,
    ));
  };

  const handleDeleteService = (serviceId: string) => {
    const service = publishedServices.find((item) => item.id === serviceId);
    if (!service || !canManageService(service)) {
      notify('Só o prestador responsável pode remover este anúncio.');
      return;
    }
    setPublishedServices((previous) => previous.filter((item) => item.id !== serviceId));
    notify('Anúncio removido.');
  };

  const handleRequestPublishedService = (service: ProviderServiceListing) => {
    handleOpenNewRequest(service.category, {
      id: service.providerId,
      name: service.providerName,
      category: service.category,
    });
  };

  const handleStartConversation = (
    proposal: Proposal,
    request: ServiceRequest,
    provider: ProviderProfile,
  ) => {
    if (!user || user.role !== 'client' || !ownsRequest(request, user)) {
      notify('Só o cliente responsável pelo pedido pode iniciar esta conversa.');
      if (!user) navigateToTab('proposals');
      return;
    }
    if (proposal.requestId !== request.id || proposal.providerId !== provider.id) {
      notify('Esta proposta não corresponde ao prestador ou pedido seleccionado.');
      return;
    }
    const conversationId = `${request.id}::${provider.id}`;
    const existing = conversations.find((item) => item.id === conversationId && item.clientId === user.id);
    if (!existing) {
      const now = new Date();
      const introMessage: ChatMessage = {
        id: `msg-intro-${now.getTime()}`,
        sender: 'system',
        senderName: 'Biscato',
        text: `Conversa iniciada sobre o pedido “${request.title}” e a proposta de ${provider.name}.`,
        timestamp: now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      };
      const conversation: ChatConversation = {
        id: conversationId,
        requestId: request.id,
        requestTitle: request.title,
        clientId: user.id,
        clientName: user.fullName,
        providerId: provider.id,
        providerName: provider.name,
        updatedAt: now.toISOString(),
        messages: [introMessage],
      };
      setConversations((previous) => [conversation, ...previous]);
    }
    setSelectedConversationId(conversationId);
    setActiveTab('messages');
  };

  const handleSendConversationMessage = (conversationId: string, text: string) => {
    if (!user || (user.role !== 'client' && user.role !== 'provider') || !text.trim()) return;
    const conversation = conversations.find((item) => item.id === conversationId);
    const isParticipant = conversation && (
      (user.role === 'client' && conversation.clientId === user.id) ||
      (user.role === 'provider' && conversation.providerId === user.providerId)
    );
    if (!conversation || !isParticipant) {
      notify('Esta conversa não pertence a esta conta.');
      return;
    }
    const now = new Date();
    const message: ChatMessage = {
      id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: user.role,
      senderName: user.fullName,
      text: text.trim().slice(0, 1000),
      timestamp: now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
    };
    setConversations((previous) => previous.map((item) => item.id === conversationId
      ? { ...item, updatedAt: now.toISOString(), messages: [...item.messages, message] }
      : item,
    ));
  };

  const handleSaveAccountProfile = (fullName: string, phone: string) => {
    updateUserProfile({ fullName, phone: phone || null });
    notify('Dados da conta guardados neste navegador.');
  };

  const handleSaveProviderProfile = async (
    updates: Parameters<typeof providersApi.updateMe>[0],
  ): Promise<boolean> => {
    if (!user || user.role !== 'provider' || !currentProvider) {
      notify('Só o prestador responsável pode editar este perfil.');
      return false;
    }
    try {
      const updatedProvider = isDemoSession
        ? { ...currentProvider, ...updates, category: updates.category as ProviderProfile['category'], province: updates.province as ProvinceName }
        : mapProviderDetail(await providersApi.updateMe(updates));
      setProviderAccountProfile(updatedProvider);
      updateProviderData((previous) => previous.map((provider) => provider.id === updatedProvider.id ? updatedProvider : provider));
      notify(isDemoSession ? 'Perfil profissional actualizado neste navegador.' : 'Perfil profissional actualizado.');
      return true;
    } catch (caught) {
      notify(getErrorMessage(caught));
      return false;
    }
  };

  const handleCreateRequest = async (
    payload: Omit<ServiceRequest, 'id' | 'status' | 'publishedLabel' | 'distanceKm' | 'clientVerified'>
  ): Promise<boolean> => {
    if (!user) {
      setPendingRequest({ category: payload.category, provider: targetProvider });
      setPendingTab(null);
      setAuthInitialRole('client');
      setIsNewRequestOpen(false);
      setActiveTab('auth');
      notify('Inicie sessão ou crie uma conta antes de publicar o pedido.');
      return false;
    }
    if (user.role !== 'client') {
      setIsNewRequestOpen(false);
      notify('Só uma conta de cliente pode publicar um pedido.');
      return false;
    }
    if (!clientCoordinates && !isDemoSession) {
      notify('A localização é necessária para limitar o pedido a 10 km.');
      return false;
    }
    if (targetProvider && !isDemoSession && !publicProviders.some((provider) => provider.id === targetProvider.id)) {
      notify('O prestador seleccionado não está confirmado no raio de 10 km.');
      return false;
    }
    if (isDemoSession) {
      const demoRequest: ServiceRequest = {
        ...payload,
        id: `demo-request-${Date.now()}`,
        clientId: user.id,
        status: 'open',
        distanceKm: null,
        publishedLabel: 'Publicado agora',
        clientVerified: true,
        proposalsCount: 0,
      };
      setDemoRequests((previous) => [demoRequest, ...previous]);
      setRequests((previous) => [demoRequest, ...previous]);
      setRequestsStatus('ready');
      setRequestsError(null);
      setSelectedRequestId(demoRequest.id);
      setProposals([]);
      setProposalProviders([]);
      setProposalsStatus('ready');
      setActiveTab('proposals');
      notify('Pedido de demonstração publicado. O prestador demo já pode propor um orçamento.');
      return true;
    }
    const body: CreateRequestBody = {
      title: payload.title,
      category: payload.category,
      province: payload.province,
      neighborhood: payload.neighborhood,
      urgency: payload.urgency,
      budgetMinMT: payload.budgetMinMT,
      budgetMaxMT: payload.budgetMaxMT,
      description: payload.description,
      ...(targetProvider ? { targetProviderId: targetProvider.id } : {}),
    };

    try {
      const response = await requestsApi.create(body);
      const createdRequest = mapRequests([response])[0];
      if (!createdRequest) throw new Error('A resposta do pedido não é válida.');
      const ownedRequest = { ...createdRequest, clientId: user.id };
      setRequests((previous) => [ownedRequest, ...previous.filter((request) => request.id !== ownedRequest.id)]);
      setRequestsStatus('ready');
      setRequestsError(null);
      setSelectedRequestId(ownedRequest.id);
      setProposals([]);
      setProposalProviders([]);
      setProposalsStatus('ready');
      setActiveTab('proposals');
      notify('Pedido publicado. Os prestadores já podem enviar propostas.');
      return true;
    } catch (caught) {
      notify(getErrorMessage(caught));
      return false;
    }
  };

  const handleSubmitProposal = async (
    requestId: string,
    _providerId: string,
    priceMT: number,
    deadlineDays: number,
    note: string
  ): Promise<boolean> => {
    if (!user) {
      navigateToTab('opportunities');
      return false;
    }
    if (user.role !== 'provider' || !currentProvider || !providerIsOperational(currentProvider)) {
      notify('Só prestadores verificados, com subscrição activa ou em tolerância, podem enviar propostas.');
      return false;
    }
    if (!user.providerId) {
      notify('O perfil de prestador ainda não está associado a esta conta.');
      return false;
    }
    const request = requests.find((item) => item.id === requestId);
    if (!request || request.status !== 'open' || request.acceptedProposalId) {
      notify('Este pedido já não está aberto para novas propostas.');
      return false;
    }
    if (escrow.requestId === requestId && ['awaiting_payment', 'funds_held', 'in_execution', 'provider_completed'].includes(escrow.stage)) {
      notify('Este pedido já tem uma proposta selecionada e está em processo de pagamento ou execução.');
      return false;
    }
    if (providerProposedRequestIds.includes(requestId)) {
      notify('Este prestador já submeteu uma proposta para o pedido.');
      return false;
    }
    if (!Number.isFinite(priceMT) || priceMT < 200 || !Number.isInteger(deadlineDays) || deadlineDays < 1 || deadlineDays > 60 || !note.trim() || note.trim().length > 1000) {
      notify('Indique um preço a partir de 200 MT, prazo de 1 a 60 dias e condições até 1000 caracteres.');
      return false;
    }

    if (isDemoSession) {
      const demoProposal: Proposal = {
        id: `demo-proposal-${Date.now()}`,
        requestId,
        providerId: user.providerId,
        priceMT,
        deadlineDays,
        note: note.trim(),
        isBestMatch: false,
        createdAt: 'Agora',
      };
      setDemoProposals((previous) => [...previous, demoProposal]);
      setProposalProviders((previous) => [currentProvider, ...previous.filter((provider) => provider.id !== currentProvider.id)]);
      setProposals((previous) => [...previous, demoProposal]);
      setProviderProposedRequestIds((previous) => previous.includes(requestId) ? previous : [...previous, requestId]);
      const updateRequestCount = (items: ServiceRequest[]) => items.map((item) =>
        item.id === requestId ? { ...item, proposalsCount: (item.proposalsCount ?? 0) + 1 } : item,
      );
      setRequests(updateRequestCount);
      setDemoRequests(updateRequestCount);
      notify('Proposta de demonstração enviada ao cliente.');
      return true;
    }

    try {
      const response = await proposalsApi.create(requestId, {
        priceMT,
        deadlineDays,
        note: note.trim(),
      });
      const mappedProposal = mapProposal(response).proposal;
      setProposalProviders((previous) => [currentProvider, ...previous.filter((provider) => provider.id !== currentProvider.id)]);
      setProviderProposedRequestIds((previous) => previous.includes(requestId) ? previous : [...previous, requestId]);
      setRequests((previous) => previous.map((item) =>
        item.id === requestId
          ? { ...item, proposalsCount: (item.proposalsCount ?? 0) + 1 }
          : item,
      ));
      notify('Proposta enviada ao cliente.');
      return !!mappedProposal.id;
    } catch (caught) {
      notify(getErrorMessage(caught));
      return false;
    }
  };

  const handleAcceptProposal = (
    proposal: Proposal,
    request: ServiceRequest,
    provider: ProviderProfile
  ) => {
    if (!user || user.role !== 'client' || !ownsRequest(request, user)) {
      notify('Só o cliente responsável pelo pedido pode aceitar uma proposta.');
      if (!user) navigateToTab('proposals');
      return;
    }
    const currentRequest = requests.find((item) => item.id === request.id);
    const currentProposal = proposals.find((item) => item.id === proposal.id && item.requestId === request.id);
    if (
      !currentRequest ||
      currentRequest.status !== 'open' ||
      currentRequest.acceptedProposalId ||
      !currentProposal ||
      currentProposal.providerId !== provider.id ||
      (escrow.requestId === request.id && ['awaiting_payment', 'funds_held', 'in_execution', 'provider_completed'].includes(escrow.stage))
    ) {
      notify('Este pedido ou proposta já não está disponível.');
      return;
    }
    const effectiveSubState =
      provider.id === escrow.providerId ? providerSubState : provider.subscriptionState;
    const isTolerance = effectiveSubState === 'tolerance_30d';
    const appliedFeePercent = isTolerance ? 10 : 0;
    const feeReason = isTolerance
      ? 'Período de tolerância de 30 dias ativo: aplicada taxa de 10% por transação ao prestador.'
      : 'Subscrição mensal do prestador em dia (0% taxa extra de atraso).';

    const creditsOnRelease = Math.max(15, Math.round(proposal.priceMT / 100));

    setEscrow({
      id: `ESC-2026-${proposal.priceMT}`,
      requestId: request.id,
      proposalId: proposal.id,
      providerId: provider.id,
      serviceTitle: request.title,
      amountMT: proposal.priceMT,
      paymentMethod: 'mpesa',
      stage: 'awaiting_payment',
      expectedCompletion: `Em ${proposal.deadlineDays} ${proposal.deadlineDays === 1 ? 'dia' : 'dias'}`,
      appliedFeePercent,
      feeReason,
      warrantyCoveragePercent: 50,
      creditsEarnedOnRelease: creditsOnRelease,
      messages: [
        {
          id: `msg-sys-${Date.now()}`,
          sender: 'system',
          senderName: 'Custódia Biscato',
          text: `Proposta de ${provider.name} selecionada. Selecione M-Pesa ou e-Mola para simular o pagamento em custódia.`,
          timestamp: 'Agora',
        },
      ],
    });

    setRequests((prev) => prev.map((item) =>
      item.id === request.id ? { ...item, acceptedProposalId: proposal.id } : item,
    ));

    setActiveTab('escrow');
    notify('Proposta selecionada. Conclua o pagamento em custódia para iniciar.');
  };

  const handleFundEscrow = ({ method, phone }: { method: PaymentMethodId; phone: string }) => {
    if (!user || user.role !== 'client' || !ownsEscrow(user)) {
      notify('Só o cliente responsável pelo serviço pode iniciar o pagamento.');
      if (!user) navigateToTab('escrow');
      return;
    }
    if (escrow.stage !== 'awaiting_payment') {
      notify('O pagamento só pode ser iniciado depois de selecionar uma proposta.');
      return;
    }
    const nowTime = new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });

    setEscrow((prev) => ({
      ...prev,
      paymentMethod: method,
      stage: 'in_execution',
      heldAt: `Hoje, ${nowTime}`,
      messages: [
        ...prev.messages,
        {
          id: `msg-fund-${Date.now()}`,
          sender: 'system',
          senderName: 'Custódia Biscato',
          text: `Simulação de pagamento concluída por ${method} para o número terminado em ${phone.replace(/\D/g, '').slice(-4)}. A custódia foi actualizada apenas neste frontend.`,
          timestamp: nowTime,
        },
        {
          id: `msg-prov-${Date.now() + 1}`,
          sender: 'provider',
          senderName: escrowProvider.name,
          text: 'O fluxo de demonstração foi concluído. Este estado local não confirma um pagamento real.',
          timestamp: nowTime,
        },
      ],
    }));

    setRequests((prev) =>
      prev.map((r) => (r.id === escrow.requestId ? { ...r, status: 'in_escrow' } : r))
    );
    notify('Simulação concluída. Nenhum valor foi debitado.');
  };

  const handleSendMessage = (text: string) => {
    if (!user || !canParticipateInEscrow(user) || !text.trim()) {
      notify('Só as pessoas envolvidas neste serviço podem enviar mensagens.');
      if (!user) navigateToTab('escrow');
      return;
    }
    const nowTime = new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    setEscrow((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: `msg-${Date.now()}`,
          sender: user.role === 'client' ? 'client' : 'provider',
          senderName: user.fullName,
          text,
          timestamp: nowTime,
        },
      ],
    }));
  };

  const handleDeclareCompletion = () => {
    if (!user || user.role !== 'provider' || user.providerId !== escrow.providerId || !canParticipateInEscrow(user)) {
      notify('Só o prestador associado a este serviço pode declarar a conclusão.');
      if (!user) navigateToTab('escrow');
      return;
    }
    if (escrow.stage !== 'in_execution') {
      notify('A conclusão só pode ser declarada durante a execução do serviço.');
      return;
    }
    const nowTime = new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    setEscrow((prev) => ({
      ...prev,
      stage: 'provider_completed',
      messages: [
        ...prev.messages,
        {
          id: `msg-complete-${Date.now()}`,
          sender: 'system',
          senderName: 'Biscato',
          text: `${user.fullName} declarou o serviço concluído. O cliente pode confirmar ou abrir uma mediação.`,
          timestamp: nowTime,
        },
      ],
    }));
    notify('Conclusão declarada. O cliente foi informado para confirmar ou reportar um problema.');
  };

  const handleReleaseEscrow = (rating: number, reviewText: string) => {
    if (!user || user.role !== 'client' || !ownsEscrow(user)) {
      notify('Só o cliente responsável pelo serviço pode confirmar a conclusão.');
      if (!user) navigateToTab('escrow');
      return;
    }
    if (escrow.stage !== 'provider_completed') {
      notify('O prestador precisa declarar a conclusão antes da confirmação do cliente.');
      return;
    }
    const nowTime = new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });

    setEscrow((prev) => ({
      ...prev,
      stage: 'released',
      releasedAt: `Hoje, ${nowTime}`,
      clientRating: rating,
      clientReviewText: reviewText,
      messages: [
        ...prev.messages,
        {
          id: `msg-rel-${Date.now()}`,
          sender: 'system',
          senderName: 'Custódia Biscato',
          text: `Conclusão confirmada! Valor libertado e +${prev.creditsEarnedOnRelease} créditos atribuídos ao prestador.`,
          timestamp: nowTime,
        },
      ],
    }));

    updateProviderData((prev) =>
      prev.map((p) =>
        p.id === escrow.providerId
          ? {
              ...p,
              completedJobs: p.completedJobs + 1,
              reviewsCount: p.reviewsCount + 1,
              creditsBalance: (p.creditsBalance ?? 0) + escrow.creditsEarnedOnRelease,
              reviews: [
                {
                  id: `rev-${Date.now()}`,
                  clientName: 'Cliente Verificado',
                  rating,
                  dateLabel: 'Agora mesmo',
                  serviceTitle: escrow.serviceTitle,
                  comment: reviewText,
                },
                ...p.reviews,
              ],
            }
          : p
      )
    );

    setRequests((prev) =>
      prev.map((r) => (r.id === escrow.requestId ? { ...r, status: 'completed' } : r))
    );
    notify('Pagamento libertado e avaliação registada!');
  };

  const handleOpenDispute = (reason: string) => {
    if (!user || user.role !== 'client' || !ownsEscrow(user)) {
      notify('Só o cliente responsável pelo serviço pode abrir uma mediação.');
      if (!user) navigateToTab('escrow');
      return;
    }
    if (escrow.stage !== 'provider_completed' || !reason.trim()) {
      notify('A mediação exige a conclusão declarada pelo prestador e uma descrição do problema.');
      return;
    }
    const nowTime = new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    setEscrow((prev) => ({
      ...prev,
      stage: 'disputed',
      disputeReason: reason,
      messages: [
        ...prev.messages,
        {
          id: `msg-disp-${Date.now()}`,
          sender: 'system',
          senderName: 'Mediação Biscato',
          text: `Mediação aberta: "${reason}". Valor congelado para verificação de reembolso ou cobertura até 50%.`,
          timestamp: nowTime,
        },
      ],
    }));
    notify('Mediação Biscato aberta. O valor permanece bloqueado em segurança.');
  };

  const handleChangeProviderSubState = (newState: ProviderSubscriptionState) => {
    if (!user || user.role !== 'admin') {
      notify('Esta configuração está disponível apenas para a equipa de operação.');
      return;
    }
    setProviderSubState(newState);
    updateProviderData((prev) =>
      prev.map((p) => (p.id === escrow.providerId ? { ...p, subscriptionState: newState } : p))
    );
    setEscrow((prev) => ({
      ...prev,
      appliedFeePercent: newState === 'tolerance_30d' ? 10 : 0,
      feeReason:
        newState === 'tolerance_30d'
          ? 'Período de tolerância de 30 dias ativo: aplicada taxa de 10% por transação.'
          : newState === 'suspended'
            ? 'Perfil suspenso após 30 dias sem regularização da mensalidade.'
            : 'Subscrição mensal do prestador em dia (0% taxa extra de atraso).',
    }));
  };

  const handleRedeemCredits = (cost: number, itemLabel: string) => {
    if (!user || user.role !== 'admin') {
      notify('O resgate de créditos exige uma sessão autorizada de operação.');
      return;
    }
    const currentBalance = escrowProvider.creditsBalance ?? 0;
    if (!Number.isFinite(cost) || cost <= 0 || currentBalance < cost) {
      notify('Saldo de créditos insuficiente para este resgate.');
      return;
    }
    updateProviderData((prev) =>
      prev.map((p) =>
        p.id === escrow.providerId
          ? { ...p, creditsBalance: Math.max(0, (p.creditsBalance ?? 0) - cost) }
          : p
      )
    );
    notify(`Créditos convertidos em ${itemLabel}!`);
  };

  const escrowProvider =
    providersWithMockData.find((p) => p.id === escrow.providerId) ?? INITIAL_PROVIDERS[0];
  const currentProvider = user?.role === 'provider' && user.providerId
    ? (providerAccountProfile?.id === user.providerId
      ? providerAccountProfile
      : providersWithMockData.find((provider) => provider.id === user.providerId) ?? null)
    : null;

  const ownsRequest = (request: ServiceRequest, account: ApiAuthUser) =>
    account.role === 'client' && request.clientId === account.id;

  const ownsEscrow = (account: ApiAuthUser) => {
    const request = requests.find((item) => item.id === escrow.requestId);
    return !!request && ownsRequest(request, account);
  };

  const canParticipateInEscrow = (account: ApiAuthUser) =>
    ownsEscrow(account) || (account.role === 'provider' && account.providerId === escrow.providerId);

  const canEnterTab = (tab: AppTab, account: ApiAuthUser | null = user): boolean => {
    if (tab === 'home' || tab === 'explore' || tab === 'auth' || tab === 'support') return true;
    if (tab === 'services') return true;
    if (!account) return false;
    if (tab === 'messages' || tab === 'profile') return account.role === 'client' || account.role === 'provider';
    if (tab === 'opportunities') {
      const profile = account.providerId
        ? providersWithMockData.find((provider) => provider.id === account.providerId)
        : undefined;
      return account.role === 'provider' && !!profile && providerIsOperational(profile);
    }
    if (tab === 'proposals') return account.role === 'client';
    if (tab === 'escrow') return canParticipateInEscrow(account);
    if (tab === 'business') return account.role === 'admin';
    return false;
  };

  const navigateToTab = (tab: AppTab, account: ApiAuthUser | null = user) => {
    if (tab === 'home' || tab === 'explore' || tab === 'auth' || tab === 'support') {
      setActiveTab(tab);
      return;
    }
    if (!account) {
      setPendingTab(tab);
      setAuthInitialRole(tab === 'opportunities' ? 'provider' : 'client');
      setActiveTab('auth');
      notify('Inicie sessão para aceder a esta área.');
      return;
    }
    if (!canEnterTab(tab, account)) {
      const message = tab === 'opportunities'
        ? 'Esta área é para prestadores verificados com subscrição activa ou em tolerância.'
        : tab === 'proposals'
          ? 'A comparação de propostas está disponível apenas para clientes.'
          : tab === 'escrow'
            ? 'Não encontrámos um serviço associado a esta conta.'
            : 'Esta área está reservada à equipa de operação.';
      notify(message);
      return;
    }
    setPendingTab(null);
    setActiveTab(tab);
  };

  const showProvidersNotice = activeTab === 'home' || activeTab === 'explore';
  const publicProviders = providersWithMockData.filter((provider) => {
    if (!provider.biVerified || !providerIsOperational(provider) || provider.isAvailable === false) return false;
    if (user?.role !== 'client' || isDemoSession) return true;
    if (!clientCoordinates || !provider.coordinates) return false;
    return distanceBetweenKm(clientCoordinates, provider.coordinates) <= 10;
  });

  return (
    <div className="editorial-shell min-h-screen flex flex-col text-[#162820]">
      {!isAdminPortal && <Navbar
        activeTab={activeTab}
        userName={user?.fullName ?? null}
        userRole={user?.role ?? null}
        canAccessEscrow={!!user && canParticipateInEscrow(user)}
        onSelectTab={navigateToTab}
        onOpenNewRequest={() => handleOpenNewRequest()}
        onLogin={() => {
          setPendingTab(null);
          setAuthInitialRole('client');
          setActiveTab('auth');
        }}
        onLogout={handleLogout}
      />}

      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-[#10201B] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg">
          {toastMessage}
        </div>
      )}

      <main className={isAdminPortal ? 'flex-1' : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12'}>
        {isDemoSession && user && (
          <div className={`mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[#F4C47D] bg-[#FFF8EA] px-4 py-3 text-sm text-[#6B4811] ${isAdminPortal ? 'mx-4 mt-4 sm:mx-6 lg:mx-8' : ''}`} role="status">
            <p><strong>Modo demonstração:</strong> dados fictícios; alterações não são enviadas ao backend.</p>
            <button type="button" onClick={handleLogout} className="self-start sm:self-auto font-semibold underline underline-offset-2 cursor-pointer">
              Terminar sessão demo
            </button>
          </div>
        )}
        {showProvidersNotice && providersStatus === 'loading' && (
          <p className="mb-4 text-xs font-medium text-[#52635D]">A carregar prestadores...</p>
        )}
        {showProvidersNotice && providersStatus === 'error' && (
          <p role="alert" className="mb-4 text-xs font-medium text-red-700 bg-red-50 rounded-lg px-3 py-2">
            {providersError}
          </p>
        )}

        {showProvidersNotice && user?.role === 'client' && !isDemoSession && (
          <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#C9E3D8] bg-[#E7F3EE] p-4 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#054A38]">Prestadores disponíveis até 10 km</p>
              <p className="mt-1 text-xs leading-relaxed text-[#2B6655]">
                {clientCoordinates
                  ? `${publicProviders.length} prestador(es) com localização elegível encontrados.`
                  : 'Partilhe a sua localização para filtrar os prestadores antes de pedir um orçamento.'}
              </p>
              {locationError && <p role="alert" className="mt-1 text-xs text-[#B42318]">{locationError}</p>}
              {clientCoordinates && publicProviders.length === 0 && <p className="mt-1 text-xs text-[#6B4811]">Não há prestadores com localização confirmada neste raio. A plataforma ainda depende dos dados de localização dos perfis.</p>}
            </div>
            <button type="button" onClick={requestClientLocation} className="min-h-10 shrink-0 rounded-xl bg-[#066E53] px-4 text-sm font-semibold text-white hover:bg-[#055741]">
              {clientCoordinates ? 'Actualizar localização' : 'Partilhar localização'}
            </button>
          </section>
        )}

        {activeTab === 'auth' && (
          <AuthView initialMode={isAdminPortal ? 'login' : undefined} initialRole={authInitialRole} adminOnly={isAdminPortal} onAuthenticated={handleAuthenticated} />
        )}

        {activeTab === 'home' && (
          <LandingView
            providers={publicProviders}
            onNavigate={navigateToTab}
            onSelectRoleAndNavigate={(role, tab) => {
              if (!user && role === 'provider') {
                navigateToTab(tab);
                return;
              }
              if (user && user.role !== role) {
                notify(`Esta área é para ${role === 'provider' ? 'prestadores' : 'clientes'}.`);
                return;
              }
              navigateToTab(tab);
            }}
            onOpenNewRequest={(cat) => handleOpenNewRequest(cat)}
            onSelectProvider={(prov) => setProfileModalProvider(prov)}
            onRequestQuoteForProvider={(prov) => handleOpenNewRequest(prov.category, prov)}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            providers={publicProviders}
            userRole={userRole}
            canSwitchRole={!user}
            onChangeRole={(role) => {
              if (!user) {
                if (role === 'provider') navigateToTab('opportunities');
                else setUserRole('client');
                return;
              }
              if (user.role !== role) {
                notify(`Esta área é para ${role === 'provider' ? 'prestadores' : 'clientes'}.`);
                return;
              }
              setUserRole(role);
              notify(role === 'provider'
                ? 'Área do prestador activa.'
                : 'Área do cliente activa.');
            }}
            onSelectProvider={(prov) => setProfileModalProvider(prov)}
            onRequestQuoteForProvider={(prov) => handleOpenNewRequest(prov.category, prov)}
            onOpenNewRequest={(cat) => handleOpenNewRequest(cat)}
            onNavigateOpportunities={() => navigateToTab('opportunities')}
            onNavigateServices={() => navigateToTab('services')}
          />
        )}

        {activeTab === 'services' && (
          <ProviderServicesView
            services={publishedServices}
            viewerRole={user?.role === 'provider' || user?.role === 'client' ? user.role : null}
            currentProvider={currentProvider}
            canPublish={!!currentProvider && providerIsOperational(currentProvider)}
            onPublish={handlePublishService}
            onToggleStatus={handleToggleServiceStatus}
            onDelete={handleDeleteService}
            onRequestService={handleRequestPublishedService}
          />
        )}

        {activeTab === 'messages' && user && (user.role === 'client' || user.role === 'provider') && (
          <MessagesView
            conversations={conversations
              .filter((conversation) => user.role === 'client'
                ? conversation.clientId === user.id
                : conversation.providerId === user.providerId)
              .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))}
            selectedConversationId={selectedConversationId}
            userRole={user.role}
            onSelectConversation={setSelectedConversationId}
            onSendMessage={handleSendConversationMessage}
          />
        )}

        {activeTab === 'support' && <SupportView key={user?.id ?? 'guest'} user={user} />}

        {activeTab === 'profile' && user && (user.role === 'client' || user.role === 'provider') && (
          <ProfileView
            user={user}
            currentProvider={currentProvider}
            isDemoSession={isDemoSession}
            onSaveAccount={handleSaveAccountProfile}
            onSaveProvider={handleSaveProviderProfile}
          />
        )}

        {activeTab === 'opportunities' && user?.role === 'provider' && currentProvider && providerIsOperational(currentProvider) && (
          <OpportunitiesView
            requests={requests.filter((request) => request.status === 'open' && request.clientId !== user.id)}
            demoMode={isDemoSession}
            currentProvider={currentProvider}
            proposedRequestIds={providerProposedRequestIds}
            requestsStatus={requestsStatus}
            requestsError={requestsError}
            onRetryRequests={() => setRequestsReloadKey((current) => current + 1)}
            onManageServices={() => navigateToTab('services')}
            onSubmitProposal={handleSubmitProposal}
          />
        )}

        {activeTab === 'proposals' && user?.role === 'client' && (
          <CompareProposalsView
            requests={requests.filter((request) => ownsRequest(request, user))}
            selectedRequestId={selectedRequestId}
            onSelectRequestId={(id) => setSelectedRequestId(id)}
            proposals={proposals}
            requestsStatus={requestsStatus}
            requestsError={requestsError}
            proposalsStatus={proposalsStatus}
            proposalsError={proposalsError}
            onRetryRequests={() => setRequestsReloadKey((current) => current + 1)}
            onRetryProposals={() => setProposalsReloadKey((current) => current + 1)}
            providers={[...proposalProviders, ...providersWithMockData.filter((provider) =>
              !proposalProviders.some((proposalProvider) => proposalProvider.id === provider.id),
            )]}
            onViewProvider={(prov) => setProfileModalProvider(prov)}
            onMessageProvider={handleStartConversation}
            onAcceptProposal={handleAcceptProposal}
            onOpenNewRequest={() => handleOpenNewRequest()}
          />
        )}

        {activeTab === 'escrow' && user && canParticipateInEscrow(user) && (
          <EscrowView
            escrow={escrow}
            provider={escrowProvider}
            isClient={user.role === 'client'}
            isProvider={user.role === 'provider'}
            paymentPhone={user.phone ?? ''}
            onChangePaymentMethod={(method: PaymentMethodId) =>
              user.role === 'client' && ownsEscrow(user) && escrow.stage === 'awaiting_payment'
                ? setEscrow((prev) => ({ ...prev, paymentMethod: method }))
                : notify('O método só pode ser alterado pelo cliente antes do pagamento.')
            }
            onFundEscrow={handleFundEscrow}
            onSendMessage={handleSendMessage}
            onDeclareCompletion={handleDeclareCompletion}
            onReleaseEscrow={handleReleaseEscrow}
            onOpenDispute={handleOpenDispute}
          />
        )}

        {activeTab === 'business' && user?.role === 'admin' && isAdminPortal && (
          <AdminBackofficeView
            providers={adminProviders}
            requests={adminRequests}
            supportThreads={supportThreads}
            onUpdateProvider={(id, updates) => updateProviderData((previous) => previous.map((provider) => provider.id === id ? { ...provider, ...updates } : provider))}
            onRemoveProvider={(id) => updateProviderData((previous) => previous.filter((provider) => provider.id !== id))}
            onUpdateRequest={(id, status) => {
              setRequests((previous) => previous.map((request) => request.id === id ? { ...request, status } : request));
              setDemoRequests((previous) => previous.map((request) => request.id === id ? { ...request, status } : request));
            }}
          />
        )}
        {activeTab === 'business' && user?.role === 'admin' && !isAdminPortal && (
          <BusinessModelView
            clientPlan={clientPlan}
            onChangeClientPlan={setClientPlan}
            providerSubState={providerSubState}
            onChangeProviderSubState={handleChangeProviderSubState}
            providerCredits={escrowProvider.creditsBalance ?? 0}
            onRedeemCredits={handleRedeemCredits}
          />
        )}
      </main>

      {!isAdminPortal && <footer className="border-t border-[#E1E7E4] bg-white py-6 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#52635D]">
          <div className="flex items-center gap-2">
            <img
              src="/assets/aistudio/biscato_logo_4fc64c75.png"
              alt="Biscato"
              referrerPolicy="no-referrer"
              className="h-5 w-auto object-contain"
            />
            <span className="font-semibold text-[#10201B]">Biscato Moçambique</span>
            <span>· Intermediação, Custódia e Garantia de Serviços</span>
          </div>
          <div className="flex items-center gap-4">
            {user && canParticipateInEscrow(user) && (
              <button type="button" onClick={() => navigateToTab('escrow')} className="hover:text-[#066E53] cursor-pointer">
                M-Pesa · e-Mola
              </button>
            )}
          </div>
        </div>
      </footer>}

      <ProviderProfileModal
        provider={profileModalProvider}
        onClose={() => setProfileModalProvider(null)}
        onRequestQuote={(prov) => handleOpenNewRequest(prov.category, prov)}
      />

      <NewRequestModal
        isOpen={isNewRequestOpen}
        initialCategory={newRequestCategory}
        targetProviderName={targetProvider?.name}
        clientCoordinates={clientCoordinates}
        requireLocation={!isDemoSession}
        onRequestLocation={requestClientLocation}
        onClose={() => setIsNewRequestOpen(false)}
        onCreateRequest={handleCreateRequest}
      />
    </div>
  );
}
