import { Briefcase, Compass, FileCheck2, Landmark, Plus, ShieldCheck } from 'lucide-react';
import type { AppTab } from '../types/biscato';

interface NavbarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenNewRequest: () => void;
}

const NAV_ITEMS: { id: AppTab; label: string; shortLabel: string; icon: typeof Compass }[] = [
  { id: 'explore', label: 'Explorar', shortLabel: 'Explorar', icon: Compass },
  { id: 'opportunities', label: 'Oportunidades', shortLabel: 'Pedidos', icon: Briefcase },
  { id: 'proposals', label: 'Propostas', shortLabel: 'Propostas', icon: FileCheck2 },
  { id: 'escrow', label: 'Custódia', shortLabel: 'Custódia', icon: ShieldCheck },
  { id: 'business', label: 'Negócio', shortLabel: 'Negócio', icon: Landmark },
];

export function Navbar({ activeTab, onSelectTab, onOpenNewRequest }: NavbarProps) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E1E7E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand mark + wordmark (single line, no descriptor/badges) */}
          <button
            type="button"
            onClick={() => onSelectTab('explore')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#066E53] rounded-lg py-1"
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

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#52635D]" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => {
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
                  {item.label}
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

          {/* Zone 3: 1 primary CTA action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenNewRequest}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#066E53] cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Pedir Orçamento</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Thumb-zone navigation, compact height <= 15% mobile viewport) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E1E7E4] h-14 px-1 grid grid-cols-5 items-center"
        aria-label="Navegação móvel"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] rounded-lg transition-colors whitespace-nowrap ${
                isActive ? 'text-[#066E53] font-semibold' : 'text-[#52635D]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="text-[11px] leading-none mt-1">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
