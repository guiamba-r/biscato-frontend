import { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Car,
  Droplets,
  Hammer,
  HardHat,
  MapPin,
  Paintbrush,
  Search,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { MOZAMBIQUE_PROVINCES, SERVICE_CATEGORIES } from '../data/biscatoData';
import type {
  ClientPlanState,
  ProviderProfile,
  ProvinceName,
  ServiceCategoryId,
  UserRole,
} from '../types/biscato';
import { formatMT } from '../utils/formatters';
import { TradeIllustration } from './TradeArtwork';

interface ExploreViewProps {
  providers: ProviderProfile[];
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  clientPlan: ClientPlanState;
  onSelectProvider: (provider: ProviderProfile) => void;
  onRequestQuoteForProvider: (provider: ProviderProfile) => void;
  onOpenNewRequest: (initialCategory?: Exclude<ServiceCategoryId, 'all'>) => void;
  onNavigateOpportunities: () => void;
  onNavigateEscrow: () => void;
}

const CATEGORY_ICONS: Record<Exclude<ServiceCategoryId, 'all'>, typeof Droplets> = {
  canalizacao: Droplets,
  eletricidade: Zap,
  construcao: HardHat,
  carpintaria: Hammer,
  pintura: Paintbrush,
  mecanica: Car,
  mudancas: Truck,
  calcados: Wrench,
};

export function ExploreView({
  providers,
  userRole,
  onChangeRole,
  clientPlan,
  onSelectProvider,
  onRequestQuoteForProvider,
  onOpenNewRequest,
  onNavigateOpportunities,
  onNavigateEscrow,
}: ExploreViewProps) {
  const MAX_PRICE_BOUND = 10000;
  const [searchQuery, setSearchQuery] = useState('');
  const [neighborhoodQuery, setNeighborhoodQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryId>('all');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceName>('Todas as Províncias');
  const [minBudgetMT, setMinBudgetMT] = useState<number>(0);
  const [maxBudgetMT, setMaxBudgetMT] = useState<number>(MAX_PRICE_BOUND);
  const [minRating, setMinRating] = useState<number>(0);

  const normalizeText = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const availableNeighborhoods = Array.from(
    new Set(
      providers
        .filter((p) => selectedProvince === 'Todas as Províncias' || p.province === selectedProvince)
        .map((p) => p.neighborhood)
    )
  );

  const isPriceFiltered = minBudgetMT > 0 || maxBudgetMT < MAX_PRICE_BOUND;

  const handleMinBudgetChange = (value: number) => {
    setMinBudgetMT(Math.min(value, maxBudgetMT));
  };

  const handleMaxBudgetChange = (value: number) => {
    setMaxBudgetMT(Math.max(value, minBudgetMT));
  };

  const filteredProviders = providers.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesProvince = selectedProvince === 'Todas as Províncias' || p.province === selectedProvince;
    const q = normalizeText(searchQuery);
    const nq = normalizeText(neighborhoodQuery);

    const matchesSearch =
      !q ||
      normalizeText(p.name).includes(q) ||
      normalizeText(p.specialty).includes(q) ||
      normalizeText(p.bio).includes(q);

    const matchesNeighborhood =
      !nq ||
      normalizeText(p.neighborhood).includes(nq) ||
      normalizeText(p.province).includes(nq);

    const matchesBudget =
      p.hourlyOrBaseMT >= minBudgetMT && p.hourlyOrBaseMT <= maxBudgetMT;

    const matchesRating = p.rating >= minRating;

    return (
      matchesCategory &&
      matchesProvince &&
      matchesSearch &&
      matchesNeighborhood &&
      matchesBudget &&
      matchesRating
    );
  });

  return (
    <div className="space-y-10">
      {/* Workspace Toolbar: Role switch & Client trial status (placed in workspace below top bar) */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E7E4]">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center p-1 bg-[#E9EEEC] rounded-xl" role="group" aria-label="Modo de utilização">
            <button
              type="button"
              onClick={() => onChangeRole('client')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                userRole === 'client'
                  ? 'bg-white text-[#066E53] shadow-xs'
                  : 'text-[#52635D] hover:text-[#10201B]'
              }`}
            >
              Modo Cliente
            </button>
            <button
              type="button"
              onClick={() => onChangeRole('provider')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                userRole === 'provider'
                  ? 'bg-white text-[#066E53] shadow-xs'
                  : 'text-[#52635D] hover:text-[#10201B]'
              }`}
            >
              Modo Prestador
            </button>
          </div>

          <span className="text-xs text-[#52635D]">
            {userRole === 'client'
              ? clientPlan === 'free_trial_30d'
                ? 'Acesso gratuito de 30 dias ativo · Pagamento retido em custódia'
                : 'Plano ativo · Cobertura até 50% de prejuízos'
              : 'Subscrição mensal · 30 dias de tolerância com taxa de 10%'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#52635D]">
          <span>Moçambique · 11 Províncias</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={onNavigateEscrow}
            className="text-[#066E53] font-semibold hover:underline whitespace-nowrap cursor-pointer"
          >
            Ver Custódia Ativa
          </button>
        </div>
      </section>

      {/* Search by Service, Neighborhood/Zone & Province Filter Bar */}
      <section className="bg-white border border-[#E1E7E4] rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-[#52635D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Serviço ou técnico (ex: canalizador)..."
              aria-label="Pesquisar profissionais e serviços"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F6F7F5] border border-transparent focus:border-[#066E53] focus:bg-white text-sm text-[#10201B] placeholder:text-[#6B7C76] outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-3 relative">
            <MapPin className="w-4 h-4 text-[#F4811F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              list="mz-neighborhoods-list"
              value={neighborhoodQuery}
              onChange={(e) => setNeighborhoodQuery(e.target.value)}
              placeholder="Bairro ou zona (ex: Polana, Matola)..."
              aria-label="Filtrar prestadores por bairro ou zona em Moçambique"
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#F6F7F5] border border-transparent focus:border-[#066E53] focus:bg-white text-sm text-[#10201B] placeholder:text-[#6B7C76] outline-none transition-colors"
            />
            {neighborhoodQuery && (
              <button
                type="button"
                onClick={() => setNeighborhoodQuery('')}
                aria-label="Limpar filtro de bairro ou zona"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#52635D] hover:text-[#10201B] hover:bg-[#E1E7E4]/60 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
            <datalist id="mz-neighborhoods-list">
              {availableNeighborhoods.map((zone) => (
                <option key={zone} value={zone} />
              ))}
            </datalist>
          </div>

          <div className="md:col-span-3 relative">
            <MapPin className="w-4 h-4 text-[#066E53] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value as ProvinceName)}
              aria-label="Selecionar província"
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#F6F7F5] border border-transparent focus:border-[#066E53] focus:bg-white text-sm text-[#10201B] outline-none cursor-pointer"
            >
              {MOZAMBIQUE_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => onOpenNewRequest()}
              className="w-full h-11 px-4 rounded-xl bg-[#F4811F] hover:bg-[#DD6E0F] text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              Publicar Pedido
            </button>
          </div>
        </div>

        {/* Interactive Neighborhood / Zone Quick Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-xs font-medium text-[#52635D] whitespace-nowrap shrink-0 mr-1">
            Zonas rápidas:
          </span>
          <button
            type="button"
            onClick={() => setNeighborhoodQuery('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              !neighborhoodQuery
                ? 'bg-[#066E53] text-white'
                : 'bg-[#F6F7F5] text-[#52635D] hover:text-[#10201B]'
            }`}
          >
            Todos os bairros
          </button>
          {availableNeighborhoods.map((zone) => {
            const isZoneActive = normalizeText(neighborhoodQuery) === normalizeText(zone);
            return (
              <button
                key={zone}
                type="button"
                onClick={() => setNeighborhoodQuery(isZoneActive ? '' : zone)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isZoneActive
                    ? 'bg-[#066E53] text-white font-semibold'
                    : 'bg-[#F6F7F5] text-[#52635D] hover:text-[#10201B]'
                }`}
              >
                {zone}
              </button>
            );
          })}
        </div>

        {/* Budget Range Filter (Min & Max MT Sliders + Presets) */}
        <div className="pt-3 border-t border-[#E1E7E4] grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-[#10201B]">
                Faixa de orçamento (valor base)
              </span>
              <p className="font-mono text-xs font-semibold text-[#066E53] tabular-nums mt-0.5">
                {formatMT(minBudgetMT)} — {maxBudgetMT >= MAX_PRICE_BOUND ? `${formatMT(MAX_PRICE_BOUND)}+` : formatMT(maxBudgetMT)}
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'Todos', min: 0, max: MAX_PRICE_BOUND },
                { label: 'Até 3.500 MT', min: 0, max: 3500 },
                { label: '3.500–6.000 MT', min: 3500, max: 6000 },
                { label: '+6.000 MT', min: 6000, max: MAX_PRICE_BOUND },
              ].map((preset) => {
                const active = minBudgetMT === preset.min && maxBudgetMT === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setMinBudgetMT(preset.min);
                      setMaxBudgetMT(preset.max);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#066E53] text-white'
                        : 'bg-[#F6F7F5] text-[#52635D] hover:text-[#10201B]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <label className="block space-y-1">
              <div className="flex items-center justify-between text-xs text-[#52635D]">
                <span>Orçamento mínimo</span>
                <span className="font-mono font-semibold text-[#10201B] tabular-nums">
                  {formatMT(minBudgetMT)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={MAX_PRICE_BOUND}
                step={500}
                value={minBudgetMT}
                onChange={(e) => handleMinBudgetChange(Number(e.target.value))}
                aria-label="Orçamento mínimo em Meticais"
                className="w-full accent-[#066E53] cursor-pointer"
              />
            </label>

            <label className="block space-y-1">
              <div className="flex items-center justify-between text-xs text-[#52635D]">
                <span>Orçamento máximo</span>
                <span className="font-mono font-semibold text-[#10201B] tabular-nums">
                  {maxBudgetMT >= MAX_PRICE_BOUND ? `${formatMT(MAX_PRICE_BOUND)}+` : formatMT(maxBudgetMT)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={MAX_PRICE_BOUND}
                step={500}
                value={maxBudgetMT}
                onChange={(e) => handleMaxBudgetChange(Number(e.target.value))}
                aria-label="Orçamento máximo em Meticais"
                className="w-full accent-[#F4811F] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Minimum Star Rating Filter */}
        <div className="pt-3 border-t border-[#E1E7E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-[#F4811F] text-[#F4811F] shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#10201B]">
              Classificação mínima
            </span>
            {minRating > 0 && (
              <span className="text-xs text-[#066E53] font-mono font-semibold tabular-nums">
                · {minRating.toFixed(1).replace('.', ',')}+ estrelas
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Filtrar por classificação mínima em estrelas">
            {[
              { label: 'Todas', value: 0 },
              { label: '4,0+', value: 4.0 },
              { label: '4,5+', value: 4.5 },
              { label: '4,8+', value: 4.8 },
              { label: '4,9+', value: 4.9 },
            ].map((opt) => {
              const active = minRating === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setMinRating(opt.value)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer tabular-nums ${
                    active
                      ? 'bg-[#066E53] text-white'
                      : 'bg-[#F6F7F5] text-[#52635D] hover:text-[#10201B]'
                  }`}
                >
                  {opt.value > 0 && (
                    <Star
                      className={`w-3.5 h-3.5 shrink-0 ${
                        active ? 'fill-[#F4811F] text-[#F4811F]' : 'fill-[#F4811F] text-[#F4811F]'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hero Banner inspired by Card_4ef9c085.png */}
      <section className="relative rounded-3xl bg-[#066E53] text-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-5">
            <p className="text-xs sm:text-sm font-medium text-[#AEE6D4]">
              Intermediação, comparação de orçamentos e custódia M-Pesa / e-Mola
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.15] tracking-tight text-balance max-w-2xl">
              Procura um profissional verificado perto de si?
            </h1>
            <p className="text-sm sm:text-base text-white/85 max-w-xl leading-relaxed">
              Publique o serviço uma única vez, compare propostas reais de técnicos com identidade validada e pague em segurança: o valor fica retido até confirmar a conclusão.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenNewRequest()}
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#F4811F] hover:bg-[#DD6E0F] text-white font-semibold text-sm whitespace-nowrap transition-colors cursor-pointer"
              >
                <span>Pedir Orçamento</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onNavigateOpportunities}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-white/12 hover:bg-white/20 text-white font-medium text-sm whitespace-nowrap transition-colors cursor-pointer"
              >
                <span>Ver Oportunidades ({providers.length - 1} abertas)</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#055A44] p-6 sm:p-8 flex flex-col justify-between items-center text-center">
            <div className="w-full max-w-xs mx-auto my-auto py-2">
              <div className="bg-white/10 rounded-2xl p-6 flex flex-col items-center">
                <img
                  src="/assets/aistudio/biscato_logo_4fc64c75.png"
                  alt="Mascote Biscato"
                  referrerPolicy="no-referrer"
                  className="w-32 h-auto object-contain mb-4 drop-shadow-md"
                />
                <p className="font-display text-base font-bold text-white">
                  Selo Biscato Verificado
                </p>
                <p className="text-xs text-[#BCEAD9] mt-1.5 leading-relaxed">
                  BI confirmado · Cobertura até 50% de prejuízos elegíveis · Reembolso protegido em Escrow
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Strip (matching Card_4ef9c085.png) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#10201B]">
              Categorias de serviço
            </h2>
            <p className="text-sm text-[#52635D]">
              Filtre profissionais verificados por especialidade técnica
            </p>
          </div>
          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-semibold text-[#066E53] hover:underline whitespace-nowrap cursor-pointer"
            >
              Ver todas
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {SERVICE_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                className={`group flex flex-col items-center justify-center text-center p-3.5 rounded-2xl border transition-all duration-150 min-h-[104px] cursor-pointer ${
                  isSelected
                    ? 'bg-[#066E53] border-[#066E53] text-white'
                    : 'bg-white border-[#E1E7E4] hover:border-[#066E53]/50 text-[#10201B]'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center mb-2.5 transition-colors ${
                    isSelected ? 'bg-white/20 text-white' : `${cat.accentBg} ${cat.accentText}`
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold leading-tight whitespace-nowrap truncate max-w-full">
                  {cat.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Verified Providers Grid (Card_4ef9c085.png cards adapted to clean responsive grid) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#10201B]">
              Prestadores verificados disponíveis
            </h2>
            <p className="text-sm text-[#52635D]">
              {filteredProviders.length} {filteredProviders.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'} · Avaliações reais e histórico comprovado
            </p>
          </div>
        </div>

        {filteredProviders.length === 0 ? (
          <div className="bg-white border border-[#E1E7E4] rounded-2xl p-10 text-center space-y-3">
            <p className="font-display text-base font-semibold text-[#10201B]">
              Nenhum profissional encontrado para este filtro
            </p>
            <p className="text-sm text-[#52635D] max-w-md mx-auto">
              Publique o seu pedido mesmo assim para notificar técnicos próximos
              {neighborhoodQuery ? ` em ${neighborhoodQuery}` : ` em ${selectedProvince}`}
              {isPriceFiltered ? ` entre ${formatMT(minBudgetMT)} e ${formatMT(maxBudgetMT)}` : ''}
              {minRating > 0 ? ` com avaliação ${minRating.toFixed(1).replace('.', ',')}+ ★` : ''}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedProvince('Todas as Províncias');
                setSearchQuery('');
                setNeighborhoodQuery('');
                setMinBudgetMT(0);
                setMaxBudgetMT(MAX_PRICE_BOUND);
                setMinRating(0);
              }}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-[#066E53] text-white text-sm font-semibold cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider, idx) => {
              const useOrangeCta = idx % 2 === 1;
              return (
                <article
                  key={provider.id}
                  className="bg-white border border-[#E1E7E4] rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[#066E53]/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-bold text-[#10201B] leading-snug">
                          {provider.name}
                        </h3>
                        <p className="text-sm font-medium text-[#066E53]">
                          {provider.specialty}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#066E53] shrink-0">
                        <BadgeCheck className="w-4 h-4 text-[#F4811F]" aria-hidden="true" />
                        <span>Verificado</span>
                      </span>
                    </div>

                    {/* Unboxed clean metadata with typographic separators */}
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#52635D] tabular-nums">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#10201B]">
                        <Star className="w-3.5 h-3.5 fill-[#F4811F] text-[#F4811F]" aria-hidden="true" />
                        {provider.rating.toFixed(1).replace('.', ',')} ({provider.reviewsCount})
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{provider.neighborhood}</span>
                      <span aria-hidden="true">·</span>
                      <span>{provider.completedJobs} trabalhos</span>
                    </div>

                    <p className="text-sm text-[#52635D] leading-relaxed line-clamp-2">
                      {provider.bio}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <TradeIllustration category={provider.category} className="w-full h-32 rounded-xl" />

                    <div className="flex items-center justify-between text-xs text-[#52635D] pt-1">
                      <span>Base referencial</span>
                      <span className="font-mono font-semibold text-sm text-[#10201B] tabular-nums">
                        {formatMT(provider.hourlyOrBaseMT)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => onSelectProvider(provider)}
                        className="h-11 px-3 rounded-xl border border-[#D4DDD9] hover:bg-[#F6F7F5] text-[#10201B] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                      >
                        Ver Perfil
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequestQuoteForProvider(provider)}
                        className={`h-11 px-3 rounded-xl text-white text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          useOrangeCta
                            ? 'bg-[#F4811F] hover:bg-[#DD6E0F]'
                            : 'bg-[#066E53] hover:bg-[#055741]'
                        }`}
                      >
                        Pedir Orçamento
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 6-Step Sequential Flow from Mapa de Desenvolvimento */}
      <section className="bg-white border border-[#E1E7E4] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-[#10201B]">
              Como funciona o fluxo seguro Biscato
            </h2>
            <p className="text-sm text-[#52635D]">
              6 etapas da escolha do serviço até à libertação do valor em custódia
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#066E53]">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>Garantia contra fraudes e reembolso</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { n: '01', title: 'Escolher serviço', desc: 'Selecione a categoria e pesquise o que precisa.' },
            { n: '02', title: 'Escolher prestador', desc: 'Compare perfis verificados, preços e avaliações.' },
            { n: '03', title: 'Pedido e orçamento', desc: 'Descreva o trabalho, local e aprove a proposta.' },
            { n: '04', title: 'Pagamento retido', desc: 'Pague via M-Pesa, e-Mola ou Mkesh em escrow.' },
            { n: '05', title: 'Serviço executado', desc: 'Acompanhe a execução pelo chat na plataforma.' },
            { n: '06', title: 'Confirmar e avaliar', desc: 'Liberte o valor, avalie e gere créditos ao técnico.' },
          ].map((step) => (
            <div key={step.n} className="pt-3 border-t border-[#E1E7E4] space-y-1.5">
              <span className="font-mono text-xs font-semibold text-[#F4811F] tabular-nums">
                {step.n}
              </span>
              <h3 className="font-display text-sm font-bold text-[#10201B]">{step.title}</h3>
              <p className="text-xs text-[#52635D] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
