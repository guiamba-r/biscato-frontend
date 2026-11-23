import { useState } from 'react';
import { BriefcaseBusiness, CirclePause, MapPin, Play, Plus, Send, Trash2 } from 'lucide-react';
import { MOZAMBIQUE_PROVINCES, SERVICE_CATEGORIES } from '../data/biscatoData';
import type { ProviderProfile, ProviderServiceListing, ProvinceName, ServiceCategoryId, UserRole } from '../types/biscato';
import { formatMT } from '../utils/formatters';

type NewServicePayload = Pick<ProviderServiceListing,
  'title' | 'category' | 'province' | 'neighborhood' | 'priceMT' | 'description'
>;

interface ProviderServicesViewProps {
  services: ProviderServiceListing[];
  viewerRole: UserRole | null;
  currentProvider: ProviderProfile | null;
  canPublish: boolean;
  onPublish: (service: NewServicePayload) => boolean;
  onToggleStatus: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
  onRequestService: (service: ProviderServiceListing) => void;
}

export function ProviderServicesView({
  services,
  viewerRole,
  currentProvider,
  canPublish,
  onPublish,
  onToggleStatus,
  onDelete,
  onRequestService,
}: ProviderServicesViewProps) {
  const isProvider = viewerRole === 'provider';
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<ServiceCategoryId, 'all'>>(
    currentProvider?.category ?? 'canalizacao',
  );
  const [province, setProvince] = useState<ProvinceName>(
    currentProvider?.province ?? 'Cidade de Maputo',
  );
  const [neighborhood, setNeighborhood] = useState(currentProvider?.neighborhood ?? '');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const ownServices = currentProvider
    ? services.filter((service) => service.providerId === currentProvider.id)
    : [];
  const visibleServices = isProvider
    ? ownServices
    : services.filter((service) => service.status === 'active');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const priceMT = Number(price);
    if (!canPublish) {
      setError('É necessário ter o perfil verificado e a subscrição activa ou em tolerância para publicar.');
      return;
    }
    if (!currentProvider) {
      setError('Não foi possível carregar o seu perfil de prestador.');
      return;
    }
    if (title.trim().length < 5 || title.trim().length > 100) {
      setError('O título deve ter entre 5 e 100 caracteres.');
      return;
    }
    if (neighborhood.trim().length < 2) {
      setError('Indique o bairro onde presta este serviço.');
      return;
    }
    if (!Number.isFinite(priceMT) || priceMT < 200) {
      setError('O preço base deve ser de pelo menos 200 MT.');
      return;
    }
    if (description.trim().length < 10 || description.trim().length > 1200) {
      setError('A descrição deve ter entre 10 e 1200 caracteres.');
      return;
    }

    const published = onPublish({
      title: title.trim(),
      category,
      province,
      neighborhood: neighborhood.trim(),
      priceMT,
      description: description.trim(),
    });
    if (!published) return;
    setTitle('');
    setPrice('');
    setDescription('');
    setError(null);
  };

  return (
    <div className="space-y-8">
      <header className="editorial-rule flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-6">
        <div className="max-w-2xl">
          <p className="section-kicker mb-3">Vitrine de serviços</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#162820]">
            {isProvider ? 'Publique os seus serviços' : 'Serviços disponíveis'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#52635D] leading-relaxed">
            {isProvider
              ? 'Apresente o que faz, onde atende e o seu preço base. Os clientes podem pedir um orçamento diretamente.'
              : 'Veja o que os profissionais oferecem e peça um orçamento para o serviço de que precisa.'}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#066E53]">
          <BriefcaseBusiness className="w-4 h-4" aria-hidden="true" />
          {visibleServices.length} {visibleServices.length === 1 ? 'serviço' : 'serviços'}
        </span>
      </header>

      {isProvider && currentProvider && (
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 items-start">
          <form onSubmit={handleSubmit} className="bg-white border border-[#D5D9D3] rounded-2xl p-5 sm:p-6 space-y-4">
            <div>
              <p className="section-kicker mb-2">Novo anúncio</p>
              <h2 className="font-display text-xl font-bold text-[#162820]">Descreva o serviço</h2>
              <p className="mt-1 text-xs text-[#52635D]">O anúncio será associado ao perfil de {currentProvider.name}.</p>
            </div>
            {!canPublish && (
              <p className="rounded-xl bg-[#FFF8EA] p-3 text-xs leading-relaxed text-[#6B4811]" role="status">
                Para publicar, o perfil precisa estar verificado e a subscrição activa ou em tolerância.
              </p>
            )}

            <label className="block">
              <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Nome do serviço</span>
              <input
                required
                minLength={5}
                maxLength={100}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex.: Reparação de fugas em canalização"
                className="w-full h-11 px-3.5 rounded-xl border border-[#D4DDD9] text-sm outline-none focus:border-[#066E53]"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Categoria</span>
                <select value={category} onChange={(event) => setCategory(event.target.value as Exclude<ServiceCategoryId, 'all'>)} className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] bg-white text-sm">
                  {SERVICE_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Preço base (MT)</span>
                <input type="number" min={200} step={50} required value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Ex.: 1500" className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] font-mono text-sm tabular-nums" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Província</span>
                <select value={province} onChange={(event) => setProvince(event.target.value as ProvinceName)} className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] bg-white text-sm">
                  {MOZAMBIQUE_PROVINCES.filter((item) => item !== 'Todas as Províncias').map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Bairro / zona</span>
                <input required value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} placeholder="Ex.: Polana Cimento" className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] text-sm" />
              </label>
            </div>

            <label className="block">
              <span className="flex justify-between gap-3 text-sm font-semibold text-[#10201B] mb-1.5">
                <span>Descrição</span><span className="text-xs font-normal text-[#718079]">{description.length}/1200</span>
              </span>
              <textarea rows={4} required minLength={10} maxLength={1200} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Explique o que está incluído, materiais, disponibilidade ou garantia." className="w-full p-3 rounded-xl border border-[#D4DDD9] text-sm outline-none focus:border-[#066E53]" />
            </label>

            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

            <button type="submit" disabled={!canPublish} className="inline-flex items-center justify-center gap-2 w-full min-h-11 px-4 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="w-4 h-4" aria-hidden="true" /> Publicar serviço
            </button>
            <p className="text-xs leading-relaxed text-[#718079]">Publicações guardadas neste navegador. A sincronização entre dispositivos requer uma API de serviços.</p>
          </form>

          <section className="space-y-4" aria-labelledby="my-services-title">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="section-kicker mb-2">Gestão</p>
                <h2 id="my-services-title" className="font-display text-xl font-bold text-[#162820]">Os meus anúncios</h2>
              </div>
            </div>
            {ownServices.length === 0 ? (
              <div className="bg-[#F6F7F5] border border-dashed border-[#B8C4BE] rounded-2xl p-8 text-center">
                <p className="font-semibold text-[#10201B]">Ainda não publicou serviços</p>
                <p className="mt-1 text-sm text-[#52635D]">O seu primeiro anúncio aparecerá aqui e na vitrine dos clientes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ownServices.map((service) => (
                  <ServiceCard key={service.id} service={service} management onToggleStatus={onToggleStatus} onDelete={onDelete} onRequestService={onRequestService} />
                ))}
              </div>
            )}
          </section>
        </section>
      )}

      {isProvider && !currentProvider && (
        <div className="rounded-xl border border-[#F0D0C9] bg-[#FFF5F2] p-5 text-sm text-[#8F3022]" role="alert">
          O perfil de prestador desta conta ainda não está disponível para publicar serviços.
        </div>
      )}

      {!isProvider && (
        visibleServices.length === 0 ? (
          <div className="bg-white border border-[#D5D9D3] rounded-2xl p-10 text-center">
            <p className="font-display text-lg font-bold text-[#10201B]">Ainda não há serviços publicados</p>
            <p className="mt-2 text-sm text-[#52635D]">Pode explorar os profissionais ou publicar um pedido para receber propostas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visibleServices.map((service) => (
              <ServiceCard key={service.id} service={service} onToggleStatus={onToggleStatus} onDelete={onDelete} onRequestService={onRequestService} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function ServiceCard({
  service,
  management = false,
  onToggleStatus,
  onDelete,
  onRequestService,
}: {
  service: ProviderServiceListing;
  management?: boolean;
  onToggleStatus: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
  onRequestService: (service: ProviderServiceListing) => void;
}) {
  const categoryLabel = SERVICE_CATEGORIES.find((item) => item.id === service.category)?.shortLabel ?? service.category;
  return (
    <article className="bg-white border border-[#D5D9D3] rounded-2xl p-5 flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex rounded-lg bg-[#EAF5F1] px-2.5 py-1 text-xs font-semibold text-[#066E53]">{categoryLabel}</span>
            <h3 className="mt-2 font-display text-lg font-bold leading-snug text-[#10201B]">{service.title}</h3>
          </div>
          {management && (
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${service.status === 'active' ? 'bg-[#EAF5F1] text-[#066E53]' : 'bg-[#F1F2F0] text-[#52635D]'}`}>
              {service.status === 'active' ? 'Publicado' : 'Pausado'}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-[#52635D]">{service.description}</p>
        <p className="flex items-center gap-1.5 text-xs text-[#52635D]">
          <MapPin className="w-3.5 h-3.5 text-[#066E53]" aria-hidden="true" /> {service.neighborhood} · {service.province}
        </p>
      </div>

      <div className="border-t border-[#E1E7E4] pt-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#718079]">Preço base</p>
            <p className="font-mono text-lg font-bold text-[#10201B] tabular-nums">{formatMT(service.priceMT)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#718079]">Prestador</p>
            <p className="text-sm font-semibold text-[#10201B]">{service.providerName}</p>
          </div>
        </div>
        {management ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onToggleStatus(service.id)} className="inline-flex items-center justify-center gap-1.5 min-h-10 rounded-xl border border-[#D4DDD9] px-2 text-xs font-semibold text-[#10201B] hover:bg-[#F6F7F5] cursor-pointer">
              {service.status === 'active' ? <CirclePause className="w-4 h-4" aria-hidden="true" /> : <Play className="w-4 h-4" aria-hidden="true" />}
              {service.status === 'active' ? 'Pausar' : 'Reactivar'}
            </button>
            <button type="button" onClick={() => onDelete(service.id)} className="inline-flex items-center justify-center gap-1.5 min-h-10 rounded-xl border border-[#F0D0C9] px-2 text-xs font-semibold text-[#A53827] hover:bg-[#FFF5F2] cursor-pointer">
              <Trash2 className="w-4 h-4" aria-hidden="true" /> Remover
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => onRequestService(service)} className="inline-flex items-center justify-center gap-2 w-full min-h-11 rounded-xl bg-[#066E53] px-4 text-sm font-semibold text-white hover:bg-[#055741] cursor-pointer">
            <Send className="w-4 h-4" aria-hidden="true" /> Pedir este serviço
          </button>
        )}
      </div>
    </article>
  );
}
