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
  Sparkles,
  Star,
  Truck,
  Wrench,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryId>('all');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceName>('Todas as Províncias');

  const filteredProviders = providers.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesProvince = selectedProvince === 'Todas as Províncias' || p.province === selectedProvince;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.specialty.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.province.toLowerCase().includes(q);
    return matchesCategory && matchesProvince && matchesSearch;
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

      {/* Search & Province Filter Bar */}
      <section className="bg-white border border-[#E1E7E4] rounded-2xl p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-[#52635D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar canalizador, eletricista, carpinteiro ou bairro..."
              aria-label="Pesquisar profissionais e serviços"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F6F7F5] border border-transparent focus:border-[#066E53] focus:bg-white text-sm text-[#10201B] placeholder:text-[#6B7C76] outline-none transition-colors"
            />
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
              Publique o seu pedido mesmo assim para notificar técnicos próximos em {selectedProvince}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedProvince('Todas as Províncias');
                setSearchQuery('');
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
