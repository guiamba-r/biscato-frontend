/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BusinessModelView } from './components/BusinessModelView';
import { CompareProposalsView } from './components/CompareProposalsView';
import { EscrowView } from './components/EscrowView';
import { ExploreView } from './components/ExploreView';
import { LandingView } from './components/LandingView';
import { Navbar } from './components/Navbar';
import { NewRequestModal } from './components/NewRequestModal';
import { OpportunitiesView } from './components/OpportunitiesView';
import { ProviderProfileModal } from './components/ProviderProfileModal';
import {
  INITIAL_ESCROW,
  INITIAL_PROPOSALS,
  INITIAL_PROVIDERS,
  INITIAL_REQUESTS,
} from './data/biscatoData';
import type {
  AppTab,
  ClientPlanState,
  EscrowTransaction,
  PaymentMethodId,
  Proposal,
  ProviderProfile,
  ProviderSubscriptionState,
  ServiceCategoryId,
  ServiceRequest,
  UserRole,
} from './types/biscato';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [clientPlan, setClientPlan] = useState<ClientPlanState>('free_trial_30d');
  const [providerSubState, setProviderSubState] = useState<ProviderSubscriptionState>('active');

  const [providers, setProviders] = useState<ProviderProfile[]>(INITIAL_PROVIDERS);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [selectedRequestId, setSelectedRequestId] = useState<string>(INITIAL_REQUESTS[0].id);
  const [escrow, setEscrow] = useState<EscrowTransaction>(INITIAL_ESCROW);

  // Modals & notifications
  const [profileModalProvider, setProfileModalProvider] = useState<ProviderProfile | null>(null);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [newRequestCategory, setNewRequestCategory] = useState<Exclude<ServiceCategoryId, 'all'> | undefined>(undefined);
  const [targetProvider, setTargetProvider] = useState<ProviderProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleOpenNewRequest = (
    initialCategory?: Exclude<ServiceCategoryId, 'all'>,
    provider?: ProviderProfile
  ) => {
    setNewRequestCategory(initialCategory ?? provider?.category ?? 'canalizacao');
    setTargetProvider(provider ?? null);
    setIsNewRequestOpen(true);
  };

  const handleCreateRequest = (
    payload: Omit<ServiceRequest, 'id' | 'status' | 'publishedLabel' | 'distanceKm' | 'clientVerified'>
  ) => {
    const newReqId = `req-${Date.now()}`;
    const newReq: ServiceRequest = {
      ...payload,
      id: newReqId,
      distanceKm: 2.4,
      clientVerified: true,
      publishedLabel: 'Agora mesmo',
      status: 'open',
    };

    setRequests((prev) => [newReq, ...prev]);

    // Auto-match 2 verified providers to generate instant comparable proposals
    const matchingProviders = [
      ...providers.filter((p) => p.category === payload.category),
      ...providers.filter((p) => p.category !== payload.category),
    ].slice(0, 2);

    const midBudget = Math.round((payload.budgetMinMT + payload.budgetMaxMT) / 2);
    const autoProposals: Proposal[] = matchingProviders.map((prov, index) => ({
      id: `prop-${Date.now()}-${index}`,
      requestId: newReqId,
      providerId: prov.id,
      priceMT: index === 0 ? midBudget : Math.max(payload.budgetMinMT, midBudget - 400),
      deadlineDays: payload.urgency === 'Urgente' ? 1 + index : 2 + index * 2,
      note: `Orçamento completo para ${payload.neighborhood} com Garantia Biscato e execução limpa.`,
      isBestMatch: index === 0,
      createdAt: 'Agora mesmo',
    }));

    setProposals((prev) => [...autoProposals, ...prev]);
    setSelectedRequestId(newReqId);
    setActiveTab('proposals');
    notify(`Pedido publicado! ${autoProposals.length} propostas recebidas para comparar.`);
  };

  const handleSubmitProposal = (
    requestId: string,
    providerId: string,
    priceMT: number,
    deadlineDays: number,
    note: string
  ) => {
    const newProp: Proposal = {
      id: `prop-${Date.now()}`,
      requestId,
      providerId,
      priceMT,
      deadlineDays,
      note,
      isBestMatch: false,
      createdAt: 'Agora mesmo',
    };
    setProposals((prev) => [newProp, ...prev]);
    setSelectedRequestId(requestId);
    setActiveTab('proposals');
    notify('Proposta submetida com sucesso!');
  };

  const handleAcceptProposal = (
    proposal: Proposal,
    request: ServiceRequest,
    provider: ProviderProfile
  ) => {
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
          text: `Proposta de ${provider.name} selecionada. Selecione M-Pesa, e-Mola, Mkesh ou Cartão para reter o valor em segurança.`,
          timestamp: 'Agora',
        },
      ],
    });

    setActiveTab('escrow');
    notify('Proposta selecionada. Conclua o pagamento em custódia para iniciar.');
  };

  const handleFundEscrow = () => {
    const nowTime = new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    const providerObj = providers.find((p) => p.id === escrow.providerId) ?? providers[0];

    setEscrow((prev) => ({
      ...prev,
      stage: 'in_execution',
      heldAt: `Hoje, ${nowTime}`,
      messages: [
        ...prev.messages,
        {
          id: `msg-fund-${Date.now()}`,
          sender: 'system',
          senderName: 'Custódia Biscato',
          text: `Pagamento confirmado e protegido em Escrow. O prestador foi notificado para iniciar o trabalho.`,
          timestamp: nowTime,
        },
        {
          id: `msg-prov-${Date.now() + 1}`,
          sender: 'provider',
          senderName: providerObj.name,
          text: 'Recebi a confirmação do valor em custódia! Estou a caminho conforme o prazo combinado.',
          timestamp: nowTime,
        },
      ],
    }));

    setRequests((prev) =>
      prev.map((r) => (r.id === escrow.requestId ? { ...r, status: 'in_escrow' } : r))
    );
    notify('Valor retido com sucesso em custódia Biscato!');
  };

  const handleSendMessage = (text: string) => {
    const nowTime = new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    setEscrow((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: `msg-${Date.now()}`,
          sender: userRole === 'client' ? 'client' : 'provider',
          senderName: userRole === 'client' ? 'Você (Cliente)' : escrowProvider.name,
          text,
          timestamp: nowTime,
        },
      ],
    }));
  };

  const handleReleaseEscrow = (rating: number, reviewText: string) => {
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

    setProviders((prev) =>
      prev.map((p) =>
        p.id === escrow.providerId
          ? {
              ...p,
              completedJobs: p.completedJobs + 1,
              reviewsCount: p.reviewsCount + 1,
              creditsBalance: p.creditsBalance + escrow.creditsEarnedOnRelease,
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
    setProviderSubState(newState);
    setProviders((prev) =>
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
    setProviders((prev) =>
      prev.map((p) =>
        p.id === escrow.providerId
          ? { ...p, creditsBalance: Math.max(0, p.creditsBalance - cost) }
          : p
      )
    );
    notify(`Créditos convertidos em ${itemLabel}!`);
  };

  const escrowProvider = providers.find((p) => p.id === escrow.providerId) ?? providers[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F5] text-[#10201B]">
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenNewRequest={() => handleOpenNewRequest()}
      />

      {/* Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-[#10201B] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <LandingView
            providers={providers}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectRoleAndNavigate={(role, tab) => {
              setUserRole(role);
              setActiveTab(tab);
            }}
            onOpenNewRequest={(cat) => handleOpenNewRequest(cat)}
            onSelectProvider={(prov) => setProfileModalProvider(prov)}
            onRequestQuoteForProvider={(prov) => handleOpenNewRequest(prov.category, prov)}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            providers={providers}
            userRole={userRole}
            onChangeRole={(role) => {
              setUserRole(role);
              if (role === 'provider') {
                notify('Modo Prestador ativo: explore oportunidades e envie propostas.');
              } else {
                notify('Modo Cliente ativo: compare orçamentos e pague em custódia.');
              }
            }}
            clientPlan={clientPlan}
            onSelectProvider={(prov) => setProfileModalProvider(prov)}
            onRequestQuoteForProvider={(prov) => handleOpenNewRequest(prov.category, prov)}
            onOpenNewRequest={(cat) => handleOpenNewRequest(cat)}
            onNavigateOpportunities={() => setActiveTab('opportunities')}
            onNavigateEscrow={() => setActiveTab('escrow')}
          />
        )}

        {activeTab === 'opportunities' && (
          <OpportunitiesView
            requests={requests}
            proposals={proposals}
            providers={providers}
            onSubmitProposal={handleSubmitProposal}
            onViewProposalsForRequest={(reqId) => {
              setSelectedRequestId(reqId);
              setActiveTab('proposals');
            }}
          />
        )}

        {activeTab === 'proposals' && (
          <CompareProposalsView
            requests={requests}
            selectedRequestId={selectedRequestId}
            onSelectRequestId={(id) => setSelectedRequestId(id)}
            proposals={proposals}
            providers={providers}
            onViewProvider={(prov) => setProfileModalProvider(prov)}
            onAcceptProposal={handleAcceptProposal}
            onOpenNewRequest={() => handleOpenNewRequest()}
          />
        )}

        {activeTab === 'escrow' && (
          <EscrowView
            escrow={escrow}
            provider={escrowProvider}
            onChangePaymentMethod={(method: PaymentMethodId) =>
              setEscrow((prev) => ({ ...prev, paymentMethod: method }))
            }
            onFundEscrow={handleFundEscrow}
            onSendMessage={handleSendMessage}
            onReleaseEscrow={handleReleaseEscrow}
            onOpenDispute={handleOpenDispute}
          />
        )}

        {activeTab === 'business' && (
          <BusinessModelView
            clientPlan={clientPlan}
            onChangeClientPlan={setClientPlan}
            providerSubState={providerSubState}
            onChangeProviderSubState={handleChangeProviderSubState}
            providerCredits={escrowProvider.creditsBalance}
            onRedeemCredits={handleRedeemCredits}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E1E7E4] bg-white py-6 mb-14 md:mb-0">
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
            <button
              type="button"
              onClick={() => setActiveTab('escrow')}
              className="hover:text-[#066E53] cursor-pointer"
            >
              M-Pesa · e-Mola · Mkesh
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('business')}
              className="hover:text-[#066E53] cursor-pointer"
            >
              Plano & Regras
            </button>
          </div>
        </div>
      </footer>

      {/* Provider Profile Modal (Screen 03) */}
      <ProviderProfileModal
        provider={profileModalProvider}
        onClose={() => setProfileModalProvider(null)}
        onRequestQuote={(prov) => handleOpenNewRequest(prov.category, prov)}
      />

      {/* New Service Request Modal */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        initialCategory={newRequestCategory}
        targetProviderName={targetProvider?.name}
        onClose={() => setIsNewRequestOpen(false)}
        onCreateRequest={handleCreateRequest}
      />
    </div>
  );
}
