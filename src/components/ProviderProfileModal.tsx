import { Award, BadgeCheck, CheckCircle2, ShieldCheck, Star, X } from 'lucide-react';
import type { ProviderProfile } from '../types/biscato';
import { formatMT } from '../utils/formatters';
import { PortfolioArtwork } from './TradeArtwork';

interface ProviderProfileModalProps {
  provider: ProviderProfile | null;
  onClose: () => void;
  onRequestQuote: (provider: ProviderProfile) => void;
}

export function ProviderProfileModal({
  provider,
  onClose,
  onRequestQuote,
}: ProviderProfileModalProps) {
  if (!provider) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="provider-profile-title"
    >
      <div className="bg-white rounded-3xl border border-[#E1E7E4] w-full max-w-2xl overflow-hidden shadow-2xl my-auto">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-[#E1E7E4] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#066E53]">
            03. Perfil profissional · Evidência concreta de confiança
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar perfil"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#52635D] hover:bg-[#F6F7F5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Identity Header (matching Screen 03 of cls_f9822802.png) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#066E53] text-white font-display font-bold text-2xl flex items-center justify-center shrink-0">
              {provider.initials}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="provider-profile-title" className="font-display text-2xl font-bold text-[#10201B]">
                  {provider.name}
                </h2>
                <BadgeCheck className="w-5 h-5 text-[#F4811F]" aria-label="Selo Biscato Verificado" />
              </div>
              <p className="text-sm text-[#52635D]">
                {provider.specialty} · {provider.neighborhood}, {provider.province}
              </p>
              <div className="flex items-center gap-2 text-sm tabular-nums pt-0.5">
                <span className="inline-flex items-center gap-1 font-bold text-[#C85A08]">
                  <Star className="w-4 h-4 fill-[#F4811F] text-[#F4811F]" aria-hidden="true" />
                  {provider.rating.toFixed(1).replace('.', ',')}
                </span>
                <span className="text-[#52635D]">· {provider.reviewsCount} avaliações</span>
                <span className="text-[#52635D]">· {provider.creditsBalance} créditos Biscato</span>
              </div>
            </div>
          </div>

          {/* Trust & Protection Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#E7F3EE] rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#066E53] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#054A38]">Identidade verificada (BI)</p>
                <p className="text-xs text-[#2B6655]">Antecedentes e referências validadas</p>
              </div>
            </div>
            <div className="bg-[#E7F3EE] rounded-2xl p-4 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#066E53] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#054A38]">Garantia Biscato</p>
                <p className="text-xs text-[#2B6655]">Cobertura até 50% e proteção em custódia</p>
              </div>
            </div>
          </div>

          {/* 3-Metric Strip (Trabalhos / No prazo / Experiência) */}
          <div className="grid grid-cols-3 divide-x divide-[#E1E7E4] bg-[#F6F7F5] rounded-2xl py-4 text-center">
            <div className="px-2">
              <span className="block font-display text-2xl font-bold text-[#10201B] tabular-nums">
                {provider.completedJobs}
              </span>
              <span className="text-xs text-[#52635D]">Trabalhos</span>
            </div>
            <div className="px-2">
              <span className="block font-display text-2xl font-bold text-[#10201B] tabular-nums">
                {provider.onTimeRate}%
              </span>
              <span className="text-xs text-[#52635D]">No prazo</span>
            </div>
            <div className="px-2">
              <span className="block font-display text-2xl font-bold text-[#10201B] tabular-nums">
                {provider.yearsExperience} anos
              </span>
              <span className="text-xs text-[#52635D]">Experiência</span>
            </div>
          </div>

          {/* Bio & Subscription Status */}
          <div className="space-y-2">
            <h3 className="font-display text-sm font-bold text-[#10201B]">Sobre o profissional</h3>
            <p className="text-sm text-[#52635D] leading-relaxed">{provider.bio}</p>
            <div className="flex items-center gap-2 text-xs text-[#52635D] pt-1">
              <Award className="w-4 h-4 text-[#F4811F] shrink-0" aria-hidden="true" />
              <span>
                Estado da subscrição:{' '}
                <strong className="text-[#10201B]">
                  {provider.subscriptionState === 'active'
                    ? 'Subscrição Mensal Ativa'
                    : provider.subscriptionState === 'tolerance_30d'
                      ? `Período de Tolerância (${provider.toleranceDaysRemaining ?? 18} dias restantes · taxa 10%)`
                      : 'Perfil Suspenso'}
                </strong>
              </span>
            </div>
          </div>

          {/* Portfolio Works */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold text-[#10201B]">Trabalhos realizados</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {provider.portfolio.map((work) => (
                <div key={work.id} className="space-y-2">
                  <PortfolioArtwork tone={work.tone} title={work.title} />
                  <div className="flex items-center justify-between text-xs text-[#52635D] px-0.5">
                    <span>{work.location} · {work.completedAt}</span>
                    <span className="font-mono font-semibold text-[#10201B] tabular-nums">
                      {formatMT(work.costMT)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Reviews */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold text-[#10201B]">Avaliações verificadas</h3>
            <div className="space-y-3">
              {provider.reviews.map((rev) => (
                <div key={rev.id} className="border border-[#E1E7E4] rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#10201B]">
                      {rev.clientName} · <span className="text-[#52635D] font-normal">{rev.serviceTitle}</span>
                    </span>
                    <span className="text-[#52635D]">{rev.dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F4811F] text-[#F4811F]" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-sm text-[#52635D] italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer CTA */}
        <div className="px-6 py-4 border-t border-[#E1E7E4] bg-[#F6F7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="block text-xs text-[#52635D]">Valor base de referência</span>
            <span className="font-mono text-base font-bold text-[#10201B] tabular-nums">
              {formatMT(provider.hourlyOrBaseMT)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onRequestQuote(provider);
              onClose();
            }}
            className="h-11 px-6 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold whitespace-nowrap cursor-pointer"
          >
            Pedir Orçamento Direto
          </button>
        </div>
      </div>
    </div>
  );
}
