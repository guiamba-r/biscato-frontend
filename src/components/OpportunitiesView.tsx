import { useState } from 'react';
import { Clock, MapPin, Search, Send, ShieldCheck, X } from 'lucide-react';
import { MOZAMBIQUE_PROVINCES, SERVICE_CATEGORIES } from '../data/biscatoData';
import type { Proposal, ProviderProfile, ProvinceName, ServiceCategoryId, ServiceRequest } from '../types/biscato';
import { formatMT, formatMTRange } from '../utils/formatters';

interface OpportunitiesViewProps {
  requests: ServiceRequest[];
  proposals: Proposal[];
  providers: ProviderProfile[];
  onSubmitProposal: (requestId: string, providerId: string, priceMT: number, deadlineDays: number, note: string) => void;
  onViewProposalsForRequest: (requestId: string) => void;
}

export function OpportunitiesView({
  requests,
  proposals,
  providers,
  onSubmitProposal,
  onViewProposalsForRequest,
}: OpportunitiesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryId>('all');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceName>('Todas as Províncias');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(10);
  const [activeRequestModal, setActiveRequestModal] = useState<ServiceRequest | null>(null);

  // Proposal form state
  const [selectedProviderId, setSelectedProviderId] = useState<string>(providers[0]?.id ?? 'prov-carlos');
  const [priceInput, setPriceInput] = useState<string>('3000');
  const [deadlineInput, setDeadlineInput] = useState<string>('2');
  const [noteInput, setNoteInput] = useState<string>(
    'Disponibilidade imediata com garantia Biscato e material básico incluído.'
  );

  const filteredRequests = requests.filter((req) => {
    const matchesCat = selectedCategory === 'all' || req.category === selectedCategory;
    const matchesProv = selectedProvince === 'Todas as Províncias' || req.province === selectedProvince;
    const matchesRadius = req.distanceKm <= maxRadiusKm;
    const q = searchTerm.trim().toLowerCase();
    const matchesText =
      !q ||
      req.title.toLowerCase().includes(q) ||
      req.neighborhood.toLowerCase().includes(q) ||
      req.description.toLowerCase().includes(q);
    return matchesCat && matchesProv && matchesRadius && matchesText;
  });

  const openModalForRequest = (req: ServiceRequest) => {
    const mid = Math.round((req.budgetMinMT + req.budgetMaxMT) / 2);
    setPriceInput(String(mid));
    setDeadlineInput(req.urgency === 'Urgente' ? '1' : '3');
    setActiveRequestModal(req);
  };

  const handleConfirmProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequestModal) return;
    const parsedPrice = Math.max(200, Number(priceInput) || activeRequestModal.budgetMinMT);
    const parsedDays = Math.max(1, Number(deadlineInput) || 1);
    onSubmitProposal(activeRequestModal.id, selectedProviderId, parsedPrice, parsedDays, noteInput);
    const reqId = activeRequestModal.id;
    setActiveRequestModal(null);
    onViewProposalsForRequest(reqId);
  };

  return (
    <div className="space-y-8">
      {/* Header & Proximity Filter (Screen 01 from cls_f9822802.png) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#066E53]">
            01. Oportunidades · Descoberta local e decisão rápida
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#10201B] mt-1">
            Pedidos de serviço próximos
          </h1>
          <p className="text-sm text-[#52635D] mt-1">
            Filtre por localização, raio em km e orçamento disponível antes de enviar a sua proposta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#E1E7E4] rounded-xl px-3 h-11">
            <MapPin className="w-4 h-4 text-[#066E53] shrink-0" aria-hidden="true" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value as ProvinceName)}
              aria-label="Filtrar por província"
              className="text-sm font-medium text-[#10201B] bg-transparent outline-none cursor-pointer"
            >
              {MOZAMBIQUE_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-[#E1E7E4] rounded-xl px-3 h-11">
            <span className="text-xs text-[#52635D] whitespace-nowrap">Raio:</span>
            <select
              value={maxRadiusKm}
              onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
              aria-label="Filtrar por raio em quilómetros"
              className="text-sm font-semibold text-[#066E53] bg-transparent outline-none tabular-nums cursor-pointer"
            >
              <option value={3}>3 km</option>
              <option value={5}>5 km</option>
              <option value={8}>8 km</option>
              <option value={15}>15 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="bg-white border border-[#E1E7E4] rounded-2xl p-4 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#52635D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar trabalhos (ex: fuga na cozinha, pintura, quadro elétrico)..."
            aria-label="Pesquisar oportunidades"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F6F7F5] text-sm text-[#10201B] placeholder:text-[#6B7C76] outline-none focus:bg-white focus:ring-2 focus:ring-[#066E53]/25"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#066E53] text-white'
                : 'bg-[#F6F7F5] text-[#52635D] hover:text-[#10201B]'
            }`}
          >
            Todos ({requests.length})
          </button>
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#066E53] text-white'
                  : 'bg-[#F6F7F5] text-[#52635D] hover:text-[#10201B]'
              }`}
            >
              {cat.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-[#52635D]">
        <span className="tabular-nums">
          <strong className="text-[#10201B]">{filteredRequests.length}</strong> trabalhos próximos disponíveis
        </span>
        <span>Ordenado por proximidade e urgência</span>
      </div>

      {/* Opportunities Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-[#E1E7E4] rounded-2xl p-10 text-center space-y-3">
          <p className="font-display text-base font-semibold text-[#10201B]">
            Sem pedidos neste raio ou categoria
          </p>
          <p className="text-sm text-[#52635D]">
            Aumente o raio para 15 km ou selecione Todas as Províncias.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.map((req) => {
            const reqProposalsCount = proposals.filter((p) => p.requestId === req.id).length;
            const categoryLabel = SERVICE_CATEGORIES.find((c) => c.id === req.category)?.label ?? req.category;

            return (
              <article
                key={req.id}
                className="bg-white border border-[#E1E7E4] rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[#066E53]/45 transition-colors"
              >
                <div className="space-y-3">
                  {/* Clean unboxed metadata header */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className={`font-semibold ${
                        req.urgency === 'Urgente' ? 'text-[#C85A08]' : 'text-[#066E53]'
                      }`}
                    >
                      {req.urgency === 'Urgente' ? 'Urgente' : req.clientVerified ? 'Cliente Verificado' : 'Pedido Aberto'}
                      <span className="text-[#52635D] font-normal"> · {categoryLabel}</span>
                    </span>
                    <span className="font-mono text-[#52635D] tabular-nums">
                      {req.distanceKm.toFixed(1).replace('.', ',')} km
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-bold text-[#10201B] leading-snug">
                      {req.title}
                    </h2>
                    <p className="text-xs text-[#52635D] mt-1">
                      {req.neighborhood} · {req.province} · {req.publishedLabel}
                    </p>
                  </div>

                  <p className="text-sm text-[#52635D] leading-relaxed">
                    {req.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E1E7E4] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="block text-[11px] text-[#52635D]">Orçamento estimado</span>
                    <span className="font-mono text-base font-bold text-[#10201B] tabular-nums">
                      {formatMTRange(req.budgetMinMT, req.budgetMaxMT)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewProposalsForRequest(req.id)}
                      className="h-10 px-3.5 rounded-xl border border-[#D4DDD9] hover:bg-[#F6F7F5] text-xs font-semibold text-[#10201B] whitespace-nowrap cursor-pointer"
                    >
                      Propostas ({reqProposalsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => openModalForRequest(req)}
                      className="h-10 px-4 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                    >
                      Enviar Proposta
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Proposal Submission Modal */}
      {activeRequestModal && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="proposal-modal-title"
        >
          <div className="bg-white rounded-2xl border border-[#E1E7E4] w-full max-w-lg p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#066E53]">Submeter orçamento na plataforma</p>
                <h2 id="proposal-modal-title" className="font-display text-lg font-bold text-[#10201B] mt-0.5">
                  {activeRequestModal.title}
                </h2>
                <p className="text-xs text-[#52635D] mt-1">
                  {activeRequestModal.neighborhood} · Orçamento do cliente:{' '}
                  {formatMTRange(activeRequestModal.budgetMinMT, activeRequestModal.budgetMaxMT)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveRequestModal(null)}
                aria-label="Fechar janela"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#52635D] hover:bg-[#F6F7F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
                  Perfil do Prestador
                </label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] bg-white text-sm text-[#10201B] outline-none focus:border-[#066E53]"
                >
                  {providers.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name} — {prov.specialty} (
                      {prov.subscriptionState === 'tolerance_30d'
                        ? 'Tolerância 30d · 10% taxa'
                        : 'Subscrição ativa'}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
                    Valor da Proposta (MT)
                  </label>
                  <input
                    type="number"
                    min={200}
                    step={100}
                    required
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] font-mono text-sm text-[#10201B] outline-none focus:border-[#066E53] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
                    Prazo de Execução (dias)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={deadlineInput}
                    onChange={(e) => setDeadlineInput(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] font-mono text-sm text-[#10201B] outline-none focus:border-[#066E53] tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
                  Detalhes do orçamento e garantia
                </label>
                <textarea
                  rows={3}
                  required
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#D4DDD9] text-sm text-[#10201B] outline-none focus:border-[#066E53]"
                />
              </div>

              <div className="bg-[#E7F3EE] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#054A38]">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#066E53]" aria-hidden="true" />
                <span>
                  Ao enviar pela Biscato, o pagamento fica garantido em Escrow antes do início do trabalho e gera créditos de equipamento ao concluir ({formatMT(Number(priceInput) || 0)} → +{Math.max(10, Math.round((Number(priceInput) || 0) / 100))} créditos).
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveRequestModal(null)}
                  className="h-11 px-4 rounded-xl border border-[#D4DDD9] text-sm font-semibold text-[#10201B] hover:bg-[#F6F7F5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold cursor-pointer"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Confirmar Proposta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
