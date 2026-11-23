import { useMemo, useState } from 'react';
import { ClipboardList, FileWarning, Headset, LockKeyhole, Palette, Search, Settings2, ShieldCheck, Trash2, UserCog, Users } from 'lucide-react';
import type { ProviderProfile, ServiceRequest } from '../types/biscato';

type AdminSection = 'dashboard' | 'users' | 'providers' | 'requests' | 'support' | 'appearance' | 'settings' | 'operators' | 'audit';

interface SupportThread {
  accountId: string;
  messages: Array<{ id: string; senderName: string; text: string; timestamp: string; sender?: string }>;
}

interface AuditEntry {
  id: string;
  action: string;
  target: string;
  timestamp: string;
}

interface AdminBackofficeViewProps {
  providers: ProviderProfile[];
  requests: ServiceRequest[];
  supportThreads: SupportThread[];
  onUpdateProvider: (id: string, updates: Partial<Pick<ProviderProfile, 'biVerified' | 'subscriptionState' | 'isAvailable'>>) => void;
  onRemoveProvider: (id: string) => void;
  onUpdateRequest?: (id: string, status: ServiceRequest['status']) => void;
}

const NAVIGATION: Array<{ id: AdminSection; label: string; icon: typeof ClipboardList }> = [
  { id: 'dashboard', label: 'Painel', icon: ClipboardList },
  { id: 'users', label: 'Utilizadores', icon: Users },
  { id: 'providers', label: 'Verificação', icon: ShieldCheck },
  { id: 'requests', label: 'Pedidos', icon: FileWarning },
  { id: 'support', label: 'Suporte', icon: Headset },
  { id: 'appearance', label: 'Layout da plataforma', icon: Palette },
  { id: 'settings', label: 'Configurações', icon: Settings2 },
  { id: 'operators', label: 'Operadores', icon: UserCog },
  { id: 'audit', label: 'Auditoria', icon: LockKeyhole },
];

const initialOperators = [
  { id: 'op-001', name: 'Administrador principal', email: 'admin@biscato.local', role: 'admin', active: true },
  { id: 'op-002', name: 'Fila de suporte', email: 'suporte@biscato.local', role: 'suporte', active: true },
];

const APPEARANCE_KEY = 'biscato:admin-appearance:v1';

function readAppearance() {
  try {
    return JSON.parse(localStorage.getItem(APPEARANCE_KEY) ?? '{}') as { brandColor?: string; accentColor?: string; heroTitle?: string; heroSubtitle?: string; announcement?: string };
  } catch { return {}; }
}

export function AdminBackofficeView({ providers, requests, supportThreads, onUpdateProvider, onRemoveProvider, onUpdateRequest }: AdminBackofficeViewProps) {
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [operators, setOperators] = useState(initialOperators);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [radiusKm, setRadiusKm] = useState('10');
  const [commissionPercent, setCommissionPercent] = useState('0');
  const [searchTerm, setSearchTerm] = useState('');
  const [appearance, setAppearance] = useState(() => ({ brandColor: '#066E53', accentColor: '#F4811F', heroTitle: 'A pessoa certa. O trabalho certo.', heroSubtitle: 'Encontre profissionais verificados perto de si.', announcement: '', ...readAppearance() }));
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const pendingProviders = providers.filter((provider) => !provider.biVerified);
  const activeProviders = providers.filter((provider) => provider.biVerified && provider.subscriptionState !== 'suspended');
  const openRequests = requests.filter((request) => request.status === 'open');
  const totalSupportMessages = supportThreads.reduce((total, thread) => total + thread.messages.length, 0);
  const filteredProviders = providers.filter((provider) => `${provider.name} ${provider.specialty} ${provider.neighborhood}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRequests = requests.filter((request) => `${request.title} ${request.category} ${request.neighborhood} ${request.clientId ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const addAudit = (action: string, target: string) => {
    setAudit((previous) => [{ id: `audit-${Date.now()}`, action, target, timestamp: new Date().toLocaleString('pt-MZ') }, ...previous]);
  };

  const updateProvider = (provider: ProviderProfile, updates: Partial<Pick<ProviderProfile, 'biVerified' | 'subscriptionState' | 'isAvailable'>>, action: string) => {
    if (!window.confirm(`${action} para ${provider.name}? Esta acção ficará registada no histórico local.`)) return;
    onUpdateProvider(provider.id, updates);
    addAudit(action, provider.name);
  };

  const removeProvider = (provider: ProviderProfile) => {
    if (!window.confirm(`Remover ${provider.name} da lista local de prestadores? Esta operação só afecta este frontend.`)) return;
    onRemoveProvider(provider.id);
    addAudit('Removeu prestador da lista local', provider.name);
  };

  const toggleOperator = (operatorId: string) => {
    setOperators((previous) => previous.map((operator) => operator.id === operatorId ? { ...operator, active: !operator.active } : operator));
    const operator = operators.find((item) => item.id === operatorId);
    if (operator) addAudit(operator.active ? 'Desactivou operador' : 'Activou operador', operator.email);
  };

  const saveAppearance = () => {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance));
    document.documentElement.style.setProperty('--biscato-brand', appearance.brandColor);
    document.documentElement.style.setProperty('--biscato-accent', appearance.accentColor);
    addAudit('Actualizou identidade visual local', appearance.heroTitle);
  };

  const sendSupportReply = (accountId: string) => {
    const reply = replyDrafts[accountId]?.trim();
    if (!reply) return;
    const key = `biscato:support-history:v1:${accountId}`;
    try {
      const messages = JSON.parse(localStorage.getItem(key) ?? '[]') as SupportThread['messages'];
      messages.push({ id: `admin-reply-${Date.now()}`, sender: 'team', senderName: 'Equipa Biscato (demo)', text: reply, timestamp: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }) });
      localStorage.setItem(key, JSON.stringify(messages));
      setReplyDrafts((previous) => ({ ...previous, [accountId]: '' }));
      addAudit('Respondeu ao suporte (demo)', accountId);
    } catch { addAudit('Falha ao guardar resposta local', accountId); }
  };

  const sectionContent = useMemo(() => {
    if (section === 'dashboard') return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Prestadores activos', activeProviders.length, 'Perfis verificados e operacionais'],
            ['Em verificação', pendingProviders.length, 'Aguardam revisão operacional'],
            ['Pedidos abertos', openRequests.length, 'Oportunidades em circulação'],
            ['Mensagens de suporte', totalSupportMessages, 'Histórico neste navegador'],
          ].map(([label, value, detail]) => <article key={label} className="rounded-2xl border border-[#D5D9D3] bg-white p-5"><p className="text-xs font-semibold text-[#52635D]">{label}</p><p className="mt-2 font-mono text-3xl font-bold tabular-nums text-[#10201B]">{value}</p><p className="mt-1 text-xs text-[#718079]">{detail}</p></article>)}
        </div>
        <section className="rounded-2xl border border-[#D5D9D3] bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-[#10201B]">Filas prioritárias</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <button type="button" onClick={() => setSection('providers')} className="rounded-xl bg-[#FFF8EA] p-4 text-left hover:ring-1 hover:ring-[#F4811F]"><p className="text-sm font-bold text-[#6B4811]">Verificação</p><p className="mt-1 text-xs text-[#6B4811]">{pendingProviders.length} perfil(is) para decidir</p></button>
            <button type="button" onClick={() => setSection('support')} className="rounded-xl bg-[#E7F3EE] p-4 text-left hover:ring-1 hover:ring-[#066E53]"><p className="text-sm font-bold text-[#054A38]">Suporte</p><p className="mt-1 text-xs text-[#245B48]">{supportThreads.length} conversa(s) locais</p></button>
            <button type="button" onClick={() => setSection('audit')} className="rounded-xl bg-[#F6F7F5] p-4 text-left hover:ring-1 hover:ring-[#52635D]"><p className="text-sm font-bold text-[#10201B]">Auditoria</p><p className="mt-1 text-xs text-[#52635D]">{audit.length} acção(ões) nesta sessão</p></button>
          </div>
        </section>
      </div>
    );

    if (section === 'providers') return (
      <section className="rounded-2xl border border-[#D5D9D3] bg-white overflow-hidden">
        <div className="border-b border-[#E1E7E4] p-5"><h2 className="font-display text-lg font-bold text-[#10201B]">Verificação e gestão de prestadores</h2><p className="mt-1 text-sm text-[#52635D]">Pesquisar perfis, verificar e gerir a disponibilidade local.</p><label className="relative mt-4 block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718079]"/><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Nome, especialidade ou bairro" className="h-11 w-full rounded-xl border border-[#D4DDD9] pl-9 pr-3 text-sm"/></label></div>
        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-[#F6F7F5] text-xs text-[#52635D]"><tr><th className="px-5 py-3">Prestador</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Acções</th></tr></thead><tbody>{filteredProviders.map((provider) => <tr key={provider.id} className="border-t border-[#E1E7E4]"><td className="px-5 py-4"><p className="font-semibold text-[#10201B]">{provider.name}</p><p className="text-xs text-[#52635D]">{provider.specialty} · {provider.neighborhood}</p></td><td className="px-5 py-4 text-xs"><p>{provider.biVerified ? 'Verificado' : 'Pendente'}</p><p className={provider.subscriptionState === 'suspended' ? 'text-[#B53D26]' : 'text-[#066E53]'}>{provider.subscriptionState}</p><p>{provider.isAvailable === false ? 'Indisponível' : 'Disponível'}</p></td><td className="px-5 py-4"><div className="flex flex-wrap gap-2">{!provider.biVerified && <button type="button" onClick={() => updateProvider(provider, { biVerified: true }, 'Aprovou verificação')} className="rounded-lg bg-[#066E53] px-3 py-2 text-xs font-semibold text-white">Aprovar</button>}<button type="button" onClick={() => updateProvider(provider, { isAvailable: provider.isAvailable === false }, provider.isAvailable === false ? 'Activou prestador' : 'Desactivou prestador')} className="rounded-lg border border-[#D4DDD9] px-3 py-2 text-xs font-semibold text-[#354A42]">{provider.isAvailable === false ? 'Activar' : 'Desactivar'}</button><button type="button" onClick={() => updateProvider(provider, { subscriptionState: provider.subscriptionState === 'suspended' ? 'active' : 'suspended' }, provider.subscriptionState === 'suspended' ? 'Reactivou prestador' : 'Suspendeu prestador')} className="rounded-lg border border-[#D4DDD9] px-3 py-2 text-xs font-semibold text-[#354A42]">{provider.subscriptionState === 'suspended' ? 'Reactivar' : 'Suspender'}</button><button type="button" onClick={() => removeProvider(provider)} className="rounded-lg px-2 py-2 text-[#B42318] hover:bg-red-50" aria-label={`Remover ${provider.name}`}><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
      </section>
    );

    if (section === 'users') return <section className="rounded-2xl border border-[#D5D9D3] bg-white p-5 sm:p-6"><h2 className="font-display text-lg font-bold text-[#10201B]">Utilizadores da plataforma</h2><p className="mt-1 text-sm text-[#52635D]">Lista local formada pelos prestadores e clientes identificáveis nos pedidos carregados.</p><label className="relative mt-4 block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718079]"/><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Pesquisar nome, email ou localização" className="h-11 w-full rounded-xl border border-[#D4DDD9] pl-9 pr-3 text-sm"/></label><div className="mt-4 space-y-2">{filteredProviders.map((provider) => <article key={provider.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E1E7E4] p-4"><div><p className="font-semibold text-[#10201B]">{provider.name}</p><p className="text-xs text-[#52635D]">Prestador · {provider.specialty} · {provider.neighborhood}</p></div><span className="rounded-full bg-[#E7F3EE] px-3 py-1 text-xs text-[#066E53]">{provider.biVerified ? 'Verificado' : 'Pendente'}</span></article>)}{Array.from(new Set(requests.map((request) => request.clientId).filter((id): id is string => !!id))).filter((id) => id.toLowerCase().includes(searchTerm.toLowerCase())).map((clientId) => <article key={clientId} className="rounded-xl border border-[#E1E7E4] p-4"><p className="font-semibold text-[#10201B]">{clientId}</p><p className="text-xs text-[#52635D]">Cliente identificado em pedido local</p></article>)}</div></section>;

    if (section === 'requests') return <section className="rounded-2xl border border-[#D5D9D3] bg-white p-5 sm:p-6"><h2 className="font-display text-lg font-bold text-[#10201B]">Pedidos e moderação</h2><p className="mt-1 text-sm text-[#52635D]">Pesquisar e moderar pedidos visíveis nesta sessão.</p><label className="relative mt-4 block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718079]"/><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Título, categoria, bairro ou cliente" className="h-11 w-full rounded-xl border border-[#D4DDD9] pl-9 pr-3 text-sm"/></label><div className="mt-5 space-y-3">{filteredRequests.length === 0 ? <p className="text-sm text-[#52635D]">Ainda não há pedidos disponíveis.</p> : filteredRequests.map((request) => <article key={request.id} className="rounded-xl border border-[#E1E7E4] p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold text-[#10201B]">{request.title}</p><p className="text-xs text-[#52635D]">{request.category} · {request.neighborhood} · {request.clientId ?? 'Cliente não identificado'}</p></div><span className="rounded-full bg-[#F6F7F5] px-3 py-1 text-xs font-semibold text-[#52635D]">{request.status}</span></div><div className="mt-3 flex flex-wrap gap-2">{request.status === 'open' && <><button type="button" onClick={() => { onUpdateRequest?.(request.id, 'completed'); addAudit('Moderou pedido', `Concluído: ${request.title}`); }} className="rounded-lg border border-[#D4DDD9] px-3 py-2 text-xs font-semibold">Marcar concluído</button><button type="button" onClick={() => { if (window.confirm(`Arquivar o pedido “${request.title}” nesta demonstração?`)) { onUpdateRequest?.(request.id, 'completed'); addAudit('Arquivou pedido', request.title); } }} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#B42318] hover:bg-red-50">Arquivar</button></>}</div></article>)}</div></section>;

    if (section === 'support') return <section className="rounded-2xl border border-[#D5D9D3] bg-white p-5 sm:p-6"><h2 className="font-display text-lg font-bold text-[#10201B]">Fila de suporte</h2><p className="mt-1 text-sm text-[#52635D]">Consulte o histórico deste navegador e simule respostas da equipa.</p><div className="mt-5 space-y-4">{supportThreads.length === 0 ? <p className="text-sm text-[#52635D]">Nenhuma conversa de suporte foi guardada neste navegador.</p> : supportThreads.map((thread) => <article key={thread.accountId} className="rounded-xl border border-[#E1E7E4] p-4"><p className="text-sm font-semibold text-[#10201B]">Conta: {thread.accountId}</p><div className="mt-2 max-h-64 space-y-2 overflow-y-auto">{thread.messages.map((message) => <p key={message.id} className="rounded-lg bg-[#F6F7F5] p-3 text-sm text-[#52635D]"><strong className="text-[#10201B]">{message.senderName}:</strong> {message.text}<span className="mt-1 block text-[11px] text-[#718079]">{message.timestamp}</span></p>)}</div><div className="mt-3 flex gap-2"><input value={replyDrafts[thread.accountId] ?? ''} onChange={(event) => setReplyDrafts((previous) => ({ ...previous, [thread.accountId]: event.target.value }))} placeholder="Escreva uma resposta demo" className="h-10 min-w-0 flex-1 rounded-lg border border-[#D4DDD9] px-3 text-sm"/><button type="button" onClick={() => sendSupportReply(thread.accountId)} className="rounded-lg bg-[#066E53] px-3 text-xs font-semibold text-white">Responder</button></div></article>)}</div></section>;

    if (section === 'appearance') return <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,.9fr)]"><div className="rounded-2xl border border-[#D5D9D3] bg-white p-5 sm:p-6"><h2 className="font-display text-lg font-bold text-[#10201B]">Identidade visual e conteúdo</h2><p className="mt-1 text-sm text-[#52635D]">Edite cores e mensagens da página inicial e veja uma pré-visualização imediata neste navegador.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1 block text-xs font-semibold">Cor principal</span><div className="flex h-11 items-center gap-2 rounded-xl border border-[#D4DDD9] px-2"><input type="color" value={appearance.brandColor} onChange={(event) => setAppearance((previous) => ({ ...previous, brandColor: event.target.value }))} className="h-8 w-10 cursor-pointer border-0 bg-transparent"/><input value={appearance.brandColor} onChange={(event) => setAppearance((previous) => ({ ...previous, brandColor: event.target.value }))} className="min-w-0 flex-1 text-sm uppercase outline-none"/></div></label><label className="block"><span className="mb-1 block text-xs font-semibold">Cor de destaque</span><div className="flex h-11 items-center gap-2 rounded-xl border border-[#D4DDD9] px-2"><input type="color" value={appearance.accentColor} onChange={(event) => setAppearance((previous) => ({ ...previous, accentColor: event.target.value }))} className="h-8 w-10 cursor-pointer border-0 bg-transparent"/><input value={appearance.accentColor} onChange={(event) => setAppearance((previous) => ({ ...previous, accentColor: event.target.value }))} className="min-w-0 flex-1 text-sm uppercase outline-none"/></div></label><label className="block sm:col-span-2"><span className="mb-1 block text-xs font-semibold">Título principal</span><input maxLength={100} value={appearance.heroTitle} onChange={(event) => setAppearance((previous) => ({ ...previous, heroTitle: event.target.value }))} className="h-11 w-full rounded-xl border border-[#D4DDD9] px-3 text-sm"/></label><label className="block sm:col-span-2"><span className="mb-1 block text-xs font-semibold">Texto de apresentação</span><textarea rows={3} maxLength={220} value={appearance.heroSubtitle} onChange={(event) => setAppearance((previous) => ({ ...previous, heroSubtitle: event.target.value }))} className="w-full rounded-xl border border-[#D4DDD9] p-3 text-sm"/></label><label className="block sm:col-span-2"><span className="mb-1 block text-xs font-semibold">Aviso no topo (opcional)</span><input maxLength={120} value={appearance.announcement} onChange={(event) => setAppearance((previous) => ({ ...previous, announcement: event.target.value }))} placeholder="Ex.: Novos prestadores disponíveis em Maputo" className="h-11 w-full rounded-xl border border-[#D4DDD9] px-3 text-sm"/></label></div><button type="button" onClick={saveAppearance} className="mt-5 min-h-11 rounded-xl bg-[#066E53] px-4 text-sm font-semibold text-white">Aplicar e guardar neste navegador</button></div><div className="rounded-2xl border border-[#D5D9D3] bg-white p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-wide text-[#718079]">Pré-visualização da homepage</p><div className="mt-4 overflow-hidden rounded-2xl border border-[#E1E7E4]"><div className="flex items-center justify-between px-4 py-3 text-white" style={{ backgroundColor: appearance.brandColor }}><strong>Biscato</strong><span className="text-xs">Início　 Explorar　 Serviços</span></div><div className="space-y-4 bg-[#F6F5F1] p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-wide" style={{ color: appearance.brandColor }}>O marketplace de serviços em Moçambique</p><h3 className="font-display text-2xl font-bold text-[#10201B]">{appearance.heroTitle}</h3><p className="text-sm leading-relaxed text-[#52635D]">{appearance.heroSubtitle}</p><button type="button" className="min-h-10 rounded-xl px-4 text-sm font-bold text-white" style={{ backgroundColor: appearance.accentColor }}>Pedir orçamento</button>{appearance.announcement && <p className="rounded-lg p-3 text-xs" style={{ color: appearance.brandColor, backgroundColor: `${appearance.brandColor}18` }}>{appearance.announcement}</p>}</div></div><p className="mt-3 text-xs text-[#718079]">A pré-visualização é local. O tema não é publicado para outros dispositivos.</p></div></section>;

    if (section === 'settings') return <section className="max-w-2xl rounded-2xl border border-[#D5D9D3] bg-white p-5 sm:p-6"><h2 className="font-display text-lg font-bold text-[#10201B]">Configurações operacionais</h2><p className="mt-1 text-sm text-[#52635D]">Estes valores ficam apenas nesta sessão de frontend até existir a API de configurações.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="mb-1 block text-xs font-semibold text-[#10201B]">Raio máximo (km)</span><input type="number" min="1" value={radiusKm} onChange={(event) => setRadiusKm(event.target.value)} className="h-11 w-full rounded-xl border border-[#D4DDD9] px-3 text-sm" /></label><label><span className="mb-1 block text-xs font-semibold text-[#10201B]">Comissão padrão (%)</span><input type="number" min="0" max="100" value={commissionPercent} onChange={(event) => setCommissionPercent(event.target.value)} className="h-11 w-full rounded-xl border border-[#D4DDD9] px-3 text-sm" /></label></div><button type="button" onClick={() => addAudit('Actualizou configurações locais', `Raio ${radiusKm} km; comissão ${commissionPercent}%`)} className="mt-5 min-h-11 rounded-xl bg-[#066E53] px-4 text-sm font-semibold text-white">Guardar configuração local</button></section>;

    if (section === 'operators') return <section className="rounded-2xl border border-[#D5D9D3] bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-lg font-bold text-[#10201B]">Operadores</h2><p className="mt-1 text-sm text-[#52635D]">Contas operacionais da demonstração.</p></div><button type="button" onClick={() => { const index = operators.length + 1; setOperators((previous) => [...previous, { id: `op-${Date.now()}`, name: `Novo operador ${index}`, email: `operador${index}@biscato.local`, role: 'suporte', active: true }]); addAudit('Criou operador local', `operador${index}@biscato.local`); }} className="min-h-10 rounded-xl bg-[#066E53] px-4 text-sm font-semibold text-white">Criar operador</button></div><div className="mt-5 space-y-3">{operators.map((operator) => <div key={operator.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E1E7E4] p-4"><div><p className="font-semibold text-[#10201B]">{operator.name}</p><p className="text-xs text-[#52635D]">{operator.email} · {operator.role}</p></div><button type="button" onClick={() => toggleOperator(operator.id)} className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${operator.active ? 'bg-[#E7F3EE] text-[#066E53]' : 'bg-[#FDEAE6] text-[#B42318]'}`}>{operator.active ? 'Activo' : 'Inactivo'}</button></div>)}</div></section>;

    return <section className="rounded-2xl border border-[#D5D9D3] bg-white p-5 sm:p-6"><h2 className="font-display text-lg font-bold text-[#10201B]">Auditoria da sessão</h2><p className="mt-1 text-sm text-[#52635D]">Acções administrativas realizadas neste frontend.</p><div className="mt-5 space-y-3">{audit.length === 0 ? <p className="text-sm text-[#52635D]">Ainda não há acções registadas nesta sessão.</p> : audit.map((entry) => <div key={entry.id} className="rounded-xl border border-[#E1E7E4] p-4"><p className="font-semibold text-[#10201B]">{entry.action}</p><p className="text-sm text-[#52635D]">{entry.target}</p><p className="mt-1 text-xs text-[#718079]">{entry.timestamp}</p></div>)}</div></section>;
  }, [section, activeProviders.length, pendingProviders.length, openRequests.length, totalSupportMessages, supportThreads, audit, providers, requests, filteredProviders, filteredRequests, radiusKm, commissionPercent, operators, appearance, replyDrafts]);

  return (
    <div className="min-h-screen bg-[#F3F5F3] text-[#10201B]">
      <header className="border-b border-[#D5D9D3] bg-[#10201B] px-4 py-4 text-white sm:px-6"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#AEE6D4]">Biscato · operação interna</p><h1 className="font-display text-xl font-bold">Backoffice do superadministrador</h1></div><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">Acesso admin</span></div></header>
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="border-b border-[#D5D9D3] bg-white p-3 lg:min-h-[calc(100vh-77px)] lg:border-b-0 lg:border-r"><nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Navegação do backoffice">{NAVIGATION.map((item) => { const Icon = item.icon; const selected = item.id === section; return <button key={item.id} type="button" onClick={() => setSection(item.id)} className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold ${selected ? 'bg-[#E7F3EE] text-[#066E53]' : 'text-[#52635D] hover:bg-[#F6F7F5]'}`}><Icon className="h-4 w-4" aria-hidden="true" />{item.label}</button>; })}</nav></aside>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8"><div className="mb-6 flex items-start gap-3 rounded-xl border border-[#F0D6A8] bg-[#FFF8EA] p-3 text-xs leading-relaxed text-[#6B4811]"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Este painel só apresenta e altera dados disponíveis neste frontend. Operações reais exigem endpoints de backoffice com RBAC, auditoria persistente e confirmação no servidor.</div>{sectionContent}</main>
      </div>
    </div>
  );
}
