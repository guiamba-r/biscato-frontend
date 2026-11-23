import { useState } from 'react';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Lock,
  MessageSquare,
  Send,
  ShieldAlert,
  ShieldCheck,
  Star,
  Unlock,
} from 'lucide-react';
import type { EscrowTransaction, PaymentMethodId, ProviderProfile } from '../types/biscato';
import { formatMT } from '../utils/formatters';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

interface EscrowViewProps {
  escrow: EscrowTransaction;
  provider: ProviderProfile;
  isClient: boolean;
  isProvider: boolean;
  paymentPhone: string;
  onChangePaymentMethod: (method: PaymentMethodId) => void;
  onFundEscrow: () => void;
  onSendMessage: (text: string) => void;
  onDeclareCompletion: () => void;
  onReleaseEscrow: (rating: number, reviewText: string) => void;
  onOpenDispute: (reason: string) => void;
}

const PAYMENT_OPTIONS: { id: PaymentMethodId; label: string; detail: string }[] = [
  { id: 'mpesa', label: 'M-Pesa', detail: 'Vodacom · Confirmação instantânea' },
  { id: 'emola', label: 'e-Mola', detail: 'Movitel · Carteira móvel' },
  { id: 'mkesh', label: 'Mkesh', detail: 'Tmcel · Pagamento digital' },
  { id: 'card', label: 'Cartão / Parcelas', detail: 'Visa / Mastercard · Até 3x' },
];

export function EscrowView({
  escrow,
  provider,
  isClient,
  isProvider,
  paymentPhone,
  onChangePaymentMethod,
  onFundEscrow,
  onSendMessage,
  onDeclareCompletion,
  onReleaseEscrow,
  onOpenDispute,
}: EscrowViewProps) {
  const [chatInput, setChatInput] = useState('');
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showPaymentCheckout, setShowPaymentCheckout] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState(
    'Trabalho concluído conforme o orçamento aprovado, com acabamento limpo e dentro do prazo.'
  );
  const [disputeReason, setDisputeReason] = useState(
    'O serviço não foi concluído conforme o acordado e necessita de mediação.'
  );

  const feeAmountMT = Math.round((escrow.amountMT * escrow.appliedFeePercent) / 100);
  const providerNetMT = escrow.amountMT - feeAmountMT;
  const maxWarrantyCoverageMT = Math.round((escrow.amountMT * escrow.warrantyCoveragePercent) / 100);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="editorial-rule flex flex-col md:flex-row md:items-end justify-between gap-5 pt-6">
        <div>
          <p className="section-kicker mb-3">Estado do serviço</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#162820]">
            Pagamento protegido e mediação
          </h1>
          <p className="text-sm sm:text-base text-[#52635D] mt-2 max-w-2xl">
            Acompanhe o valor desde o pagamento até à conclusão, sem perder o contexto da obra ou do prestador.
          </p>
        </div>

        <div className="text-xs text-[#52635D] font-mono tabular-nums">
          Referência: <strong className="text-[#10201B]">{escrow.id}</strong>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Custody Card + Timeline + Actions (Screen 04 from cls_f9822802.png) */}
        <div className="min-w-0 lg:col-span-5 space-y-5">
          {/* Deep Emerald Value Protected Card */}
          <div className="border-y border-[#1F6652] bg-[#1F6652] text-white p-6 sm:p-7 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
                {escrow.stage === 'released' ? (
                  <Unlock className="w-6 h-6 text-[#AEE6D4]" aria-hidden="true" />
                ) : (
                  <Lock className="w-6 h-6 text-white" aria-hidden="true" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#AEE6D4]">
                  {escrow.stage === 'awaiting_payment'
                    ? 'Aguardando Depósito em Custódia'
                    : escrow.stage === 'released'
                      ? 'Valor Libertado ao Prestador'
                    : escrow.stage === 'provider_completed'
                      ? 'Conclusão declarada · aguarda o cliente'
                    : escrow.stage === 'disputed'
                        ? 'Em Mediação e Análise'
                        : 'Valor Protegido em Custódia'}
                </p>
                <p className="font-mono text-4xl font-bold tabular-nums">
                  {formatMT(escrow.amountMT)}
                </p>
                <p className="text-sm text-white/85">
                  {escrow.serviceTitle} · {provider.name}
                </p>
              </div>
            </div>
          </div>

          {/* Payment method entry */}
          {isClient && escrow.stage === 'awaiting_payment' ? <div className="bg-white border border-[#E1E7E4] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-[#10201B]">
                  Pagamento em custódia
                </h2>
                <span className="text-xs text-[#066E53] font-medium">Valor protegido</span>
              </div>
              <p className="text-sm leading-relaxed text-[#52635D]">Escolha a carteira móvel e confirme o número numa tela própria antes de reter {formatMT(escrow.amountMT)}.</p>

              {escrow.stage === 'awaiting_payment' && (
                <button
                  type="button"
                  onClick={() => setShowPaymentCheckout(true)}
                  className="w-full h-11 rounded-xl bg-[#F4811F] hover:bg-[#DD6E0F] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Escolher carteira móvel
                </button>
              )}
          </div> : isClient ? (
              <p className="bg-[#E7F3EE] border border-[#C9E3D8] rounded-xl p-4 text-sm text-[#245B48]">
                Meio de pagamento seleccionado: {PAYMENT_OPTIONS.find((option) => option.id === escrow.paymentMethod)?.label ?? escrow.paymentMethod}.
              </p>
            ) : escrow.stage === 'awaiting_payment' ? (
              <p className="bg-[#FFF4EA] border border-[#F3D5BA] rounded-xl p-4 text-sm text-[#744018]">
                O pedido está à espera de pagamento do cliente. Só o titular pode escolher o meio de pagamento e confirmar.
              </p>
          ) : null}

          {/* 3-Step Custody Timeline */}
          <div className="bg-white border border-[#E1E7E4] rounded-2xl p-5 sm:p-6 space-y-5">
              <h2 className="font-display text-sm font-bold text-[#10201B]">
                Linha temporal da custódia
              </h2>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      escrow.stage !== 'awaiting_payment'
                        ? 'bg-[#066E53] text-white'
                        : 'bg-[#F6F7F5] text-[#52635D]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#10201B]">Dinheiro protegido</p>
                    <p className="text-xs text-[#52635D]">
                      {escrow.stage === 'awaiting_payment'
                        ? 'Aguardando confirmação do pagamento móvel'
                        : `Recebido em ${escrow.heldAt ?? 'Hoje'} via ${PAYMENT_OPTIONS.find((p) => p.id === escrow.paymentMethod)?.label}`}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      escrow.stage === 'in_execution'
                        ? 'bg-[#FFF1E5] text-[#C85A08]'
                        : escrow.stage === 'provider_completed'
                          ? 'bg-[#E7F3EE] text-[#066E53]'
                        : escrow.stage === 'released'
                          ? 'bg-[#066E53] text-white'
                          : escrow.stage === 'disputed'
                            ? 'bg-[#FDEAE6] text-[#B53D26]'
                            : 'bg-[#F6F7F5] text-[#52635D]'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#10201B]">
                      {escrow.stage === 'provider_completed' || escrow.stage === 'released'
                        ? 'Conclusão do serviço'
                        : 'Em execução'}
                    </p>
                    <p className="text-xs text-[#52635D]">
                      {escrow.stage === 'provider_completed'
                        ? 'Aguarda a confirmação do cliente ou a abertura de uma mediação.'
                        : `Previsão de conclusão: ${escrow.expectedCompletion ?? 'Em 3 dias'}`}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      escrow.stage === 'released'
                        ? 'bg-[#066E53] text-white'
                        : 'bg-[#F6F7F5] text-[#52635D]'
                    }`}
                  >
                    <Unlock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#10201B]">Valor liberado</p>
                    <p className="text-xs text-[#52635D]">
                      {escrow.stage === 'released'
                        ? `Libertado em ${escrow.releasedAt ?? 'Hoje'} · +${escrow.creditsEarnedOnRelease} créditos ao prestador`
                        : 'Após a sua confirmação de conclusão do trabalho'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Protective anti-bypass notice */}
              <div className="bg-[#E7F3EE] rounded-xl p-3.5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#066E53] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs text-[#054A38] space-y-0.5">
                  <p className="font-bold">Não pagar novamente por fora</p>
                  <p>
                    O profissional já sabe que o valor está garantido. Pagamentos feitos fora da plataforma perdem a cobertura de até {escrow.warrantyCoveragePercent}% ({formatMT(maxWarrantyCoverageMT)}) e o direito a reembolso.
                  </p>
                </div>
              </div>

              {/* Financial & Fee Transparency */}
              <div className="pt-2 border-t border-[#E1E7E4] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#52635D]">
                  <span>Valor em custódia</span>
                  <span className="font-mono text-[#10201B] tabular-nums">{formatMT(escrow.amountMT)}</span>
                </div>
                <div className="flex justify-between text-[#52635D]">
                  <span>Taxa aplicada ({escrow.appliedFeePercent}%)</span>
                  <span className="font-mono text-[#10201B] tabular-nums">{formatMT(feeAmountMT)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#10201B] pt-1">
                  <span>Líquido para o prestador</span>
                  <span className="font-mono text-[#066E53] tabular-nums">{formatMT(providerNetMT)}</span>
                </div>
                <p className="text-[11px] text-[#52635D] pt-0.5">{escrow.feeReason}</p>
              </div>

              {/* Primary Escrow Actions */}
              {isProvider && escrow.stage === 'in_execution' && (
                <button
                  type="button"
                  onClick={onDeclareCompletion}
                  className="w-full h-12 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Declarar serviço concluído
                </button>
              )}

              {isClient && escrow.stage === 'in_execution' && (
                <p className="text-sm text-[#52635D] bg-[#F6F7F5] rounded-xl p-3">
                  O prestador ainda está a executar o serviço. Poderá confirmar a conclusão ou pedir mediação depois da declaração.
                </p>
              )}

              {isClient && escrow.stage === 'provider_completed' && (
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReleaseModal(true)}
                    className="w-full h-12 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Confirmar Conclusão e Libertar Valor
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDisputeModal(true)}
                    className="w-full h-10 rounded-xl text-xs font-semibold text-[#B53D26] hover:bg-[#FDEAE6] transition-colors cursor-pointer"
                  >
                    Preciso de ajuda / Acionar garantia (até 50% cobertura)
                  </button>
                </div>
              )}

              {escrow.stage === 'released' && (
                <div className="bg-[#E7F3EE] rounded-xl p-4 space-y-1">
                  <p className="text-sm font-bold text-[#066E53]">
                    Serviço concluído e avaliado ({escrow.clientRating ?? 5} ★)
                  </p>
                  <p className="text-xs text-[#2B6655]">
                    "{escrow.clientReviewText}"
                  </p>
                </div>
              )}

              {escrow.stage === 'disputed' && (
                <div className="bg-[#FDEAE6] rounded-xl p-4 space-y-1 text-[#8D2916]">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Mediação Biscato aberta</span>
                  </div>
                  <p className="text-xs">
                    Motivo registado: {escrow.disputeReason}. O valor de {formatMT(escrow.amountMT)} permanece congelado até resolução ou reembolso/cobertura de até 50%.
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Right Column: Execution Chat & Protection Rules */}
        <div className="min-w-0 lg:col-span-7 space-y-5">
          {/* Interactive Chat */}
          <div className="min-w-0 bg-white border border-[#E1E7E4] rounded-2xl overflow-hidden flex flex-col">
            <div className="min-w-0 px-4 sm:px-5 py-4 border-b border-[#E1E7E4] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#066E53] text-white font-display font-bold text-xs flex items-center justify-center">
                  {provider.initials}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-sm font-bold text-[#10201B] break-words">
                    Acompanhamento com {provider.name}
                  </h2>
                  <p className="text-xs text-[#52635D]">
                    {provider.specialty} · Comunicação registada na plataforma
                  </p>
                </div>
              </div>
              <MessageSquare className="w-4 h-4 text-[#066E53]" aria-hidden="true" />
            </div>

            <div className="min-h-64 p-4 sm:p-5 space-y-3 max-h-[420px] overflow-y-auto bg-[#F6F7F5]">
              {escrow.messages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="bg-white border border-[#E1E7E4] rounded-xl p-3 text-xs text-[#52635D] text-center">
                      <span className="font-semibold text-[#066E53]">{msg.senderName}: </span>
                      <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                    </div>
                  );
                }

                const isClient = msg.sender === 'client';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${isClient ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <span className="text-[11px] text-[#52635D] mb-1 px-1">
                      {msg.senderName} · {msg.timestamp}
                    </span>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isClient
                          ? 'bg-[#066E53] text-white rounded-br-xs'
                          : 'bg-white border border-[#E1E7E4] text-[#10201B] rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-[#E1E7E4] flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escreva uma mensagem ou instrução sobre o serviço..."
                aria-label="Mensagem para o prestador"
                className="min-w-0 flex-1 h-11 px-3 sm:px-4 rounded-xl bg-[#F6F7F5] text-sm text-[#10201B] placeholder:text-[#6B7C76] outline-none focus:bg-white focus:ring-2 focus:ring-[#066E53]/25"
              />
              <button
                type="submit"
                className="h-11 px-4 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Enviar</span>
              </button>
            </form>
          </div>

          {/* Protection Policy & Credits Summary */}
          <div className="bg-white border border-[#E1E7E4] rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-[#10201B]">
              Política de Proteção, Reembolso e Créditos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-[#066E53]">Reembolso em Escrow</p>
                <p className="text-[#52635D] leading-relaxed">
                  Devolução integral ao cliente caso o serviço não seja iniciado ou haja incumprimento comprovado do prestador.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-[#C85A08]">Cobertura até 50%</p>
                <p className="text-[#52635D] leading-relaxed">
                  Apólice de proteção para danos elegíveis causados durante a execução, válida exclusivamente em transações dentro da Biscato.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-[#10201B]">Créditos do Prestador</p>
                <p className="text-[#52635D] leading-relaxed">
                  Ao concluir este serviço, {provider.name} acumula +{escrow.creditsEarnedOnRelease} créditos convertíveis em materiais e ferramentas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isClient && showPaymentCheckout && (
        <PaymentCheckoutModal
          amountMT={escrow.amountMT}
          serviceTitle={escrow.serviceTitle}
          providerName={provider.name}
          method={escrow.paymentMethod}
          initialPhone={paymentPhone}
          onClose={() => setShowPaymentCheckout(false)}
          onChangeMethod={onChangePaymentMethod}
          onConfirm={onFundEscrow}
        />
      )}

      {/* Confirm Release & Review Modal */}
      {isClient && showReleaseModal && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-[#E1E7E4] w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-[#10201B]">
                Confirmar conclusão e libertar {formatMT(escrow.amountMT)}
              </h2>
              <p className="text-sm text-[#52635D]">
                Avalie o trabalho de {provider.name}. A libertação do valor também atribui +{escrow.creditsEarnedOnRelease} créditos de equipamento ao prestador.
              </p>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#10201B]">Classificação</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`${star} estrelas`}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-[#F4811F] text-[#F4811F]' : 'text-[#D4DDD9]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#10201B]">
                Comentário público
              </label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#D4DDD9] text-sm text-[#10201B] outline-none focus:border-[#066E53]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowReleaseModal(false)}
                className="h-11 px-4 rounded-xl border border-[#D4DDD9] text-sm font-semibold text-[#10201B] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onReleaseEscrow(rating, reviewComment);
                  setShowReleaseModal(false);
                }}
                className="h-11 px-5 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold cursor-pointer"
              >
                Libertar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute / Warranty Coverage Modal */}
      {isClient && showDisputeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-[#E1E7E4] w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[#B53D26] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display text-lg font-bold text-[#10201B]">
                  Mediação e Proteção Biscato
                </h2>
                <p className="text-sm text-[#52635D] mt-1">
                  Enquanto o valor estiver retido, pode congelar a libertação para análise de reembolso ou cobertura de até 50% dos prejuízos ({formatMT(maxWarrantyCoverageMT)}).
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#10201B]">
                Descreva o ocorrido
              </label>
              <textarea
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#D4DDD9] text-sm text-[#10201B] outline-none focus:border-[#B53D26]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                className="h-11 px-4 rounded-xl border border-[#D4DDD9] text-sm font-semibold text-[#10201B] cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenDispute(disputeReason);
                  setShowDisputeModal(false);
                }}
                className="h-11 px-5 rounded-xl bg-[#B53D26] hover:bg-[#96311D] text-white text-sm font-semibold cursor-pointer"
              >
                Congelar e Abrir Mediação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
