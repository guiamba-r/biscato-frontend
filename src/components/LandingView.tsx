import {
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Star,
  Wrench,
} from 'lucide-react';
import type { AppTab, UserRole } from '../types/biscato';

interface LandingViewProps {
  onNavigate: (tab: AppTab) => void;
  onSelectRoleAndNavigate: (role: UserRole, tab: AppTab) => void;
  onOpenNewRequest: () => void;
}

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Escolha o serviço',
    description:
      'Selecione a categoria técnica de que precisa — canalização, electricidade, construção, carpintaria, pintura, mecânica ou mudanças — e indique a sua zona.',
  },
  {
    number: '02',
    title: 'Publique uma única vez',
    description:
      'Em vez de ligar para cinco profissionais e repetir o mesmo problema cinco vezes, descreva o trabalho e o orçamento estimado num único pedido.',
  },
  {
    number: '03',
    title: 'Compare propostas reais',
    description:
      'Receba orçamentos em Meticais (MT), compare prazos de execução, avaliações anteriores e verifique o Selo Biscato Verificado antes de decidir.',
  },
  {
    number: '04',
    title: 'Pagamento retido em Custódia',
    description:
      'Pague por M-Pesa, e-Mola, Mkesh ou cartão. O valor fica guardado em segurança na Biscato e só avança para o prestador após a sua confirmação.',
  },
  {
    number: '05',
    title: 'Execução acompanhada',
    description:
      'O prestador realiza o trabalho dentro do prazo combinado enquanto acompanha o progresso e comunica diretamente pelo chat da plataforma.',
  },
  {
    number: '06',
    title: 'Confirmar, libertar e avaliar',
    description:
      'Confirme que o serviço foi bem executado para libertar o valor da custódia, avalie o profissional e gere créditos para o técnico.',
  },
];

const CLIENT_BENEFITS = [
  {
    title: 'Profissionais verificados e reputação real',
    detail:
      'Substitua o risco do "boca a boca" por técnicos com identidade validada (BI), antecedentes verificados, histórico de obras e avaliações reais de outros clientes.',
  },
  {
    title: 'Comparação rápida de preços e prazos',
    detail:
      'Publique a necessidade uma só vez e compare múltiplas propostas lado a lado — preços em MT, prazo em dias e garantia — num único ecrã.',
  },
  {
    title: 'Pagamento protegido em Custódia (Escrow)',
    detail:
      'Nunca mais perca adiantamentos. O dinheiro fica retido na plataforma e só é libertado para o prestador depois de confirmar que o trabalho foi concluído.',
  },
  {
    title: 'Reembolso e cobertura de até 50% em prejuízos',
    detail:
      'Se houver incumprimento comprovado ou danos causados pelo prestador numa transação feita pela app, a Biscato assegura reembolso e cobertura até 50% dos prejuízos elegíveis.',
  },
  {
    title: '30 dias gratuitos iniciais e pagamentos locais',
    detail:
      'Novos clientes têm 30 dias de acesso gratuito após o registo e podem pagar facilmente via M-Pesa, e-Mola, Mkesh ou cartão com parcelamento.',
  },
];

const PROVIDER_BENEFITS = [
  {
    title: 'Fluxo contínuo de clientes prontos a contratar',
    detail:
      'Acabe com os "períodos de seca" sem ter de criar site ou investir em marketing: a Biscato entrega pedidos reais de clientes na sua província e bairro.',
  },
  {
    title: 'Otimização de agenda e zero deslocações em vão',
    detail:
      'Filtre oportunidades por distância em quilómetros, categoria e orçamento disponível antes de aceitar ou enviar uma proposta.',
  },
  {
    title: 'Pagamento garantido antes de iniciar a obra',
    detail:
      'Quando o cliente aprova o orçamento, o valor já está retido em custódia na Biscato. Trabalha com a certeza de receber sem precisar de cobrar dívidas.',
  },
  {
    title: 'Créditos para materiais e equipamentos',
    detail:
      'Cada trabalho concluído dentro da plataforma acumula Créditos Biscato que podem ser convertidos em apoio ou financiamento para ferramentas e materiais em lojas parceiras.',
  },
  {
    title: 'Selo de confiança e tolerância de 30 dias',
    detail:
      'Construa reputação digital para subir nos resultados de busca. Em caso de atraso na subscrição mensal, dispõe de 30 dias de tolerância pagando apenas 10% por transação.',
  },
];

export function LandingView({
  onNavigate,
  onSelectRoleAndNavigate,
  onOpenNewRequest,
}: LandingViewProps) {
  return (
    <div className="space-y-14 sm:space-y-16">
      {/* 1. Hero Section: Proposition + Dominant Visual Anchor */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 py-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#066E53]">
            <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Moçambique · Cidade de Maputo, Matola e todas as 11 províncias</span>
          </div>

          <h1
            className="font-display font-bold text-[#10201B] tracking-tight leading-[1.1] text-balance max-w-2xl"
            style={{ fontSize: 'clamp(2.25rem, 4vw, 3.45rem)' }}
          >
            Contrate técnicos verificados com pagamento seguro em custódia.
          </h1>

          <p className="text-base sm:text-lg text-[#52635D] leading-relaxed max-w-xl">
            A Biscato simplifica a contratação de canalizadores, eletricistas, pedreiros, pintores, carpinteiros e mecânicos. Compare orçamentos num só lugar e pague via M-Pesa, e-Mola ou Mkesh sem risco de fraude.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <button
              type="button"
              onClick={onOpenNewRequest}
              className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              <span>Pedir Orçamento Grátis</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onSelectRoleAndNavigate('provider', 'opportunities')}
              className="inline-flex items-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl border border-[#D4DDD9] bg-white hover:bg-[#F6F7F5] text-[#10201B] text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              <span>Sou Prestador de Serviços</span>
            </button>
          </div>

          <p className="text-xs text-[#52635D]">
            Novos clientes têm 30 dias de acesso gratuito · Prestadores acumulam créditos em equipamentos
          </p>
        </div>

        {/* Dominant Emerald Focal Panel */}
        <div className="lg:col-span-5 bg-[#066E53] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between gap-4">
            <img
              src="/assets/aistudio/biscato_logo_4fc64c75.png"
              alt="Logótipo oficial Biscato"
              referrerPolicy="no-referrer"
              className="w-24 h-auto object-contain"
            />
            <div className="text-right">
              <span className="block text-xs text-[#AEE6D4]">Custódia Digital (Escrow)</span>
              <span className="font-mono text-2xl font-bold tabular-nums">8.500 MT</span>
              <span className="block text-xs text-white/80">Retido até à sua confirmação</span>
            </div>
          </div>

          {/* Clean custody preview inside the emerald panel */}
          <div className="bg-[#055741] rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between text-xs text-[#AEE6D4]">
              <span className="font-semibold text-white">Proteção em cada etapa</span>
              <span>M-Pesa · e-Mola · Mkesh</span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#AEE6D4] shrink-0" aria-hidden="true" />
                <span>1. Orçamento aprovado e valor protegido</span>
              </div>
              <div className="flex items-center gap-3">
                <Wrench className="w-4 h-4 text-[#F4811F] shrink-0" aria-hidden="true" />
                <span>2. Técnico verificado executa o serviço</span>
              </div>
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-[#AEE6D4] shrink-0" aria-hidden="true" />
                <span>3. Cliente confirma e liberta o pagamento</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-white/85 pt-1">
            <span>Cobertura até 50% em prejuízos elegíveis</span>
            <button
              type="button"
              onClick={() => onNavigate('escrow')}
              className="font-semibold text-[#FFB26B] hover:underline whitespace-nowrap cursor-pointer"
            >
              Simular Custódia →
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column Quantified Trust Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-[#E1E7E4] rounded-2xl p-5 sm:p-6">
        <div className="space-y-1">
          <span className="font-display text-2xl font-bold text-[#066E53] tabular-nums block">
            30 dias grátis
          </span>
          <span className="text-xs text-[#52635D] block leading-relaxed">
            Acesso inicial gratuito para novos clientes conhecerem a plataforma
          </span>
        </div>
        <div className="space-y-1">
          <span className="font-display text-2xl font-bold text-[#10201B] tabular-nums block">
            Até 50%
          </span>
          <span className="text-xs text-[#52635D] block leading-relaxed">
            Cobertura de prejuízos elegíveis para transações pagas dentro da app
          </span>
        </div>
        <div className="space-y-1">
          <span className="font-display text-2xl font-bold text-[#F4811F] tabular-nums block">
            10% taxa
          </span>
          <span className="text-xs text-[#52635D] block leading-relaxed">
            Período de tolerância de 30 dias caso o prestador atrase a mensalidade
          </span>
        </div>
        <div className="space-y-1">
          <span className="font-display text-2xl font-bold text-[#10201B] tabular-nums block">
            11 províncias
          </span>
          <span className="text-xs text-[#52635D] block leading-relaxed">
            De Maputo e Matola até Nampula, Sofala, Zambézia e Cabo Delgado
          </span>
        </div>
      </section>

      {/* 2. Mechanism: Como a App Funciona (6 Etapas) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#066E53]">
              01. Como a aplicação funciona
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#10201B]">
              Seis passos simples do pedido à conclusão garantida
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="text-sm font-semibold text-[#066E53] hover:underline whitespace-nowrap self-start md:self-auto cursor-pointer"
          >
            Explorar profissionais disponíveis →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <article
              key={step.number}
              className="bg-white border border-[#E1E7E4] rounded-2xl p-6 space-y-2.5"
            >
              <span className="font-mono text-sm font-bold text-[#F4811F] tabular-nums block">
                {step.number}
              </span>
              <h3 className="font-display text-lg font-bold text-[#10201B]">
                {step.title}
              </h3>
              <p className="text-sm text-[#52635D] leading-relaxed">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 3A. Benefícios para o Cliente (Asymmetric Split) */}
      <section className="bg-white border border-[#E1E7E4] rounded-3xl p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-[#E7F3EE] rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="w-11 h-11 rounded-xl bg-[#066E53] text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#066E53]">
                02. Benefícios para o Cliente
              </p>
              <h2 className="font-display text-2xl font-bold text-[#10201B] leading-snug">
                Previsibilidade, proteção contra fraudes e comparação justa
              </h2>
              <p className="text-sm text-[#2B6655] leading-relaxed">
                Ideal para famílias urbanas, pequenos negócios, escritórios, restaurantes, condomínios e membros da diáspora com imóveis em Moçambique.
              </p>
            </div>

            <div className="pt-2 space-y-2 text-xs text-[#054A38]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 shrink-0 text-[#066E53]" aria-hidden="true" />
                <span>Pague com M-Pesa, e-Mola, Mkesh ou cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 shrink-0 text-[#066E53]" aria-hidden="true" />
                <span>Proteção integral só para transações feitas na app</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenNewRequest}
              className="w-full h-11 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              Publicar Pedido Agora
            </button>
          </div>

          <div className="lg:col-span-7 divide-y divide-[#E1E7E4]">
            {CLIENT_BENEFITS.map((item, idx) => (
              <div key={item.title} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                <span className="font-mono text-xs font-bold text-[#066E53] pt-1 tabular-nums shrink-0">
                  0{idx + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="font-display text-base font-bold text-[#10201B]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#52635D] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3B. Benefícios para o Prestador de Serviços (Reversed Asymmetric Split) */}
      <section className="bg-white border border-[#E1E7E4] rounded-3xl p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 order-2 lg:order-1 divide-y divide-[#E1E7E4]">
            {PROVIDER_BENEFITS.map((item, idx) => (
              <div key={item.title} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                <span className="font-mono text-xs font-bold text-[#F4811F] pt-1 tabular-nums shrink-0">
                  0{idx + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="font-display text-base font-bold text-[#10201B]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#52635D] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 bg-[#FFF4EA] rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="w-11 h-11 rounded-xl bg-[#F4811F] text-white flex items-center justify-center">
              <Award className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#C85A08]">
                03. Benefícios para o Prestador de Serviços
              </p>
              <h2 className="font-display text-2xl font-bold text-[#10201B] leading-snug">
                Mais clientes, rendimento previsível e créditos em ferramentas
              </h2>
              <p className="text-sm text-[#6E4420] leading-relaxed">
                Para pedreiros, canalizadores, eletricistas, pintores, carpinteiros, mecânicos, técnicos de frio e jovens profissionais qualificados.
              </p>
            </div>

            <div className="pt-2 space-y-2 text-xs text-[#6E4420]">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 shrink-0 text-[#F4811F]" aria-hidden="true" />
                <span>Selo Biscato Verificado aumenta a visibilidade nas buscas</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 shrink-0 text-[#F4811F]" aria-hidden="true" />
                <span>Acumule créditos convertíveis em lojas de materiais</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectRoleAndNavigate('provider', 'opportunities')}
              className="w-full h-11 rounded-xl bg-[#F4811F] hover:bg-[#DD6E0F] text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              Ver Oportunidades Próximas
            </button>
          </div>
        </div>
      </section>

      {/* 4. Final Action / Prototype Navigation Banner */}
      <section className="rounded-3xl bg-[#10201B] text-white p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-balance">
            Experimente o fluxo completo da Biscato em funcionamento
          </h2>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed">
            Explore prestadores verificados, compare propostas recebidas, simule o pagamento retido em M-Pesa ou consulte o modelo financeiro e Business Model Canvas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('proposals')}
            className="h-11 px-5 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
          >
            Comparar Propostas
          </button>
          <button
            type="button"
            onClick={() => onNavigate('business')}
            className="h-11 px-5 rounded-xl bg-white/12 hover:bg-white/20 text-white text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer"
          >
            Plano & Finanças
          </button>
        </div>
      </section>
    </div>
  );
}
