import { useState } from 'react';
import { ArrowLeft, CheckCircle2, LockKeyhole, Smartphone, X } from 'lucide-react';
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
  onConfirm: (details: { method: PaymentMethodId; phone: string }) => void;
}

const PAYMENT_LABELS: Record<PaymentMethodId, string> = {
  mpesa: 'M-Pesa',
  emola: 'e-Mola',
};

const PAYMENT_OPTIONS: Array<{ id: PaymentMethodId; provider: string; description: string }> = [
  { id: 'mpesa', provider: 'Vodacom', description: 'Carteira móvel M-Pesa' },
  { id: 'emola', provider: 'Movitel', description: 'Carteira móvel e-Mola' },
];

function WalletMark({ method, className = 'h-12 w-12' }: { method: PaymentMethodId; className?: string }) {
  return (
    <img
      className={`${className} rounded-xl object-cover shadow-sm`}
      src={method === 'mpesa' ? '/assets/M-pesa.jpeg' : '/assets/E-Mola.png'}
      alt={`Logótipo ${PAYMENT_LABELS[method]}`}
    />
  );
}

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
  const [step, setStep] = useState<'method' | 'details' | 'authorization'>('method');
  const activeStep = step === 'method' ? 1 : step === 'details' ? 2 : 3;
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidMozambicanPhone(phone)) {
      setError('Introduza um número moçambicano válido com 9 dígitos.');
      return;
    }
    setError('');
    setStep('authorization');
  };

  const handleSimulateApproval = () => {
    onConfirm({ method, phone });
    setIsConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="payment-checkout-title">
      <div className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-[#E1E7E4] bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#E1E7E4] p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#066E53]">Pagamento em custódia</p>
            <h2 id="payment-checkout-title" className="mt-1 font-display text-xl font-bold text-[#10201B]">
              {isConfirmed ? 'Simulação concluída' : step === 'method' ? 'Escolha a carteira para pagar' : step === 'details' ? 'Confirme os dados do pagamento' : 'Confirme no telemóvel'}
            </h2>
          </div>
          {!isConfirmed && <button type="button" onClick={onClose} aria-label="Fechar checkout" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#52635D] hover:bg-[#F6F7F5]"><X className="h-5 w-5" aria-hidden="true" /></button>}
        </header>

        {!isConfirmed && (
          <ol className="grid grid-cols-3 gap-2 border-b border-[#E1E7E4] px-5 py-3 sm:px-6" aria-label="Etapas do pagamento">
            {['Carteira', 'Número', 'Autorização'].map((label, index) => {
              const itemStep = index + 1;
              const isActive = itemStep === activeStep;
              const isComplete = itemStep < activeStep;
              return (
                <li key={label} className={`flex items-center gap-2 text-xs font-semibold ${isActive || isComplete ? 'text-[#066E53]' : 'text-[#87938D]'}`}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${isComplete ? 'bg-[#066E53] text-white' : isActive ? 'bg-[#E7F3EE] text-[#066E53] ring-1 ring-[#9BCBB8]' : 'bg-[#F1F3F2] text-[#718079]'}`}>
                    {isComplete ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : itemStep}
                  </span>
                  {label}
                </li>
              );
            })}
          </ol>
        )}

        {isConfirmed ? (
          <div className="space-y-5 p-6 sm:p-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-[#066E53]" aria-hidden="true" />
            <div>
              <p className="font-display text-lg font-bold text-[#10201B]">Etapas de pagamento concluídas</p>
              <p className="mt-2 text-sm leading-relaxed text-[#52635D]">O estado foi actualizado nesta interface. Não houve débito nem confirmação da operadora.</p>
            </div>
            <button type="button" onClick={onClose} className="min-h-11 w-full rounded-xl bg-[#066E53] px-4 text-sm font-semibold text-white hover:bg-[#055741]">Voltar ao serviço</button>
          </div>
        ) : step === 'method' ? (
          <div className="space-y-6 p-5 sm:p-6">
            <div className="rounded-2xl border border-[#DDE8E2] bg-gradient-to-br from-[#F2F8F5] to-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#52635D]">Total do serviço</p>
                  <p className="mt-1 font-mono text-3xl font-bold tabular-nums tracking-tight text-[#066E53]">{formatMT(amountMT)}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#066E53] ring-1 ring-[#DDE8E2]"><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Em custódia</span>
              </div>
              <div className="mt-4 border-t border-[#DDE8E2] pt-3">
                <p className="truncate text-sm font-semibold text-[#10201B]">{serviceTitle}</p>
                <p className="mt-0.5 text-xs text-[#52635D]">Prestador: {providerName}</p>
              </div>
            </div>

            <section>
              <h3 className="text-sm font-bold text-[#10201B]">Escolha a sua carteira</h3>
              <p className="mt-1 text-xs text-[#52635D]">Selecione uma forma de pagamento móvel.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {PAYMENT_OPTIONS.map((option) => {
                  const isSelected = method === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onChangeMethod(option.id)}
                      className={`group relative flex min-h-32 flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all ${isSelected ? 'border-[#066E53] bg-[#F0F8F4] shadow-[0_0_0_2px_rgba(6,110,83,0.08)]' : 'border-[#E1E7E4] bg-white hover:-translate-y-0.5 hover:border-[#9AB9AC] hover:shadow-md'}`}
                    >
                      <div className="flex w-full items-start justify-between">
                        <WalletMark method={option.id} />
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-[#066E53] bg-[#066E53] text-white' : 'border-[#C7D2CC] bg-white text-transparent'}`}><CheckCircle2 className="h-4 w-4" aria-hidden="true" /></span>
                      </div>
                      <span className="block"><span className="block text-base font-bold text-[#10201B]">{PAYMENT_LABELS[option.id]}</span><span className="mt-0.5 block text-xs font-medium text-[#52635D]">{option.provider}</span><span className="mt-1 block text-[11px] text-[#718079]">{option.description}</span></span>
                    </button>
                  );
                })}
              </div>
            </section>

            <button type="button" onClick={() => setStep('details')} className="min-h-12 w-full rounded-xl bg-[#066E53] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#055741]">Continuar com {PAYMENT_LABELS[method]}</button>
          </div>
        ) : step === 'details' ? (
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
                <WalletMark method={method} className="h-10 w-10" />
                <div>
                  <p className="text-sm font-semibold text-[#10201B]">{PAYMENT_LABELS[method]}</p>
                  <p className="text-xs text-[#52635D]">{method === 'mpesa' ? 'Vodacom' : 'Movitel'}</p>
                </div>
              </div>

              <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-[#10201B]">Número da carteira móvel</span>
                  <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+258 84 123 4567" required aria-invalid={!!error} className="h-11 w-full rounded-xl border border-[#D4DDD9] px-3 text-sm outline-none focus:border-[#066E53]" />
                  {error && <span role="alert" className="mt-1 block text-xs text-[#B42318]">{error}</span>}
              </label>
            </section>

            <p className="flex items-start gap-2 rounded-xl border border-[#DCE5F3] bg-[#F4F7FC] p-3 text-xs leading-relaxed text-[#42536B]">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              O PIN é inserido apenas no telemóvel. Esta interface ainda não envia pedidos à operadora.
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep('method')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D4DDD9] px-4 text-sm font-semibold text-[#354A42] hover:bg-[#F6F7F5]"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Alterar carteira</button>
              <button type="submit" className="min-h-11 rounded-xl bg-[#066E53] px-5 text-sm font-bold text-white hover:bg-[#055741]">Continuar para confirmação</button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 p-5 sm:p-6">
            <div className="rounded-2xl border border-[#E1E7E4] bg-[#F8FAF9] p-5 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F3EE] text-[#066E53]">
                <Smartphone className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-[#10201B]">Verifique o seu telemóvel</p>
              <p className="mt-1 text-sm leading-relaxed text-[#52635D]">
                Aprove o pedido de {formatMT(amountMT)} na carteira {PAYMENT_LABELS[method]} associada ao número terminado em {phone.replace(/\D/g, '').slice(-4)}.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[#52635D]">Confirme com o PIN no telemóvel, através da notificação push ou das instruções USSD da carteira.</p>
            </div>

            <p className="flex items-start gap-2 rounded-xl border border-[#F0D6A8] bg-[#FFF8EA] p-3 text-xs leading-relaxed text-[#6B4811]">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              A operadora ainda não está ligada a esta interface. Nenhum pedido foi enviado; não introduza o PIN aqui.
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep('details')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D4DDD9] px-4 text-sm font-semibold text-[#354A42] hover:bg-[#F6F7F5]"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar aos dados</button>
              <button type="button" onClick={handleSimulateApproval} className="min-h-11 rounded-xl bg-[#F4811F] px-5 text-sm font-bold text-white hover:bg-[#DD6E0F]">Já confirmei no telemóvel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
