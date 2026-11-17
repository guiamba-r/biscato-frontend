import { useState } from 'react';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  Smartphone,
  Star,
  Wallet,
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../data/biscatoData';
import type { AppTab, ProviderProfile, ServiceCategoryId, UserRole } from '../types/biscato';
import { formatMT } from '../utils/formatters';
import { TradeIllustration } from './TradeArtwork';

interface LandingViewProps {
  providers: ProviderProfile[];
  onNavigate: (tab: AppTab) => void;
  onSelectRoleAndNavigate: (role: UserRole, tab: AppTab) => void;
  onOpenNewRequest: (initialCategory?: Exclude<ServiceCategoryId, 'all'>) => void;
  onSelectProvider: (provider: ProviderProfile) => void;
  onRequestQuoteForProvider: (provider: ProviderProfile) => void;
}

const WALKTHROUGH_STEPS = [
  {
    id: 0,
    step: '01',
    title: 'Publique o pedido em 1 minuto',
    summary: 'Escolha o serviço, indique o bairro e receba vários orçamentos sem ligar para dezenas de contactos.',
    ctaLabel: 'Publicar agora',
    targetTab: 'opportunities' as AppTab,
  },
  {
    id: 1,
    step: '02',
    title: 'Compare propostas lado a lado',
    summary: 'Veja preço em MT, prazo em dias, histórico de obras e o Selo Biscato Verificado antes de escolher.',
    ctaLabel: 'Ver comparador',
    targetTab: 'proposals' as AppTab,
  },
  {
    id: 2,
    step: '03',
    title: 'Pague só após confirmar a obra',
    summary: 'O pagamento via M-Pesa, e-Mola ou Mkesh fica protegido na Biscato e só é libertado com o seu OK.',
    ctaLabel: 'Abrir custódia',
    targetTab: 'escrow' as AppTab,
  },
];

const CLIENT_HIGHLIGHTS = [
  {
    icon: Lock,
    title: 'Zero adiantamentos perdidos',
    copy: 'O valor fica retido em custódia (M-Pesa, e-Mola ou Mkesh) e só passa para o técnico quando confirmar a conclusão.',
    accent: 'bg-[#E7F3EE] text-[#066E53]',
  },
  {
    icon: BadgeCheck,
    title: 'Técnicos com BI e histórico real',
    copy: 'Consulte trabalhos anteriores, pontualidade e avaliações reais antes de abrir a porta da sua casa ou empresa.',
    accent: 'bg-[#FFF4EA] text-[#C85A08]',
  },
  {
    icon: ShieldCheck,
    title: '30 dias grátis + proteção até 50%',
    copy: 'Experimente 30 dias sem mensalidade. Pagamentos feitos na app têm garantia de reembolso e cobertura em danos.',
    accent: 'bg-[#E7F3EE] text-[#066E53]',
  },
];

const PROVIDER_HIGHLIGHTS = [
  {
    icon: MapPin,
    title: 'Clientes perto de si todos os dias',
    copy: 'Receba pedidos reais no seu bairro sem gastar em marketing. Filtre por distância e orçamento antes de responder.',
    accent: 'bg-[#FFF4EA] text-[#C85A08]',
  },
  {
    icon: Wallet,
    title: 'Pagamento garantido antes de começar',
    copy: 'Trabalhe tranquilo sabendo que o valor já foi depositado pelo cliente. Se atrasar a mensalidade, tem 30 dias de tolerância.',
    accent: 'bg-[#E7F3EE] text-[#066E53]',
  },
  {
    icon: Award,
    title: 'Créditos para ferramentas e materiais',
    copy: 'Cada serviço concluído na plataforma soma créditos que pode trocar por equipamentos em lojas parceiras.',
    accent: 'bg-[#FFF4EA] text-[#C85A08]',
  },
];

export function LandingView({
  providers,
  onNavigate,
  onSelectRoleAndNavigate,
  onOpenNewRequest,
  onSelectProvider,
  onRequestQuoteForProvider,
}: LandingViewProps) {
  const [quickCategory, setQuickCategory] = useState<Exclude<ServiceCategoryId, 'all'>>('canalizacao');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [audienceTab, setAudienceTab] = useState<'client' | 'provider'>('client');

  const featuredProviders = providers.slice(0, 3);
  const currentWalkthrough = WALKTHROUGH_STEPS[activeStep];

  return (
    <div className="space-y-14 sm:space-y-16">
      {/* 1. Interactive Marketplace Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#066E53]">
              Maputo · Matola · Todas as 11 províncias de Moçambique
            </p>
            <h1
              className="font-display font-bold text-[#10201B] tracking-tight leading-[1.08] text-balance max-w-2xl"
              style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.5rem)' }}
            >
              O técnico certo para a sua casa, sem riscos.
            </h1>
            <p className="text-base sm:text-lg text-[#52635D] leading-relaxed max-w-xl">
              Compare orçamentos de canalizadores, eletricistas, pintores e carpinteiros verificados — e pague via M-Pesa ou e-Mola só depois do serviço pronto.
            </p>
          </div>

          {/* Interactive Quick-Launch Bar */}
          <div className="bg-white border border-[#E1E7E4] rounded-2xl p-2.5 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-[#52635D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value as Exclude<ServiceCategoryId, 'all'>)}
                  aria-label="Escolha o tipo de serviço"
                  className="w-full h-12 pl-10 pr-3 rounded-xl bg-[#F6F7F5] text-sm font-medium text-[#10201B] outline-none focus:ring-2 focus:ring-[#066E53]/25 cursor-pointer"
                >
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      Preciso de: {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => onOpenNewRequest(quickCategory)}
                className="h-12 px-6 rounded-xl bg-[#F4811F] hover:bg-[#DD6E0F] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                <span>Pedir Orçamento</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Quick Popular Actions */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#52635D]">
            <span className="font-medium text-[#10201B]">Mais procurados:</span>
            {[
              { label: 'Canalização', cat: 'canalizacao' as const },
              { label: 'Electricidade', cat: 'eletricidade' as const },
              { label: 'Pintura', cat: 'pintura' as const },
              { label: 'Carpintaria', cat: 'carpintaria' as const },
            ].map((item) => (
              <button
                key={item.cat}
                type="button"
                onClick={() => onOpenNewRequest(item.cat)}
                className="hover:text-[#066E53] underline underline-offset-4 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onSelectRoleAndNavigate('provider', 'opportunities')}
              className="font-semibold text-[#066E53] hover:underline cursor-pointer"
            >
              Sou prestador →
            </button>
          </div>
        </div>

        {/* Visual Showcase Panel */}
        <div className="lg:col-span-5 bg-[#066E53] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between gap-4">
            <img
              src="/assets/aistudio/biscato_logo_4fc64c75.png"
              alt="Mascote Biscato"
              referrerPolicy="no-referrer"
              className="w-24 h-auto object-contain"
            />
            <div className="text-right">
              <span className="text-xs text-[#AEE6D4] block">Proteção ativa</span>
              <span className="font-display text-lg font-bold">Selo Biscato</span>
            </div>
          </div>

          {/* Tactile Mini-Card Preview (like Card_4ef9c085 & cls_f9822802) */}
          <div className="bg-white text-[#10201B] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E7F3EE] text-[#066E53] font-display font-bold text-sm flex items-center justify-center shrink-0">
                  CM
                </div>
                <div>
                  <p className="font-display text-sm font-bold leading-tight">Carlos Mucavele</p>
                  <p className="text-xs text-[#52635D]">Canalizador · Polana Cimento</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10201B] tabular-nums">
                <Star className="w-3.5 h-3.5 fill-[#F4811F] text-[#F4811F]" aria-hidden="true" />
                4,9
              </span>
            </div>

            <div className="pt-3 border-t border-[#E1E7E4] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#066E53] font-semibold">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>2.800 MT retidos via M-Pesa</span>
              </div>
              <span className="text-[#52635D]">BI Verificado</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/85">
            <span>30 dias grátis para novos clientes</span>
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="font-semibold text-[#FFB26B] hover:underline cursor-pointer"
            >
              Explorar profissionais →
            </button>
          </div>
        </div>
      </section>

      {/* 2. Interactive "Como Funciona na Prática" Walkthrough */}
      <section className="bg-white border border-[#E1E7E4] rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#10201B]">
              Como funciona na prática
            </h2>
            <p className="text-sm text-[#52635D] mt-1">
              Clique nas etapas abaixo para ver como a Biscato protege o serviço do início ao fim.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(currentWalkthrough.targetTab)}
            className="text-sm font-semibold text-[#066E53] hover:underline whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            {currentWalkthrough.ctaLabel} →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Interactive Stepper */}
          <div className="lg:col-span-6 space-y-3">
            {WALKTHROUGH_STEPS.map((item) => {
              const isSelected = activeStep === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveStep(item.id)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-colors cursor-pointer flex items-start gap-4 ${
                    isSelected
                      ? 'bg-[#E7F3EE] border-[#066E53]'
                      : 'bg-white border-[#E1E7E4] hover:border-[#066E53]/40'
                  }`}
                >
                  <span
                    className={`font-mono text-sm font-bold tabular-nums shrink-0 mt-0.5 ${
                      isSelected ? 'text-[#066E53]' : 'text-[#F4811F]'
                    }`}
                  >
                    {item.step}
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-[#10201B]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#52635D] leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Step Preview Screen */}
          <div className="lg:col-span-6 bg-[#F6F7F5] rounded-2xl p-5 sm:p-7 min-h-[280px] flex flex-col justify-center">
            {activeStep === 0 && (
              <div className="bg-white border border-[#E1E7E4] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#C85A08]">Urgente · Canalização</span>
                  <span className="font-mono text-[#52635D]">1,2 km de distância</span>
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-[#10201B]">
                    Reparar fuga na cozinha
                  </h4>
                  <p className="text-xs text-[#52635D] mt-0.5">
                    Polana Cimento, Maputo · Publicado hoje
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E1E7E4] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#52635D] block">Orçamento estimado</span>
                    <span className="font-mono text-base font-bold text-[#10201B] tabular-nums">
                      2.500 – 3.200 MT
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenNewRequest('canalizacao')}
                    className="h-10 px-4 rounded-xl bg-[#066E53] text-white text-xs font-semibold cursor-pointer"
                  >
                    Testar Pedido
                  </button>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-3">
                <div className="bg-white border-2 border-[#066E53] rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E7F3EE] text-[#066E53] font-bold text-xs flex items-center justify-center shrink-0">
                      AM
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#C85A08]">Combinação Melhor</p>
                      <p className="font-display text-sm font-bold text-[#10201B]">António Massango</p>
                      <p className="text-xs text-[#52635D]">4,9 ★ · 86 trabalhos · BI Verificado</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-base font-bold text-[#10201B] tabular-nums">8.500 MT</p>
                    <p className="text-xs text-[#066E53] font-semibold">3 dias</p>
                  </div>
                </div>

                <div className="bg-white border border-[#E1E7E4] rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF4EA] text-[#C85A08] font-bold text-xs flex items-center justify-center shrink-0">
                      JM
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-[#10201B]">José Machava</p>
                      <p className="text-xs text-[#52635D]">4,7 ★ · 41 trabalhos · BI Verificado</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-base font-bold text-[#10201B] tabular-nums">7.900 MT</p>
                    <p className="text-xs text-[#52635D]">5 dias</p>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="bg-[#066E53] text-white rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#AEE6D4] block">Valor protegido na Biscato</span>
                    <span className="font-mono text-2xl font-bold tabular-nums">8.500 MT</span>
                  </div>
                  <Smartphone className="w-6 h-6 text-[#AEE6D4]" aria-hidden="true" />
                </div>
                <div className="space-y-2 text-xs text-white/90 pt-2 border-t border-white/15">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#AEE6D4] shrink-0" aria-hidden="true" />
                    <span>Recebido via M-Pesa · O técnico não recebe antes da entrega</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FFB26B] shrink-0" aria-hidden="true" />
                    <span>Garantia de reembolso e cobertura até 50% de prejuízos</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Interactive Dual Value Switcher: Cliente vs Prestador */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#10201B]">
              Feito para quem contrata e para quem executa
            </h2>
            <p className="text-sm text-[#52635D] mt-1">
              Alterne entre perfis para ver as vantagens imediatas na plataforma.
            </p>
          </div>

          {/* Segmented Toggle */}
          <div className="inline-flex p-1 bg-[#E9EEEC] rounded-xl self-start sm:self-auto" role="tablist" aria-label="Benefícios por perfil">
            <button
              type="button"
              role="tab"
              aria-selected={audienceTab === 'client'}
              onClick={() => setAudienceTab('client')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                audienceTab === 'client'
                  ? 'bg-white text-[#066E53] shadow-xs'
                  : 'text-[#52635D] hover:text-[#10201B]'
              }`}
            >
              Para Clientes
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={audienceTab === 'provider'}
              onClick={() => setAudienceTab('provider')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                audienceTab === 'provider'
                  ? 'bg-white text-[#066E53] shadow-xs'
                  : 'text-[#52635D] hover:text-[#10201B]'
              }`}
            >
              Para Prestadores
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(audienceTab === 'client' ? CLIENT_HIGHLIGHTS : PROVIDER_HIGHLIGHTS).map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="bg-white border border-[#E1E7E4] rounded-2xl p-6 space-y-3.5"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.accent}`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#10201B]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#52635D] leading-relaxed">
                  {item.copy}
                </p>
              </article>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#E7F3EE] rounded-2xl p-5 sm:p-6">
          <div className="space-y-0.5">
            <p className="font-display text-base font-bold text-[#054A38]">
              {audienceTab === 'client'
                ? 'Pronto para resolver um serviço em casa ou na empresa?'
                : 'Quer começar a receber pedidos verificados na sua zona?'}
            </p>
            <p className="text-xs sm:text-sm text-[#2B6655]">
              {audienceTab === 'client'
                ? 'Novos clientes têm 30 dias gratuitos e pagamento protegido em M-Pesa, e-Mola ou Mkesh.'
                : 'Ganhe créditos por cada obra concluída e troque por materiais e ferramentas.'}
            </p>
          </div>
          {audienceTab === 'client' ? (
            <button
              type="button"
              onClick={() => onOpenNewRequest()}
              className="h-11 px-5 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              Pedir Orçamento Agora
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectRoleAndNavigate('provider', 'opportunities')}
              className="h-11 px-5 rounded-xl bg-[#F4811F] hover:bg-[#DD6E0F] text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              Ver Oportunidades Abertas
            </button>
          )}
        </div>
      </section>

      {/* 4. Featured Professionals Showcase (Product-first proof) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#10201B]">
              Profissionais prontos para trabalhar hoje
            </h2>
            <p className="text-sm text-[#52635D]">
              Veja perfis reais com avaliações e peça orçamento diretamente.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="text-sm font-semibold text-[#066E53] hover:underline whitespace-nowrap cursor-pointer"
          >
            Explorar todos os técnicos →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProviders.map((provider, idx) => (
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
                    <p className="text-sm font-medium text-[#066E53]">{provider.specialty}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#066E53] shrink-0">
                    <BadgeCheck className="w-4 h-4 text-[#F4811F]" aria-hidden="true" />
                    <span>Verificado</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#52635D] tabular-nums">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#10201B]">
                    <Star className="w-3.5 h-3.5 fill-[#F4811F] text-[#F4811F]" aria-hidden="true" />
                    {provider.rating.toFixed(1).replace('.', ',')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{provider.neighborhood}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono font-semibold text-[#10201B]">{formatMT(provider.hourlyOrBaseMT)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <TradeIllustration category={provider.category} className="w-full h-28 rounded-xl" />

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectProvider(provider)}
                    className="h-10 px-3 rounded-xl border border-[#D4DDD9] hover:bg-[#F6F7F5] text-xs font-semibold text-[#10201B] cursor-pointer"
                  >
                    Ver Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestQuoteForProvider(provider)}
                    className={`h-10 px-3 rounded-xl text-white text-xs font-semibold cursor-pointer ${
                      idx === 1 ? 'bg-[#F4811F] hover:bg-[#DD6E0F]' : 'bg-[#066E53] hover:bg-[#055741]'
                    }`}
                  >
                    Pedir Orçamento
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
