import { useEffect, useState } from 'react';
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
  const [primaryLength, setPrimaryLength] = useState(0);
  const [secondaryLength, setSecondaryLength] = useState(0);
  const [typingPhase, setTypingPhase] = useState<'primary' | 'secondary' | 'pause' | 'erase-secondary' | 'erase-primary'>('primary');

  const featuredProviders = providers.slice(0, 3);
  const currentWalkthrough = WALKTHROUGH_STEPS[activeStep];

  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPrimaryLength('A pessoa certa.'.length);
      setSecondaryLength('O trabalho certo.'.length);
      return;
    }

    const timer = window.setTimeout(() => {
      if (typingPhase === 'primary') {
        if (primaryLength < 'A pessoa certa.'.length) {
          setPrimaryLength((current) => current + 1);
        } else {
          setTypingPhase('secondary');
        }
      } else if (typingPhase === 'secondary') {
        if (secondaryLength < 'O trabalho certo.'.length) {
          setSecondaryLength((current) => current + 1);
        } else {
          setTypingPhase('pause');
        }
      } else if (typingPhase === 'pause') {
        setTypingPhase('erase-secondary');
      } else if (typingPhase === 'erase-secondary') {
        if (secondaryLength > 0) {
          setSecondaryLength((current) => current - 1);
        } else {
          setTypingPhase('erase-primary');
        }
      } else if (typingPhase === 'erase-primary') {
        if (primaryLength > 0) {
          setPrimaryLength((current) => current - 1);
        } else {
          setTypingPhase('primary');
        }
      }
    }, typingPhase === 'pause' ? 1900 : typingPhase.startsWith('erase') ? 38 : 78);

    return () => window.clearTimeout(timer);
  }, [typingPhase, primaryLength, secondaryLength]);

  return (
    <div className="space-y-14 sm:space-y-16">
      {/* 1. Interactive Marketplace Hero */}
      <section data-reveal className="border-y border-[#C9D3CE] py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <p className="section-kicker mb-5">O marketplace de serviços em Moçambique</p>
            <h1
              className="hero-title font-display font-bold text-[#10201B] tracking-[-0.045em] leading-[1.02] text-balance max-w-3xl"
              style={{ fontSize: 'clamp(3rem, 6vw, 5.75rem)', minHeight: '2.04em' }}
              aria-label="A pessoa certa. O trabalho certo."
            >
              <span className="hero-line hero-line-primary" aria-hidden="true">
                {'A pessoa certa.'.slice(0, primaryLength).slice(0, 9)}
                {primaryLength > 9 && <em>{'A pessoa certa.'.slice(9, primaryLength)}</em>}
                {typingPhase === 'primary' && <span className="typing-caret" />}
              </span>
              <span className="hero-line hero-line-secondary" aria-hidden="true">
                {'O trabalho certo.'.slice(0, secondaryLength).slice(0, 11)}
                {secondaryLength > 11 && <em>{'O trabalho certo.'.slice(11, secondaryLength)}</em>}
                {(typingPhase === 'secondary' || typingPhase === 'pause' || typingPhase === 'erase-secondary') && secondaryLength > 0 && <span className="typing-caret" />}
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-[#52635D] leading-relaxed max-w-2xl">
              Encontre profissionais verificados perto de si, compare propostas claras e mantenha o pagamento protegido até aprovar o resultado.
            </p>

            <div className="mt-7 bg-white border border-[#AEBBB5] p-2 max-w-2xl" role="search">
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="flex-1 relative">
                  <Search className="w-4 h-4 text-[#52635D] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <span className="sr-only">Tipo de serviço</span>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as Exclude<ServiceCategoryId, 'all'>)}
                    className="w-full h-13 pl-11 pr-4 bg-[#F3F5F2] border-0 text-sm font-semibold text-[#10201B] outline-none focus:ring-2 focus:ring-[#066E53] cursor-pointer"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>Preciso de: {cat.label}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => onOpenNewRequest(quickCategory)}
                  className="h-13 px-6 bg-[#F4811F] hover:bg-[#D96610] text-white text-sm font-bold inline-flex items-center justify-center gap-3 whitespace-nowrap transition-colors cursor-pointer"
                >
                  Publicar pedido <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#52635D]">
              {[
                { label: 'Canalização', cat: 'canalizacao' as const },
                { label: 'Electricidade', cat: 'eletricidade' as const },
                { label: 'Pintura', cat: 'pintura' as const },
              ].map((item) => (
                <button key={item.cat} type="button" onClick={() => onOpenNewRequest(item.cat)} className="font-semibold hover:text-[#066E53] underline decoration-[#AEBBB5] underline-offset-4 cursor-pointer">
                  {item.label}
                </button>
              ))}
              <button type="button" onClick={() => onNavigate('explore')} className="font-bold text-[#066E53] cursor-pointer">
                Ver todas as categorias →
              </button>
            </div>
          </div>

          <aside className="lg:col-span-5 border-l-0 lg:border-l border-[#C9D3CE] lg:pl-8">
            <div className="flex items-end justify-between border-b border-[#C9D3CE] pb-4">
              <div>
                <p className="text-xs font-bold text-[#066E53] uppercase tracking-[0.12em]">Pedido em andamento</p>
                <p className="mt-1 font-display text-xl font-bold text-[#10201B]">Reparação elétrica</p>
              </div>
              <span className="text-xs font-mono text-[#52635D]">#BC-2048</span>
            </div>

            <div className="py-5 border-b border-[#C9D3CE]">
              <p className="text-xs text-[#52635D]">Propostas recebidas</p>
              <p className="mt-1 font-display text-4xl font-bold tracking-tight text-[#10201B]">3 profissionais</p>
              <div className="mt-4 grid grid-cols-3 gap-px bg-[#C9D3CE]">
                {[
                  ['4,9', 'Avaliação'],
                  ['2,4 km', 'Distância'],
                  ['100%', 'Identidade'],
                ].map(([value, label]) => (
                  <div key={label} className="bg-[#F3F5F2] py-3 px-2">
                    <p className="font-mono text-sm font-bold text-[#10201B]">{value}</p>
                    <p className="mt-1 text-[10px] text-[#52635D]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 flex items-center justify-between gap-4">
              <div className="flex -space-x-2" aria-hidden="true">
                {['CM', 'JM', 'AM'].map((initials, index) => (
                  <div key={initials} className={`w-10 h-10 rounded-full border-2 border-[#F3F5F2] flex items-center justify-center text-xs font-bold ${index === 1 ? 'bg-[#F4811F] text-white' : 'bg-[#066E53] text-white'}`}>
                    {initials}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => onNavigate('proposals')} className="text-sm font-bold text-[#066E53] hover:underline cursor-pointer">
                Comparar propostas →
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* 1.5 Trust Band */}
      <section data-reveal className="grid grid-cols-2 lg:grid-cols-4 border-y border-[#C9D3CE] divide-x divide-[#C9D3CE]">
        {[
          ['Profissionais verificados', 'Identidade e histórico confirmados'],
          ['Propostas transparentes', 'Preço, prazo e condições visíveis'],
          ['Pagamento protegido', 'M-Pesa, e-Mola e Mkesh'],
          ['Suporte humano', 'Mediação quando algo corre mal'],
        ].map(([title, copy]) => (
          <div key={title} className="px-3 sm:px-5 py-4 sm:py-5">
            <p className="text-xs sm:text-sm font-bold text-[#10201B]">{title}</p>
            <p className="mt-1 text-[10px] sm:text-xs text-[#52635D]">{copy}</p>
          </div>
        ))}
      </section>

      {/* 2. Interactive "Como Funciona na Prática" Walkthrough */}
      <section data-reveal className="border-y border-[#D5D9D3] py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div className="max-w-xl">
            <p className="section-kicker mb-3">Do pedido à conclusão</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#162820]">
              Como funciona na prática
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#52635D] leading-relaxed">
              Um processo simples, com informação suficiente em cada decisão e pagamento protegido até ao resultado.
            </p>
          </div>
          <button
            type="button"
            onClick={() => activeStep === 0 ? onOpenNewRequest() : onNavigate(currentWalkthrough.targetTab)}
            className="h-11 px-5 border border-[#162820] text-[#162820] text-sm font-bold hover:bg-[#162820] hover:text-white transition-colors whitespace-nowrap cursor-pointer self-start lg:self-auto"
          >
            {currentWalkthrough.ctaLabel}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#D5D9D3]">
          {WALKTHROUGH_STEPS.map((item, index) => {
            const isSelected = activeStep === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveStep(item.id)}
                aria-pressed={isSelected}
                className={`min-h-55 text-left p-5 sm:p-6 border-b md:border-b-0 md:border-r border-[#D5D9D3] last:border-r-0 transition-all duration-300 cursor-pointer ${
                  isSelected ? 'bg-[#FFFFFF] -translate-y-1 shadow-[0_8px_24px_rgba(22,40,32,0.06)]' : 'bg-transparent hover:bg-white/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`font-mono text-xs font-bold ${isSelected ? 'text-[#1F6652]' : 'text-[#9A6A4C]'}`}>
                    {item.step}
                  </span>
                  <span className={`h-2 w-2 rounded-full mt-1 ${isSelected ? 'bg-[#C96B35]' : 'bg-[#C9CEC9]'}`} aria-hidden="true" />
                </div>
                <h3 className="mt-8 font-display text-xl font-bold leading-snug text-[#162820] max-w-70">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#52635D] max-w-80">
                  {item.summary}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-4 border border-[#D5D9D3] bg-[#FFFFFF] px-5 py-4">
          <div className="flex items-center gap-3">
            {activeStep === 0 && <MapPin className="w-5 h-5 text-[#1F6652]" aria-hidden="true" />}
            {activeStep === 1 && <BadgeCheck className="w-5 h-5 text-[#1F6652]" aria-hidden="true" />}
            {activeStep === 2 && <ShieldCheck className="w-5 h-5 text-[#1F6652]" aria-hidden="true" />}
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#1F6652]">
              Etapa {activeStep + 1}
            </span>
          </div>
          <p key={activeStep} className="text-sm text-[#52635D] animate-[softIn_240ms_ease-out]">
            {activeStep === 0 && 'A localização, a urgência e o orçamento ficam registados antes de o pedido ser publicado.'}
            {activeStep === 1 && 'Cada proposta mostra preço, prazo e condições para comparar sem recorrer a contactos externos.'}
            {activeStep === 2 && 'O valor fica protegido durante o serviço e só segue ao prestador depois da confirmação.'}
          </p>
          <button
            type="button"
            onClick={() => activeStep === 0
              ? onOpenNewRequest()
              : activeStep === 2
                ? onNavigate('escrow')
                : onNavigate(currentWalkthrough.targetTab)}
            className="text-sm font-bold text-[#162820] underline decoration-[#C96B35] underline-offset-4 cursor-pointer justify-self-start sm:justify-self-end"
          >
            Ver esta etapa →
          </button>
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
                className="border-t-2 border-[#C9D3CF] pt-5 space-y-3.5"
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
      </section>

      {/* 4. Featured Professionals Showcase (Product-first proof) */}
      <section className="editorial-rule grid min-w-0 grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-8">
        <div className="min-w-0 lg:col-span-8 space-y-6">
          <div className="flex min-w-0 flex-col items-start gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-bold leading-tight text-[#10201B]">
                Profissionais prontos para trabalhar hoje
              </h2>
              <p className="text-sm text-[#52635D]">
                Veja perfis reais com avaliações e peça orçamento diretamente.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="text-sm font-semibold text-[#066E53] hover:underline whitespace-nowrap cursor-pointer shrink-0"
            >
              Explorar todos os técnicos →
            </button>
          </div>

          <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredProviders.map((provider, idx) => (
              <article
                key={provider.id}
                className="min-w-0 w-full bg-white border border-[#DCE3DF] rounded-[10px] p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-[#066E53] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold text-[#10201B] leading-snug break-words">
                        {provider.name}
                      </h3>
                      <p className="text-sm font-medium text-[#066E53]">{provider.specialty}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#066E53] shrink-0">
                      <BadgeCheck className="w-4 h-4 text-[#F4811F]" aria-hidden="true" />
                      <span>Verificado</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#52635D] tabular-nums">
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

                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5">
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
        </div>

        {/* Chamada para Ação em Destaque */}
        <div className="min-w-0 lg:col-span-4 bg-[#102B24] text-white border-l-4 border-[#F4811F] p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold">
              Pronto para começar o seu projeto?
            </h3>
            <p className="text-sm text-white/90">
              Na Biscato, ligamos você aos melhores profissionais da sua área. Peça um orçamento e veja como é fácil realizar o seu projeto com segurança e qualidade.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenNewRequest()}
            className="h-12 rounded-xl bg-[#F4811F] hover:bg-[#DD6E0F] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer"
          >
            <span>Pedir Orçamento</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
