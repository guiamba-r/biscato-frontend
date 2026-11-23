import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import type { ChatConversation, UserRole } from '../types/biscato';

interface MessagesViewProps {
  conversations: ChatConversation[];
  selectedConversationId: string;
  userRole: UserRole;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
}

export function MessagesView({
  conversations,
  selectedConversationId,
  userRole,
  onSelectConversation,
  onSendMessage,
}: MessagesViewProps) {
  const [draft, setDraft] = useState('');
  const activeConversation = conversations.find((item) => item.id === selectedConversationId) ?? conversations[0] ?? null;
  const activeParticipantName = activeConversation
    ? userRole === 'client' ? activeConversation.providerName : activeConversation.clientName
    : '';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeConversation || !draft.trim()) return;
    onSendMessage(activeConversation.id, draft.trim());
    setDraft('');
  };

  return (
    <div className="space-y-7">
      <header className="editorial-rule pt-6">
        <p className="section-kicker mb-3">Comunicação Biscato</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#162820]">Mensagens</h1>
        <p className="mt-2 text-sm sm:text-base text-[#52635D]">Converse sobre pedidos e propostas sem sair da plataforma.</p>
      </header>

      {conversations.length === 0 ? (
        <div className="bg-white border border-[#D5D9D3] rounded-2xl p-10 text-center">
          <MessageCircle className="w-8 h-8 mx-auto text-[#066E53]" aria-hidden="true" />
          <p className="mt-3 font-display text-lg font-bold text-[#10201B]">Ainda não tem conversas</p>
          <p className="mt-1 text-sm text-[#52635D]">
            {userRole === 'client'
              ? 'Abra uma proposta e escolha “Conversar com prestador” para iniciar uma conversa.'
              : 'As conversas iniciadas pelos clientes aparecerão aqui.'}
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] min-h-[480px] bg-white border border-[#D5D9D3] rounded-2xl overflow-hidden">
          <aside className="border-b lg:border-b-0 lg:border-r border-[#E1E7E4]">
            <h2 className="px-4 py-3 text-sm font-bold text-[#10201B]">Conversas ({conversations.length})</h2>
            <div className="max-h-56 lg:max-h-[560px] overflow-y-auto">
              {conversations.map((conversation) => {
                const participantName = userRole === 'client' ? conversation.providerName : conversation.clientName;
                const isSelected = activeConversation?.id === conversation.id;
                const latestMessage = conversation.messages[conversation.messages.length - 1];
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => onSelectConversation(conversation.id)}
                    aria-pressed={isSelected}
                    className={`w-full border-t border-[#E1E7E4] px-4 py-3 text-left transition-colors ${isSelected ? 'bg-[#EAF5F1]' : 'hover:bg-[#F6F7F5]'}`}
                  >
                    <span className="block text-sm font-semibold text-[#10201B] truncate">{participantName}</span>
                    <span className="block mt-0.5 text-xs text-[#066E53] truncate">{conversation.requestTitle}</span>
                    <span className="block mt-1 text-xs text-[#718079] truncate">{latestMessage?.text ?? 'Conversa iniciada'}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {activeConversation ? (
            <div className="min-w-0 flex flex-col">
              <header className="border-b border-[#E1E7E4] px-4 sm:px-5 py-3">
                <h2 className="font-semibold text-[#10201B]">{activeParticipantName}</h2>
                <p className="text-xs text-[#52635D]">Sobre: {activeConversation.requestTitle}</p>
              </header>

              <div className="flex-1 min-h-[260px] max-h-[440px] overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#FBFAF7]" aria-live="polite">
                {activeConversation.messages.map((message) => {
                  const isOwnMessage = message.sender === userRole;
                  const isSystemMessage = message.sender === 'system';
                  return (
                    <div key={message.id} className={`flex ${isSystemMessage ? 'justify-center' : isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${isSystemMessage ? 'bg-[#E8EBE8] text-[#52635D]' : isOwnMessage ? 'bg-[#066E53] text-white' : 'bg-white border border-[#E1E7E4] text-[#10201B]'}`}>
                        {!isSystemMessage && <p className="text-[11px] font-semibold opacity-75">{message.senderName}</p>}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                        <p className={`mt-1 text-[10px] text-right ${isOwnMessage && !isSystemMessage ? 'text-white/70' : 'opacity-60'}`}>{message.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-[#E1E7E4] p-3">
                <label className="sr-only" htmlFor="conversation-message">Escrever mensagem</label>
                <textarea
                  id="conversation-message"
                  rows={2}
                  maxLength={1000}
                  required
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Escreva uma mensagem sobre o serviço…"
                  className="min-h-11 max-h-28 flex-1 resize-y rounded-xl border border-[#D4DDD9] px-3 py-2 text-sm outline-none focus:border-[#066E53]"
                />
                <button type="submit" disabled={!draft.trim()} className="inline-flex items-center justify-center gap-2 min-h-11 rounded-xl bg-[#066E53] px-4 text-sm font-semibold text-white hover:bg-[#055741] disabled:opacity-50 cursor-pointer">
                  <Send className="w-4 h-4" aria-hidden="true" /><span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </div>
          ) : null}
        </section>
      )}

      <p className="text-xs text-[#718079]">Mensagens guardadas neste navegador. A sincronização entre dispositivos requer uma API de conversas.</p>
    </div>
  );
}
