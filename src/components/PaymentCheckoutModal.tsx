import { useState } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, LockKeyhole, Smartphone, X } from 'lucide-react';
import type { PaymentMethodId } from '../types/biscato';
import { formatMT } from '../utils/formatters';

interface PaymentCheckoutModalProps {
  amountMT: number;
  serviceTitle: string;
  providerName: string;
  method: PaymentMethodId;
  initialPhone: string;
  onClose: () => void;
  onChangeMethod: (method: PaymentMethodId) => void;
  onConfirm: () => void;
}

const PAYMENT_LABELS: Record<PaymentMethodId, string> = {
  mpesa: 'M-Pesa',
  emola: 'e-Mola',
  mkesh: 'Mkesh',
  card: 'Cartão Visa / Mastercard',
};

const PAYMENT_OPTIONS: Array<{ id: PaymentMethodId; provider: string; description: string }> = [
  { id: 'mpesa', provider: 'Vodacom', description: 'Pague com a sua carteira M-Pesa.' },
  { id: 'emola', provider: 'Movitel', description: 'Pague com a sua carteira e-Mola.' },
  { id: 'mkesh', provider: 'Tmcel', description: 'Pague com a sua carteira Mkesh.' },
  { id: 'card', provider: 'Visa / Mastercard', description: 'Disponível quando o gateway estiver ligado.' },
];

function isValidMozambicanPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length === 9 || (digits.length === 12 && digits.startsWith('258'));
}

export function PaymentCheckoutModal({
  amountMT,
  serviceTitle,
  providerName,
  method,
  initialPhone,
  onClose,
  onChangeMethod,
  onConfirm,
}: PaymentCheckoutModalProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [step, setStep] = useState<'method' | 'details'>('method');
  const requiresPhone = method !== 'card';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requiresPhone && !isValidMozambicanPhone(phone)) {
      setError('Introduza um número moçambicano válido com 9 dígitos.');
      return;
    }
    setError('');
    onConfirm();
    setIsConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="payment-checkout-title">
      <div className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-[#E1E7E4] bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#E1E7E4] p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#066E53]">Pagamento em custódia</p>
            <h2 id="payment-checkout-title" className="mt-1 font-display text-xl font-bold text-[#10201B]">
              {isConfirmed ? 'Simulação concluída' : step === 'method' ? 'Escolha a carteira para pagar' : 'Confirme os dados do pagamento'}
            </h2>
          </div>
          {!isConfirmed && <button type="button" onClick={onClose} aria-label="Fechar checkout" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#52635D] hover:bg-[#F6F7F5]"><X className="h-5 w-5" aria-hidden="true" /></button>}
        </header>

        {isConfirmed ? (
          <div className="space-y-5 p-6 sm:p-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-[#066E53]" aria-hidden="true" />
            <div>
              <p className="font-display text-lg font-bold text-[#10201B]">Fluxo de demonstração concluído</p>
              <p className="mt-2 text-sm leading-relaxed text-[#52635D]">A custódia foi actualizada neste frontend. Nenhum valor foi debitado e nenhum dado foi enviado à operadora ou a um gateway.</p>
            </div>
            <button type="button" onClick={onClose} className="min-h-11 w-full rounded-xl bg-[#066E53] px-4 text-sm font-semibold text-white hover:bg-[#055741]">Voltar ao serviço</button>
          </div>
        ) : step === 'method' ? (
          <div className="space-y-5 p-5 sm:p-6">
            <div className="rounded-2xl bg-[#F6F7F5] p-4">
              <p className="text-xs font-medium text-[#52635D]">Total a reter em custódia</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#066E53]">{formatMT(amountMT)}</p>
              <p className="mt-1 text-sm text-[#52635D]">{serviceTitle} · {providerName}</p>
            </div>

            <section>
              <h3 className="text-sm font-bold text-[#10201B]">Carteiras móveis</h3>
              <p className="mt-1 text-xs text-[#52635D]">Seleccione a carteira que será usada para o pagamento.</p>
              <div className="mt-3 grid gap-2.5">
                {PAYMENT_OPTIONS.map((option) => {
                  const isSelected = method === option.id;
                  const isMobileWallet = option.id !== 'card';
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onChangeMethod(option.id)}
                      className={`flex min-h-16 items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${isSelected ? 'border-[#066E53] bg-[#E7F3EE]' : 'border-[#E1E7E4] hover:border-[#066E53]/50'}`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isSelected ? 'bg-[#066E53] text-white' : 'bg-[#F6F7F5] text-[#52635D]'}`}>
                        {isMobileWallet ? <Smartphone className="h-4 w-4" aria-hidden="true" /> : <CreditCard className="h-4 w-4" aria-hidden="true" />}
                      </span>
                      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#10201B]">{PAYMENT_LABELS[option.id]}</span><span className="block text-xs text-[#52635D]">{option.provider} · {option.description}</span></span>
                      {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-[#066E53]" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </section>

            <button type="button" onClick={() => setStep('details')} className="min-h-11 w-full rounded-xl bg-[#066E53] px-4 text-sm font-semibold text-white hover:bg-[#055741]">Continuar com {PAYMENT_LABELS[method]}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            <div className="rounded-2xl bg-[#F6F7F5] p-4">
              <p className="text-xs font-medium text-[#52635D]">Serviço</p>
              <p className="mt-0.5 font-semibold text-[#10201B]">{serviceTitle}</p>
              <p className="text-sm text-[#52635D]">Prestador: {providerName}</p>
              <div className="mt-3 flex items-center justify-between border-t border-[#DDE4E0] pt-3">
                <span className="text-sm font-semibold text-[#10201B]">Total a reter em custódia</span>
                <span className="font-mono text-lg font-bold tabular-nums text-[#066E53]">{formatMT(amountMT)}</span>
              </div>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-[#10201B]">Método escolhido</h3>
              <div className="flex items-center gap-3 rounded-xl border border-[#B7DCCE] bg-[#E7F3EE] p-3.5">
                {requiresPhone ? <Smartphone className="h-5 w-5 text-[#066E53]" aria-hidden="true" /> : <CreditCard className="h-5 w-5 text-[#066E53]" aria-hidden="true" />}
                <div>
                  <p className="text-sm font-semibold text-[#10201B]">{PAYMENT_LABELS[method]}</p>
                  <p className="text-xs text-[#52635D]">{method === 'mpesa' ? 'Vodacom' : method === 'emola' ? 'Movitel' : method === 'mkesh' ? 'Tmcel' : 'Gateway de cartão não ligado'}</p>
                </div>
              </div>

              {requiresPhone ? (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-[#10201B]">Número da carteira móvel</span>
                  <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+258 84 123 4567" required aria-invalid={!!error} className="h-11 w-full rounded-xl border border-[#D4DDD9] px-3 text-sm outline-none focus:border-[#066E53]" />
                  {error && <span role="alert" className="mt-1 block text-xs text-[#B42318]">{error}</span>}
                </label>
              ) : (
                <div className="rounded-xl border border-[#E1E7E4] p-4 text-sm text-[#52635D]">
                  <p className="font-semibold text-[#10201B]">Cartão seleccionado</p>
                  <p className="mt-1 text-xs leading-relaxed">A ligação ao checkout Visa/Mastercard ainda não está configurada. Esta demonstração não pede nem guarda número de cartão ou CVV.</p>
                </div>
              )}
            </section>

            <p className="flex items-start gap-2 rounded-xl border border-[#F0D6A8] bg-[#FFF8EA] p-3 text-xs leading-relaxed text-[#6B4811]">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Demonstração frontend: o botão seguinte altera apenas o estado local da custódia. Não inicia uma cobrança real.
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep('method')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D4DDD9] px-4 text-sm font-semibold text-[#354A42] hover:bg-[#F6F7F5]"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Alterar carteira</button>
              <button type="submit" className="min-h-11 rounded-xl bg-[#F4811F] px-5 text-sm font-bold text-white hover:bg-[#DD6E0F]">Simular pagamento de {formatMT(amountMT)}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
