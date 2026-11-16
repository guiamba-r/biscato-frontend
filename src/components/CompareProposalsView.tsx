import { useState } from 'react';
import { ArrowUpDown, BadgeCheck, Lock, ShieldCheck, Star } from 'lucide-react';
import type { Proposal, ProviderProfile, ServiceRequest } from '../types/biscato';
import { formatMT } from '../utils/formatters';

interface CompareProposalsViewProps {
  requests: ServiceRequest[];
  selectedRequestId: string;
  onSelectRequestId: (id: string) => void;
  proposals: Proposal[];
  providers: ProviderProfile[];
  onViewProvider: (provider: ProviderProfile) => void;
  onAcceptProposal: (proposal: Proposal, request: ServiceRequest, provider: ProviderProfile) => void;
  onOpenNewRequest: () => void;
}

type SortKey = 'recommended' | 'lowest_price' | 'fastest' | 'highest_rating';

export function CompareProposalsView({
  requests,
  selectedRequestId,
  onSelectRequestId,
  proposals,
  providers,
  onViewProvider,
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#066E53]">
            02. Comparar propostas · Escolha informada sem sobrecarga
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#10201B] mt-1">
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

      {/* Emerald Summary Card matching Screen 02 of cls_f9822802.png */}
      {activeRequest && (
        <section className="rounded-2xl bg-[#066E53] text-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#AEE6D4]">
              {activeRequest.neighborhood} · {activeRequest.province} · {activeRequest.publishedLabel}
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold">
              {sorted.length} {sorted.length === 1 ? 'proposta recebida' : 'propostas recebidas'} — {activeRequest.title}
            </h2>
            <p className="text-sm text-white/85 max-w-2xl">
              {activeRequest.description}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/12 rounded-xl px-3.5 py-2.5 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-[#F4811F]" aria-hidden="true" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              aria-label="Ordenar propostas"
              className="bg-transparent text-sm font-semibold text-white outline-none cursor-pointer"
            >
              <option value="recommended" className="text-[#10201B]">Ordenar: Recomendados</option>
              <option value="lowest_price" className="text-[#10201B]">Menor Preço (MT)</option>
              <option value="fastest" className="text-[#10201B]">Menor Prazo (dias)</option>
              <option value="highest_rating" className="text-[#10201B]">Melhor Avaliação</option>
            </select>
          </div>
        </section>
      )}

      {/* Proposals Comparison Cards */}
      {sorted.length === 0 ? (
        <div className="bg-white border border-[#E1E7E4] rounded-2xl p-10 text-center space-y-3">
          <p className="font-display text-base font-semibold text-[#10201B]">
            Ainda não existem propostas submetidas para este pedido
          </p>
          <p className="text-sm text-[#52635D] max-w-md mx-auto">
            Aceda ao separador Oportunidades para simular o envio de uma proposta de um prestador ou publique um novo pedido.
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
                className={`relative bg-white rounded-2xl p-6 flex flex-col justify-between gap-5 transition-colors ${
                  isHighlighted
                    ? 'border-2 border-[#066E53]'
                    : 'border border-[#E1E7E4]'
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
                    onClick={() => activeRequest && onAcceptProposal(proposal, activeRequest, provider)}
                    className="h-11 px-4 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
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
