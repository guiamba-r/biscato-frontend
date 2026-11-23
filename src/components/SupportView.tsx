import { useEffect, useState } from 'react';
import { Bot, Headset, Send, ShieldCheck } from 'lucide-react';
import type { ApiAuthUser } from '../api/types';

type SupportSender = 'client' | 'team' | 'bot' | 'system';

interface SupportMessage {
  id: string;
  sender: SupportSender;
  senderName: string;
  text: string;
  timestamp: string;
}

interface SupportViewProps {
  user: ApiAuthUser | null;
}

const SUPPORT_STORAGE_PREFIX = 'biscato:support-history:v1:';
const FAQ_ANSWERS: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ['pedido', 'orçamento', 'orcamento', 'proposta'],
    answer: 'Para pedir um orçamento, entre na sua conta de cliente, descreva o serviço e compare as propostas recebidas. O pedido fica associado à sua conta.',
  },
  {
    keywords: ['pagamento', 'custódia', 'custodia', 'reembolso', 'garantia'],
    answer: 'Na custódia, o valor fica protegido até à conclusão do serviço. Se houver um problema, abra a área Custódia e escolha a opção de mediação antes de libertar o pagamento.',
  },
  {
    keywords: ['prestador', 'profissional', 'técnico', 'tecnico', 'serviço', 'servico'],
    answer: 'Pode consultar o perfil, a experiência e as avaliações dos prestadores. Ao pedir orçamento, escolha um profissional elegível na sua zona e converse pela plataforma.',
  },
  {
    keywords: ['conta', 'senha', 'palavra-passe', 'perfil', 'login', 'entrar'],
    answer: 'Aceda a “Editar perfil” para actualizar os dados disponíveis. Se não conseguir entrar, contacte a equipa Biscato pelo chat de atendimento.',
  },
];

const QUICK_QUESTIONS = [
  'Como peço um orçamento?',
  'Como funciona o pagamento protegido?',
  'Como contacto um prestador?',
];

function readSupportHistory(storageKey: string): SupportMessage[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((message): message is SupportMessage =>
      typeof message?.id === 'string' &&
      ['client', 'team', 'bot', 'system'].includes(message?.sender) &&
      typeof message?.senderName === 'string' &&
      typeof message?.text === 'string' &&
      typeof message?.timestamp === 'string',
    );
  } catch {
    return [];
  }
}

function automaticAnswer(question: string): string {
  const normalized = question.toLocaleLowerCase('pt-MZ');
  const match = FAQ_ANSWERS.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)));
  return match?.answer ?? 'Não encontrei uma resposta segura para essa dúvida. Pode mudar para “Falar com a equipa” e deixar a sua mensagem para atendimento.';
}

function timeLabel(): string {
  return new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
}

export function SupportView({ user }: SupportViewProps) {
  const accountKey = user?.id ?? 'guest';
  const storageKey = `${SUPPORT_STORAGE_PREFIX}${accountKey}`;
  const [mode, setMode] = useState<'assistant' | 'team'>('assistant');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>(() => readSupportHistory(storageKey));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Keep the current conversation in memory if browser storage is unavailable.
    }
  }, [storageKey, messages]);

  const appendMessages = (nextMessages: SupportMessage[]) => {
    setMessages((previous) => [...previous, ...nextMessages]);
  };

  const sendMessage = (text: string) => {
    const question = text.trim();
    if (!question) return;
    const time = timeLabel();
    const clientMessage: SupportMessage = {
      id: `support-${Date.now()}-client`,
      sender: 'client',
      senderName: user?.fullName ?? 'Visitante',
      text: question,
      timestamp: time,
    };
    const reply: SupportMessage = mode === 'assistant'
      ? {
          id: `support-${Date.now()}-bot`,
          sender: 'bot',
          senderName: 'Assistente Biscato',
          text: automaticAnswer(question),
          timestamp: time,
        }
      : {
          id: `support-${Date.now()}-system`,
          sender: 'system',
          senderName: 'Biscato',
          text: user
            ? 'A mensagem foi guardada neste histórico. A ligação a um atendente humano será activada quando a plataforma tiver o serviço de mensagens de suporte.'
            : 'Para falar com a equipa, entre na sua conta. Esta conversa automática continua disponível sem sessão.',
          timestamp: time,
        };
    appendMessages([clientMessage, reply]);
    setDraft('');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header className="editorial-rule pt-6">
        <p className="section-kicker mb-3">Centro de ajuda Biscato</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#162820]">Como podemos ajudar?</h1>
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-[#52635D]">Consulte o assistente automático ou deixe uma mensagem para a equipa. O histórico fica guardado neste navegador.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5 items-start">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-[#D5D9D3] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#E1E7E4] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${mode === 'assistant' ? 'bg-[#066E53]' : 'bg-[#354A42]'}`}>
                {mode === 'assistant' ? <Bot className="h-5 w-5" aria-hidden="true" /> : <Headset className="h-5 w-5" aria-hidden="true" />}
              </div>
              <div>
                <h2 className="font-semibold text-[#10201B]">{mode === 'assistant' ? 'Assistente automático' : 'Atendimento da equipa'}</h2>
                <p className="text-xs text-[#52635D]">{mode === 'assistant' ? 'Respostas imediatas às dúvidas frequentes' : 'Histórico de contacto com a Biscato'}</p>
              </div>
            </div>
            <div className="flex gap-2" role="group" aria-label="Escolher tipo de atendimento">
              <button type="button" onClick={() => setMode('assistant')} aria-pressed={mode === 'assistant'} className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${mode === 'assistant' ? 'bg-[#E7F3EE] text-[#066E53]' : 'bg-[#F6F7F5] text-[#52635D]'}`}>Assistente</button>
              <button type="button" onClick={() => setMode('team')} aria-pressed={mode === 'team'} className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${mode === 'team' ? 'bg-[#E7F3EE] text-[#066E53]' : 'bg-[#F6F7F5] text-[#52635D]'}`}>Falar com a equipa</button>
            </div>
          </div>

          {mode === 'team' && (
            <p className="border-b border-[#E1E7E4] bg-[#FFF8EA] px-4 py-3 text-xs leading-relaxed text-[#6B4811] sm:px-5">
              Protótipo frontend: as mensagens ficam guardadas neste navegador, mas ainda não são entregues à equipa sem uma API de suporte.
            </p>
          )}

          <div className="flex min-h-[320px] max-h-[480px] flex-col gap-3 overflow-y-auto bg-[#FBFAF7] p-4 sm:p-5" aria-live="polite">
            {messages.length === 0 ? (
              <div className="m-auto max-w-md py-8 text-center">
                <p className="font-display text-lg font-bold text-[#10201B]">{mode === 'assistant' ? 'Pergunte ao assistente' : 'Escreva para a equipa'}</p>
                <p className="mt-1 text-sm text-[#52635D]">{mode === 'assistant' ? 'Pode escolher uma dúvida comum ou escrever a sua pergunta.' : 'Descreva o assunto. A conversa ficará no histórico desta conta neste navegador.'}</p>
              </div>
            ) : messages.map((message) => {
              const isClient = message.sender === 'client';
              const isSystem = message.sender === 'system';
              return (
                <div key={message.id} className={`flex ${isClient ? 'justify-end' : isSystem ? 'justify-center' : 'justify-start'}`}>
                  <article className={`max-w-[88%] rounded-2xl px-4 py-3 ${isSystem ? 'bg-[#E8EBE8] text-[#52635D]' : isClient ? 'bg-[#066E53] text-white' : 'border border-[#E1E7E4] bg-white text-[#10201B]'}`}>
                    <p className="mb-1 text-[11px] font-semibold opacity-75">{message.senderName} · {message.timestamp}</p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</p>
                  </article>
                </div>
              );
            })}
          </div>

          {mode === 'assistant' && messages.length === 0 && (
            <div className="flex flex-wrap gap-2 border-t border-[#E1E7E4] px-4 py-3 sm:px-5">
              {QUICK_QUESTIONS.map((question) => <button key={question} type="button" onClick={() => sendMessage(question)} className="min-h-9 rounded-full border border-[#D4DDD9] px-3 text-xs text-[#354A42] hover:border-[#066E53] hover:text-[#066E53]">{question}</button>)}
            </div>
          )}

          <form onSubmit={(event) => { event.preventDefault(); sendMessage(draft); }} className="flex items-end gap-2 border-t border-[#E1E7E4] p-3 sm:p-4">
            <label htmlFor="support-message" className="sr-only">Escreva a sua mensagem</label>
            <textarea id="support-message" rows={2} maxLength={1000} required value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={mode === 'assistant' ? 'Escreva a sua dúvida…' : 'Escreva uma mensagem para a equipa…'} className="min-h-11 min-w-0 flex-1 resize-y rounded-xl border border-[#D4DDD9] px-3 py-2 text-sm outline-none focus:border-[#066E53]" />
            <button type="submit" disabled={!draft.trim()} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-[#066E53] px-3 sm:px-4 text-sm font-semibold text-white hover:bg-[#055741] disabled:opacity-50"><Send className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Enviar</span></button>
          </form>
        </div>

        <aside className="rounded-2xl border border-[#D5D9D3] bg-white p-5">
          <div className="flex items-center gap-2 text-[#066E53]"><ShieldCheck className="h-5 w-5" aria-hidden="true" /><h2 className="font-display text-base font-bold text-[#10201B]">Dúvidas frequentes</h2></div>
          <ul className="mt-4 space-y-3 text-sm text-[#52635D]">
            <li><strong className="block text-[#10201B]">Pedidos e propostas</strong>Publique o que precisa e compare as propostas recebidas.</li>
            <li><strong className="block text-[#10201B]">Pagamento protegido</strong>Use a custódia e confirme o trabalho antes da libertação.</li>
            <li><strong className="block text-[#10201B]">Histórico</strong>As conversas deste protótipo são guardadas por conta neste navegador.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
