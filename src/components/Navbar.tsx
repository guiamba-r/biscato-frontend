import { Briefcase, Compass, FileCheck2, Headset, Home, MessageCircle, Plus, ShieldCheck, Store, UserRound } from 'lucide-react';
import type { AppTab } from '../types/biscato';
import type { ApiUserRole } from '../api/types';

interface NavbarProps {
  activeTab: AppTab;
  userName: string | null;
  userRole: ApiUserRole | null;
  canAccessEscrow: boolean;
  onSelectTab: (tab: AppTab) => void;
  onOpenNewRequest: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: AppTab; label: string; shortLabel: string; icon: typeof Compass }[] = [
  { id: 'home', label: 'Início', shortLabel: 'Início', icon: Home },
  { id: 'explore', label: 'Explorar', shortLabel: 'Explorar', icon: Compass },
  { id: 'services', label: 'Serviços', shortLabel: 'Serviços', icon: Store },
  { id: 'opportunities', label: 'Oportunidades', shortLabel: 'Pedidos', icon: Briefcase },
  { id: 'proposals', label: 'Propostas', shortLabel: 'Propostas', icon: FileCheck2 },
  { id: 'messages', label: 'Mensagens', shortLabel: 'Mensagens', icon: MessageCircle },
  { id: 'support', label: 'Ajuda', shortLabel: 'Ajuda', icon: Headset },
  { id: 'profile', label: 'Editar perfil', shortLabel: 'Perfil', icon: UserRound },
  { id: 'escrow', label: 'Custódia', shortLabel: 'Custódia', icon: ShieldCheck },
  { id: 'business', label: 'Gestão', shortLabel: 'Gestão', icon: Briefcase },
];

const SECONDARY_BUTTON_CLASS =
  'px-3 py-2.5 min-h-[40px] rounded-xl border border-[#D4DDD9] hover:bg-[#F6F7F5] text-[#10201B] text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer';

export function Navbar({
  activeTab,
  userName,
  userRole,
  canAccessEscrow,
  onSelectTab,
  onOpenNewRequest,
  onLogin,
  onLogout,
}: NavbarProps) {
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.id === 'home' || item.id === 'explore' || item.id === 'services') return true;
    if (item.id === 'support') return true;
    if (!userRole) return false;
    if (item.id === 'business') return false;
    if (userRole === 'admin') return false;
    if (item.id === 'escrow') return canAccessEscrow;
    if (item.id === 'profile' || item.id === 'messages') return true;
    if (userRole === 'client') return item.id === 'proposals';
    return item.id === 'opportunities';
  });
  const mobileItems = userRole ? visibleItems.filter((item) => item.id !== 'home') : visibleItems;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FBFAF7]/95 backdrop-blur-sm border-b border-[#D5D9D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066E53] rounded-lg py-1 cursor-pointer"
          >
            <img
              src="/assets/aistudio/biscato_logo_4fc64c75.png"
              alt="Logótipo Biscato"
              referrerPolicy="no-referrer"
              className="h-8 w-auto object-contain shrink-0"
            />
            <span className="font-display text-xl font-bold tracking-tight text-[#066E53]">
              Biscato
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-3 lg:gap-7 text-sm font-medium text-[#52635D]" aria-label="Navegação principal">
            {visibleItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-2 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066E53] rounded ${
                    isActive
                      ? 'text-[#066E53] font-semibold'
                      : 'hover:text-[#10201B]'
                  }`}
                >
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{item.shortLabel}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#066E53] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {userName ? (
              <>
                <span className="hidden lg:inline text-xs text-[#52635D] max-w-[140px] truncate">
                  {userName}
                </span>
                <button type="button" onClick={onLogout} className={SECONDARY_BUTTON_CLASS}>
                  Sair
                </button>
              </>
            ) : (
              <button type="button" onClick={onLogin} className={SECONDARY_BUTTON_CLASS}>
                Entrar
              </button>
            )}
            {userRole === 'provider' ? (
              <button type="button" onClick={() => onSelectTab('services')} className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 min-h-[40px] rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer">
                <Plus className="w-4 h-4 shrink-0" aria-hidden="true" /><span className="hidden sm:inline">Publicar serviço</span>
              </button>
            ) : userRole === 'admin' ? null : (
              <button
                type="button"
                onClick={onOpenNewRequest}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 min-h-[40px] rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#066E53] cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Pedir Orçamento</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E1E7E4] h-14 px-1 flex items-center overflow-x-auto"
        aria-label="Navegação móvel"
      >
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 min-w-[56px] flex flex-col items-center justify-center min-h-[44px] rounded-lg transition-colors whitespace-nowrap ${
                isActive ? 'text-[#066E53] font-semibold' : 'text-[#52635D]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="text-[10px] leading-none mt-1">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
