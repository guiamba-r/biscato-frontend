import type { ServiceCategoryId } from '../types/biscato';

interface TradeIllustrationProps {
  category: Exclude<ServiceCategoryId, 'all'>;
  className?: string;
}

export function TradeIllustration({ category, className = 'w-full h-36' }: TradeIllustrationProps) {
  switch (category) {
    case 'carpintaria':
      return (
        <svg viewBox="0 0 320 140" className={className} fill="none" aria-hidden="true">
          <rect width="320" height="140" rx="12" fill="#F2EFE8" />
          <path d="M0 105 H320 V140 H0 Z" fill="#E3DAC8" />
          <rect x="44" y="34" width="128" height="71" rx="6" fill="#C98A4B" />
          <rect x="52" y="42" width="112" height="55" rx="3" fill="#DDA668" />
          <path d="M52 58 H164 M52 76 H164" stroke="#B77535" strokeWidth="2" />
          <rect x="198" y="46" width="84" height="59" rx="6" fill="#066E53" />
          <rect x="224" y="34" width="32" height="12" rx="4" fill="#F4811F" />
          <path d="M214 68 H266 M214 82 H252" stroke="#9EE0CA" strokeWidth="3" strokeLinecap="round" />
          <circle cx="268" cy="24" r="10" fill="#F4811F" opacity="0.22" />
        </svg>
      );
    case 'canalizacao':
      return (
        <svg viewBox="0 0 320 140" className={className} fill="none" aria-hidden="true">
          <rect width="320" height="140" rx="12" fill="#E8F4F0" />
          <path d="M36 92 H144 C156 92 164 84 164 72 V44 H228" stroke="#066E53" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="218" y="32" width="22" height="24" rx="4" fill="#F4811F" />
          <circle cx="96" cy="92" r="12" fill="#FFFFFF" stroke="#066E53" strokeWidth="4" />
          <path d="M262 66 C262 66 280 86 280 96 C280 106 272 114 262 114 C252 114 244 106 244 96 C244 86 262 66 262 66 Z" fill="#066E53" opacity="0.85" />
        </svg>
      );
    case 'eletricidade':
      return (
        <svg viewBox="0 0 320 140" className={className} fill="none" aria-hidden="true">
          <rect width="320" height="140" rx="12" fill="#FFF4EA" />
          <rect x="64" y="24" width="112" height="92" rx="10" fill="#FFFFFF" stroke="#E7C9AE" strokeWidth="2" />
          <rect x="82" y="42" width="28" height="36" rx="4" fill="#10201B" />
          <rect x="122" y="42" width="28" height="36" rx="4" fill="#066E53" />
          <rect x="86" y="48" width="20" height="10" rx="2" fill="#F4811F" />
          <rect x="126" y="60" width="20" height="10" rx="2" fill="#9EE0CA" />
          <path d="M236 28 L214 72 H238 L226 112 L266 60 H240 L254 28 Z" fill="#F4811F" />
        </svg>
      );
    case 'pintura':
      return (
        <svg viewBox="0 0 320 140" className={className} fill="none" aria-hidden="true">
          <rect width="320" height="140" rx="12" fill="#EDF2FA" />
          <rect x="44" y="26" width="138" height="88" rx="8" fill="#FFFFFF" />
          <rect x="44" y="26" width="84" height="88" rx="8" fill="#066E53" opacity="0.16" />
          <rect x="116" y="40" width="66" height="24" rx="6" fill="#F4811F" />
          <path d="M182 52 H202 V84 L182 96" stroke="#10201B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="220" y="64" width="54" height="50" rx="6" fill="#066E53" />
          <rect x="216" y="58" width="62" height="10" rx="3" fill="#044F3B" />
        </svg>
      );
    case 'mudancas':
      return (
        <svg viewBox="0 0 320 140" className={className} fill="none" aria-hidden="true">
          <rect width="320" height="140" rx="12" fill="#F9EFF5" />
          <path d="M20 108 H300" stroke="#DFC8D6" strokeWidth="3" strokeLinecap="round" />
          <rect x="52" y="42" width="128" height="56" rx="8" fill="#066E53" />
          <path d="M180 56 H226 L248 78 V98 H180 V56 Z" fill="#F4811F" />
          <rect x="190" y="64" width="32" height="16" rx="3" fill="#FFF7F0" />
          <circle cx="92" cy="100" r="14" fill="#10201B" />
          <circle cx="92" cy="100" r="6" fill="#FFFFFF" />
          <circle cx="218" cy="100" r="14" fill="#10201B" />
          <circle cx="218" cy="100" r="6" fill="#FFFFFF" />
        </svg>
      );
    case 'mecanica':
      return (
        <svg viewBox="0 0 320 140" className={className} fill="none" aria-hidden="true">
          <rect width="320" height="140" rx="12" fill="#EFEFF9" />
          <rect x="54" y="34" width="142" height="70" rx="10" fill="#FFFFFF" stroke="#D1D0EA" strokeWidth="2" />
          <path d="M72 60 H178 M72 74 H178 M72 88 H144" stroke="#066E53" strokeWidth="4" strokeLinecap="round" />
          <circle cx="242" cy="70" r="30" fill="#066E53" />
          <circle cx="242" cy="70" r="12" fill="#EFEFF9" />
          <path d="M242 34 V46 M242 94 V106 M206 70 H218 M266 70 H278" stroke="#F4811F" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case 'construcao':
      return (
        <svg viewBox="0 0 320 140" className={className} fill="none" aria-hidden="true">
          <rect width="320" height="140" rx="12" fill="#FBF0ED" />
          <rect x="48" y="76" width="54" height="28" rx="4" fill="#C95A3F" />
          <rect x="108" y="76" width="54" height="28" rx="4" fill="#E0755A" />
          <rect x="168" y="76" width="54" height="28" rx="4" fill="#C95A3F" />
          <rect x="78" y="44" width="54" height="28" rx="4" fill="#F4811F" />
          <rect x="138" y="44" width="54" height="28" rx="4" fill="#C95A3F" />
          <path d="M246 44 L276 74 L248 102 L218 72 Z" fill="#066E53" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 320 140" className={className} fill="none" aria-hidden="true">
          <rect width="320" height="140" rx="12" fill="#EDF3F1" />
          <circle cx="110" cy="70" r="34" fill="#066E53" opacity="0.14" />
          <rect x="86" y="46" width="48" height="48" rx="12" fill="#066E53" />
          <rect x="164" y="54" width="96" height="12" rx="6" fill="#10201B" opacity="0.2" />
          <rect x="164" y="76" width="68" height="12" rx="6" fill="#F4811F" />
        </svg>
      );
  }
}

export function PortfolioArtwork({ tone, title }: { tone: 'emerald' | 'amber' | 'slate'; title: string }) {
  return (
    <div className={`relative h-28 rounded-[8px] ${tone === 'emerald' ? 'bg-[#125B47]' : tone === 'amber' ? 'bg-[#74502F]' : 'bg-[#324640]'} p-3.5 flex flex-col justify-between overflow-hidden`}>
      <span className="relative z-10 text-[11px] font-medium text-white/75">Registo verificado</span>
      <span className="relative z-10 text-sm font-semibold text-white leading-snug">{title}</span>
    </div>
  );
}
