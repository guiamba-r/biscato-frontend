import { useState } from 'react';
import { Award, Calculator, CheckCircle2, Layers, ShieldCheck, Users } from 'lucide-react';
import {
  BUSINESS_CANVAS_BLOCKS,
  COMPETITORS,
  MOZAMBIQUE_PROVINCES,
  TEAM_DECISIONS,
  VALIDATION_HYPOTHESES,
} from '../data/biscatoData';
import type { ClientPlanState, ProviderSubscriptionState } from '../types/biscato';
import { formatMT } from '../utils/formatters';

interface BusinessModelViewProps {
  clientPlan: ClientPlanState;
  onChangeClientPlan: (plan: ClientPlanState) => void;
  providerSubState: ProviderSubscriptionState;
  onChangeProviderSubState: (state: ProviderSubscriptionState) => void;
  providerCredits: number;
  onRedeemCredits: (cost: number, itemLabel: string) => void;
}

const PARTNER_TOOLS = [
  { id: 'tool-1', label: 'Kit Chaves & Alicates Isolados', partner: 'Ferragens Maputo', cost: 400 },
  { id: 'tool-2', label: 'Multímetro Digital Profissional', partner: 'Loja Elétrica Matola', cost: 750 },
  { id: 'tool-3', label: 'Vale Materiais de Canalização', partner: 'Construa Moçambique', cost: 1000 },
];

export function BusinessModelView({
  clientPlan,
  onChangeClientPlan,
  providerSubState,
  onChangeProviderSubState,
  providerCredits,
  onRedeemCredits,
}: BusinessModelViewProps) {
  const [redeemedNotice, setRedeemedNotice] = useState<string | null>(null);

  // Interactive Financial Break-Even Simulator (from Section 5 & Meeting Report)
  const [monthlyJobs, setMonthlyJobs] = useState(240);
  const [avgTicketMT, setAvgTicketMT] = useState(4500);
  const [commissionRate, setCommissionRate] = useState(12);
  const [activeSubProviders, setActiveSubProviders] = useState(110);
  const [providerSubPriceMT, setProviderSubPriceMT] = useState(500);
  const [fixedCostsMT, setFixedCostsMT] = useState(145000);

  const gmvMT = monthlyJobs * avgTicketMT;
  const commissionRevenueMT = Math.round((gmvMT * commissionRate) / 100);
  const subscriptionRevenueMT = activeSubProviders * providerSubPriceMT;
  const totalRevenueMT = commissionRevenueMT + subscriptionRevenueMT;
  const netResultMT = totalRevenueMT - fixedCostsMT;

  const avgRevenuePerJob = (avgTicketMT * commissionRate) / 100;
  const remainingAfterSubs = Math.max(0, fixedCostsMT - subscriptionRevenueMT);
  const breakEvenJobs = avgRevenuePerJob > 0 ? Math.ceil(remainingAfterSubs / avgRevenuePerJob) : 0;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#066E53]">
            Estratégia, Monetização & Viabilidade · Relatório de 20 de Outubro de 2026
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#10201B] mt-1">
            Modelo de Negócio & Regras Biscato
          </h1>
          <p className="text-sm text-[#52635D] mt-1 max-w-3xl">
            Simulação operacional do modelo híbrido (subscrições + taxa de 10% em tolerância), créditos para prestadores, ponto de equilíbrio em MT, Business Model Canvas e matriz competitiva.
          </p>
        </div>
      </div>

      {/* Section 1: Interactive Monetization, Tolerance (30d / 10%) & Credits */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subscription & Tolerance Rules */}
        <div className="lg:col-span-7 bg-white border border-[#E1E7E4] rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#10201B]">
                Regras de Subscrição e Tolerância (30 dias)
              </h2>
              <p className="text-sm text-[#52635D]">
                Teste as condições definidas no relatório para clientes e prestadores.
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#066E53] shrink-0" aria-hidden="true" />
          </div>

          {/* Client Plan Selector */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-[#10201B]">
              Acesso do Cliente (30 dias gratuitos iniciais)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'free_trial_30d' as const, title: '30 Dias Grátis', desc: 'Acesso inicial pós-registo' },
                { id: 'monthly_client' as const, title: 'Plano Cliente', desc: 'Subscrição após período grátis' },
                { id: 'enterprise_condo' as const, title: 'Condomínios / PME', desc: 'Gestão recorrente de imóveis' },
              ].map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => onChangeClientPlan(plan.id)}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    clientPlan === plan.id
                      ? 'border-[#066E53] bg-[#E7F3EE]'
                      : 'border-[#E1E7E4] hover:border-[#066E53]/40'
                  }`}
                >
                  <span className="block text-xs font-bold text-[#10201B]">{plan.title}</span>
                  <span className="block text-[11px] text-[#52635D] mt-0.5">{plan.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Provider Tolerance State Selector */}
          <div className="space-y-2.5 pt-2 border-t border-[#E1E7E4]">
            <span className="block text-xs font-semibold text-[#10201B]">
              Estado da Subscrição do Prestador (Impacta a taxa aplicada no Escrow)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onChangeProviderSubState('active')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  providerSubState === 'active'
                    ? 'border-[#066E53] bg-[#E7F3EE]'
                    : 'border-[#E1E7E4] hover:border-[#066E53]/40'
                }`}
              >
                <span className="block text-xs font-bold text-[#066E53]">Subscrição Ativa</span>
                <span className="block text-[11px] text-[#52635D] mt-0.5">
                  Perfil visível · 0% taxa extra de atraso
                </span>
              </button>

              <button
                type="button"
                onClick={() => onChangeProviderSubState('tolerance_30d')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  providerSubState === 'tolerance_30d'
                    ? 'border-[#F4811F] bg-[#FFF4EA]'
                    : 'border-[#E1E7E4] hover:border-[#F4811F]/50'
                }`}
              >
                <span className="block text-xs font-bold text-[#C85A08]">Tolerância 30 Dias</span>
                <span className="block text-[11px] text-[#52635D] mt-0.5">
                  Atraso na mensalidade · Taxa de 10% por transação
                </span>
              </button>

              <button
                type="button"
                onClick={() => onChangeProviderSubState('suspended')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  providerSubState === 'suspended'
                    ? 'border-[#B53D26] bg-[#FDEAE6]'
                    : 'border-[#E1E7E4] hover:border-[#B53D26]/40'
                }`}
              >
                <span className="block text-xs font-bold text-[#B53D26]">Perfil Suspenso (&gt;30d)</span>
                <span className="block text-[11px] text-[#52635D] mt-0.5">
                  Dívida não regularizada · Aguardando reativação
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Provider Credits Redemption */}
        <div className="lg:col-span-5 bg-white border border-[#E1E7E4] rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#10201B]">
                Créditos para Prestadores
              </h2>
              <p className="text-xs text-[#52635D]">
                Acumule por transações concluídas no Escrow e converta em apoio para materiais.
              </p>
            </div>
            <Award className="w-5 h-5 text-[#F4811F] shrink-0" aria-hidden="true" />
          </div>

          <div className="bg-[#066E53] text-white rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#AEE6D4]">Saldo acumulado atual</span>
              <p className="font-mono text-2xl font-bold tabular-nums">{providerCredits} pts</p>
            </div>
            <span className="text-xs text-white/85 text-right max-w-[140px]">
              1% do valor concluído na Biscato = créditos
            </span>
          </div>

          <div className="space-y-2.5">
            {PARTNER_TOOLS.map((item) => {
              const canRedeem = providerCredits >= item.cost;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#E1E7E4]"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#10201B]">{item.label}</p>
                    <p className="text-[11px] text-[#52635D]">{item.partner} · {item.cost} pts</p>
                  </div>
                  <button
                    type="button"
                    disabled={!canRedeem}
                    onClick={() => {
                      onRedeemCredits(item.cost, item.label);
                      setRedeemedNotice(`Vale "${item.label}" emitido para levantamento em ${item.partner}.`);
                    }}
                    className={`h-9 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      canRedeem
                        ? 'bg-[#F4811F] hover:bg-[#DD6E0F] text-white cursor-pointer'
                        : 'bg-[#F6F7F5] text-[#98A6A1] cursor-not-allowed'
                    }`}
                  >
                    Converter
                  </button>
                </div>
              );
            })}
          </div>

          {redeemedNotice && (
            <p className="text-xs font-medium text-[#066E53] bg-[#E7F3EE] rounded-xl p-3">
              {redeemedNotice}
            </p>
          )}
        </div>
      </section>

      {/* Section 2: Financial Planning & Break-Even Calculator */}
      <section className="bg-white border border-[#E1E7E4] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-[#10201B]">
              Planeamento Financeiro e Ponto de Equilíbrio (Break-even)
            </h2>
            <p className="text-sm text-[#52635D]">
              Ajuste os parâmetros de comissão (10%–15%), subscrições e custos fixos mensais em Meticais.
            </p>
          </div>
          <Calculator className="w-5 h-5 text-[#066E53] shrink-0" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="space-y-1.5 block">
              <div className="flex justify-between text-xs font-semibold text-[#10201B]">
                <span>Serviços concluídos / mês</span>
                <span className="font-mono text-[#066E53] tabular-nums">{monthlyJobs}</span>
              </div>
              <input
                type="range"
                min={40}
                max={800}
                step={10}
                value={monthlyJobs}
                onChange={(e) => setMonthlyJobs(Number(e.target.value))}
                className="w-full accent-[#066E53]"
              />
            </label>

            <label className="space-y-1.5 block">
              <div className="flex justify-between text-xs font-semibold text-[#10201B]">
                <span>Ticket médio (MT)</span>
                <span className="font-mono text-[#066E53] tabular-nums">{formatMT(avgTicketMT)}</span>
              </div>
              <input
                type="range"
                min={1500}
                max={12000}
                step={250}
                value={avgTicketMT}
                onChange={(e) => setAvgTicketMT(Number(e.target.value))}
                className="w-full accent-[#066E53]"
              />
            </label>

            <label className="space-y-1.5 block">
              <div className="flex justify-between text-xs font-semibold text-[#10201B]">
                <span>Comissão / Taxa efetiva (%)</span>
                <span className="font-mono text-[#F4811F] tabular-nums">{commissionRate}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={15}
                step={1}
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full accent-[#F4811F]"
              />
            </label>

            <label className="space-y-1.5 block">
              <div className="flex justify-between text-xs font-semibold text-[#10201B]">
                <span>Prestadores pagantes / mês</span>
                <span className="font-mono text-[#066E53] tabular-nums">{activeSubProviders}</span>
              </div>
              <input
                type="range"
                min={20}
                max={500}
                step={10}
                value={activeSubProviders}
                onChange={(e) => setActiveSubProviders(Number(e.target.value))}
                className="w-full accent-[#066E53]"
              />
            </label>

            <label className="space-y-1.5 block">
              <div className="flex justify-between text-xs font-semibold text-[#10201B]">
                <span>Mensalidade do prestador (MT)</span>
                <span className="font-mono text-[#066E53] tabular-nums">{formatMT(providerSubPriceMT)}</span>
              </div>
              <input
                type="range"
                min={250}
                max={1500}
                step={50}
                value={providerSubPriceMT}
                onChange={(e) => setProviderSubPriceMT(Number(e.target.value))}
                className="w-full accent-[#066E53]"
              />
            </label>

            <label className="space-y-1.5 block">
              <div className="flex justify-between text-xs font-semibold text-[#10201B]">
                <span>Custos fixos mensais (MT)</span>
                <span className="font-mono text-[#10201B] tabular-nums">{formatMT(fixedCostsMT)}</span>
              </div>
              <input
                type="range"
                min={50000}
                max={350000}
                step={5000}
                value={fixedCostsMT}
                onChange={(e) => setFixedCostsMT(Number(e.target.value))}
                className="w-full accent-[#066E53]"
              />
            </label>
          </div>

          <div className="lg:col-span-5 bg-[#F6F7F5] rounded-2xl p-5 space-y-3">
            <div className="flex justify-between text-xs text-[#52635D]">
              <span>Volume transacionado (GMV)</span>
              <span className="font-mono font-semibold text-[#10201B] tabular-nums">{formatMT(gmvMT)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#52635D]">
              <span>Receita de comissões ({commissionRate}%)</span>
              <span className="font-mono font-semibold text-[#10201B] tabular-nums">{formatMT(commissionRevenueMT)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#52635D]">
              <span>Receita de subscrições</span>
              <span className="font-mono font-semibold text-[#10201B] tabular-nums">{formatMT(subscriptionRevenueMT)}</span>
            </div>
            <div className="pt-2 border-t border-[#E1E7E4] flex justify-between items-baseline">
              <span className="text-sm font-bold text-[#10201B]">Receita Total Estimada</span>
              <span className="font-mono text-xl font-bold text-[#066E53] tabular-nums">{formatMT(totalRevenueMT)}</span>
            </div>
            <div className="flex justify-between items-baseline text-sm">
              <span className="font-semibold text-[#52635D]">Resultado líquido</span>
              <span
                className={`font-mono font-bold tabular-nums ${
                  netResultMT >= 0 ? 'text-[#066E53]' : 'text-[#B53D26]'
                }`}
              >
                {netResultMT >= 0 ? '+' : ''}{formatMT(netResultMT)}
              </span>
            </div>
            <p className="text-xs text-[#52635D] pt-1">
              Ponto de equilíbrio: <strong className="font-mono text-[#10201B] tabular-nums">{breakEvenJobs}</strong> serviços/mês (considerando a receita atual de subscrições).
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Business Model Canvas (9 Blocks) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-[#10201B]">
              Business Model Canvas — Biscato
            </h2>
            <p className="text-sm text-[#52635D]">
              Cobertura geográfica nacional (25–60 anos): {MOZAMBIQUE_PROVINCES.filter((p) => p !== 'Todas as Províncias').join(' · ')}
            </p>
          </div>
          <Layers className="w-5 h-5 text-[#066E53] shrink-0" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUSINESS_CANVAS_BLOCKS.map((block) => (
            <div key={block.id} className="bg-white border border-[#E1E7E4] rounded-2xl p-5 space-y-2.5">
              <h3 className="font-display text-sm font-bold text-[#066E53]">{block.title}</h3>
              <ul className="space-y-1.5 text-xs text-[#52635D] leading-relaxed">
                {block.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F4811F] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Competitor Benchmark & Validation Hypotheses */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E1E7E4] rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#10201B]">
            Análise da Concorrência & Diferencial Competitivo
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E1E7E4] text-[#52635D]">
                  <th className="py-2.5 pr-3 font-semibold">Plataforma</th>
                  <th className="py-2.5 pr-3 font-semibold">Lacuna em Moçambique</th>
                  <th className="py-2.5 font-semibold">Vantagem Biscato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E7E4]">
                {COMPETITORS.map((comp) => (
                  <tr key={comp.name}>
                    <td className="py-3 pr-3 align-top">
                      <span className="font-bold text-[#10201B] block">{comp.name}</span>
                      <span className="text-[#52635D]">{comp.region}</span>
                    </td>
                    <td className="py-3 pr-3 text-[#52635D] align-top leading-relaxed">
                      {comp.gapsInMozambique}
                    </td>
                    <td className="py-3 text-[#066E53] font-medium align-top leading-relaxed">
                      {comp.biscatoAdvantage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E1E7E4] rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#10201B]">
            Hipóteses Críticas a Validar no MVP
          </h2>
          <div className="space-y-3">
            {VALIDATION_HYPOTHESES.map((hyp, i) => (
              <div key={i} className="pb-3 border-b border-[#E1E7E4] last:border-b-0 last:pb-0">
                <p className="text-xs font-bold text-[#10201B]">
                  0{i + 1}. {hyp.title}
                </p>
                <p className="text-xs text-[#52635D] mt-0.5 leading-relaxed">{hyp.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Team & Decisions Log */}
      <section className="bg-white border border-[#E1E7E4] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#10201B]">
              Registo de Decisões e Equipa Fundadora
            </h2>
            <p className="text-xs text-[#52635D]">
              Cronograma de execução MVP · Novembro 2026
            </p>
          </div>
          <Users className="w-5 h-5 text-[#066E53] shrink-0" aria-hidden="true" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E1E7E4] text-[#52635D]">
                <th className="py-2.5 pr-4 font-semibold">Responsável</th>
                <th className="py-2.5 pr-4 font-semibold">Área / Função</th>
                <th className="py-2.5 pr-4 font-semibold">Tarefa / Decisão</th>
                <th className="py-2.5 pr-4 font-semibold">Estado</th>
                <th className="py-2.5 font-semibold">Datas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7E4]">
              {TEAM_DECISIONS.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4 font-semibold text-[#10201B] whitespace-nowrap">{row.person}</td>
                  <td className="py-3 pr-4 text-[#52635D]">{row.team} · {row.role}</td>
                  <td className="py-3 pr-4 text-[#10201B]">{row.task}</td>
                  <td className="py-3 pr-4 font-medium text-[#066E53] whitespace-nowrap">{row.status}</td>
                  <td className="py-3 font-mono text-[#52635D] tabular-nums whitespace-nowrap">
                    {row.startDate} → {row.endDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
