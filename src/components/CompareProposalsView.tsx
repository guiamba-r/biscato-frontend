import { useState } from 'react';
import { ArrowUpDown, BadgeCheck, Lock, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import type { Proposal, ProviderProfile, ServiceRequest } from '../types/biscato';
import { formatMT } from '../utils/formatters';

interface CompareProposalsViewProps {
  requests: ServiceRequest[];
  selectedRequestId: string;
  onSelectRequestId: (id: string) => void;
  proposals: Proposal[];
  requestsStatus: 'idle' | 'loading' | 'ready' | 'error';
  requestsError: string | null;
  proposalsStatus: 'idle' | 'loading' | 'ready' | 'error';
  proposalsError: string | null;
  onRetryRequests: () => void;
  onRetryProposals: () => void;
  providers: ProviderProfile[];
  onViewProvider: (provider: ProviderProfile) => void;
  onMessageProvider: (proposal: Proposal, request: ServiceRequest, provider: ProviderProfile) => void;
  onAcceptProposal: (proposal: Proposal, request: ServiceRequest, provider: ProviderProfile) => void;
  onOpenNewRequest: () => void;
}

type SortKey = 'recommended' | 'lowest_price' | 'fastest' | 'highest_rating';

export function CompareProposalsView({
  requests,
  selectedRequestId,
  onSelectRequestId,
  proposals,
  requestsStatus,
  requestsError,
  proposalsStatus,
  proposalsError,
  onRetryRequests,
  onRetryProposals,
  providers,
  onViewProvider,
  onMessageProvider,
  onAcceptProposal,
  onOpenNewRequest,
}: CompareProposalsViewProps) {
  const [sortBy, setSortBy] = useState<SortKey>('recommended');

  const activeRequest = requests.find((r) => r.id === selectedRequestId) ?? requests[0];
  const requestProposals = proposals.filter((p) => p.requestId === activeRequest?.id);

  const enriched = requestProposals
    .map((prop) => {
      const provider = providers.find((pr) => pr.id === prop.providerId);
      return provider ? { proposal: prop, provider } : null;
    })
    .filter((item): item is { proposal: Proposal; provider: ProviderProfile } => item !== null);

  const sorted = [...enriched].sort((a, b) => {
    if (sortBy === 'lowest_price') return a.proposal.priceMT - b.proposal.priceMT;
    if (sortBy === 'fastest') return a.proposal.deadlineDays - b.proposal.deadlineDays;
    if (sortBy === 'highest_rating') return b.provider.rating - a.provider.rating;
    // recommended: best match first, then rating
    if (a.proposal.isBestMatch && !b.proposal.isBestMatch) return -1;
    if (!a.proposal.isBestMatch && b.proposal.isBestMatch) return 1;
    return b.provider.rating - a.provider.rating;
  });

  return (
    <div className="space-y-8">
      {/* Screen 02 Header */}
      <div className="editorial-rule flex flex-col md:flex-row md:items-end justify-between gap-5 pt-6">
        <div>
          <p className="section-kicker mb-3">Escolha informada</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#162820]">
            Comparador de orçamentos
          </h1>
          <p className="text-sm text-[#52635D] mt-1">
            Compare preços em MT, prazos de execução e verificações num único painel antes de reter o valor em custódia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="select-request-compare" className="text-xs font-medium text-[#52635D] whitespace-nowrap">
            Pedido:
          </label>
          <select
            id="select-request-compare"
            value={activeRequest?.id ?? ''}
            onChange={(e) => onSelectRequestId(e.target.value)}
            className="h-11 px-3 rounded-xl bg-white border border-[#E1E7E4] text-sm font-medium text-[#10201B] outline-none focus:border-[#066E53] max-w-xs cursor-pointer"
          >
            {requests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Proposals Comparison Cards */}
      {requestsStatus === 'loading' ? (
        <div className="bg-white border border-[#E1E7E4] rounded-2xl p-10 text-center text-sm text-[#52635D]" role="status">
          A carregar os seus pedidos…
        </div>
      ) : requestsStatus === 'error' ? (
        <div className="bg-white border border-[#E1E7E4] rounded-2xl p-10 text-center space-y-3" role="alert">
          <p className="font-semibold text-[#10201B]">Não foi possível carregar os seus pedidos.</p>
          <p className="text-sm text-[#52635D]">{requestsError}</p>
          <button type="button" onClick={onRetryRequests} className="h-11 px-5 rounded-xl bg-[#066E53] text-white text-sm font-semibold cursor-pointer">
            Tentar novamente
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-[#E1E7E4] rounded-2xl p-10 text-center space-y-3">
          <p className="font-display text-base font-semibold text-[#10201B]">Ainda não publicou nenhum pedido</p>
          <p className="text-sm text-[#52635D] max-w-md mx-auto">Publique o serviço de que precisa. Os prestadores poderão enviar propostas para comparar aqui.</p>
          <button type="button" onClick={onOpenNewRequest} className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#066E53] text-white text-sm font-semibold cursor-pointer">
            Publicar um pedido
          </button>
        </div>
      ) : proposalsStatus === 'loading' ? (
        <div className="bg-white border border-[#E1E7E4] rounded-2xl p-10 text-center text-sm text-[#52635D]" role="status">
          A carregar propostas para este pedido…
        </div>
      ) : proposalsStatus === 'error' ? (
        <div className="bg-white border border-[#E1E7E4] rounded-2xl p-10 text-center space-y-3" role="alert">
          <p className="font-semibold text-[#10201B]">Não foi possível carregar as propostas.</p>
          <p className="text-sm text-[#52635D]">{proposalsError}</p>
          <button type="button" onClick={onRetryProposals} className="h-11 px-5 rounded-xl bg-[#066E53] text-white text-sm font-semibold cursor-pointer">
            Tentar novamente
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white border border-[#E1E7E4] rounded-2xl p-10 text-center space-y-3">
          <p className="font-display text-base font-semibold text-[#10201B]">
            Ainda não existem propostas submetidas para este pedido
          </p>
          <p className="text-sm text-[#52635D] max-w-md mx-auto">
            O pedido está publicado. Os prestadores podem enviar propostas; quando chegarem, poderá comparar preço, prazo e condições aqui.
          </p>
          <button
            type="button"
            onClick={onOpenNewRequest}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#066E53] text-white text-sm font-semibold cursor-pointer"
          >
            Publicar Novo Pedido
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sorted.map(({ proposal, provider }, idx) => {
            const isHighlighted = proposal.isBestMatch || idx === 0;
            return (
              <article
                key={proposal.id}
                className={`relative bg-white rounded-[8px] p-6 flex flex-col justify-between gap-5 transition-all ${
                  isHighlighted
                    ? 'border-2 border-[#1F6652] shadow-[0_10px_28px_rgba(22,40,32,0.06)]'
                    : 'border border-[#D5D9D3] hover:border-[#AEB8B1]'
                }`}
              >
                {isHighlighted && (
                  <div className="flex items-center justify-between text-xs font-bold text-[#C85A08]">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#F4811F] text-[#F4811F]" aria-hidden="true" />
                      Combinação Melhor
                    </span>
                    <span className="text-[#52635D] font-normal">Enviada {proposal.createdAt}</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#E7F3EE] text-[#066E53] font-display font-bold text-base flex items-center justify-center shrink-0">
                      {provider.initials}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-[#10201B]">
                        {provider.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#52635D] tabular-nums mt-0.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#10201B]">
                          <Star className="w-3.5 h-3.5 fill-[#F4811F] text-[#F4811F]" aria-hidden="true" />
                          {provider.rating.toFixed(1).replace('.', ',')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{provider.completedJobs} trabalhos</span>
                        <span aria-hidden="true">·</span>
                        <span>{provider.onTimeRate}% no prazo</span>
                      </div>
                    </div>
                  </div>

                  <BadgeCheck className="w-5 h-5 text-[#066E53] shrink-0" aria-label="Prestador Verificado" />
                </div>

                {/* Price & Deadline side-by-side */}
                <div className="grid grid-cols-2 gap-4 py-3.5 border-y border-[#E1E7E4]">
                  <div>
                    <span className="block text-xs text-[#52635D]">Preço total</span>
                    <span className="font-mono text-xl font-bold text-[#10201B] tabular-nums">
                      {formatMT(proposal.priceMT)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-[#52635D]">Prazo estimado</span>
                    <span className="font-display text-xl font-bold text-[#10201B] tabular-nums">
                      {proposal.deadlineDays} {proposal.deadlineDays === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#52635D] leading-relaxed">
                  {proposal.note}
                </p>

                {/* Clean unboxed verification & fee metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#066E53] font-medium">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    BI / KYC Verificado
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    Garantia Biscato (até 50% cobertura)
                  </span>
                  {provider.subscriptionState === 'tolerance_30d' && (
                    <span className="text-[#C85A08]">
                      · Tolerância 30d (taxa de 10% aplicada ao prestador)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onViewProvider(provider)}
                    className="h-11 px-4 rounded-xl border border-[#D4DDD9] hover:bg-[#F6F7F5] text-sm font-semibold text-[#10201B] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Ver Perfil Profissional
                  </button>
                  <button
                    type="button"
                    onClick={() => activeRequest && onMessageProvider(proposal, activeRequest, provider)}
                    className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-[#066E53] text-sm font-semibold text-[#066E53] hover:bg-[#EAF5F1] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" /> Conversar
                  </button>
                  <button
                    type="button"
                    onClick={() => activeRequest && onAcceptProposal(proposal, activeRequest, provider)}
                    className="h-11 px-4 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer sm:col-span-2"
                  >
                    Aceitar e Reter em Custódia
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
