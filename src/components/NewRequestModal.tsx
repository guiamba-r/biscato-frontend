import { useEffect, useState } from 'react';
import { MapPin, ShieldCheck, X } from 'lucide-react';
import { MOZAMBIQUE_PROVINCES, SERVICE_CATEGORIES } from '../data/biscatoData';
import type { GeoCoordinates, ProvinceName, ServiceCategoryId, ServiceRequest } from '../types/biscato';

interface NewRequestModalProps {
  isOpen: boolean;
  initialCategory?: Exclude<ServiceCategoryId, 'all'>;
  targetProviderName?: string;
  clientCoordinates: GeoCoordinates | null;
  onRequestLocation: () => void;
  onClose: () => void;
  onCreateRequest: (request: Omit<ServiceRequest, 'id' | 'status' | 'publishedLabel' | 'distanceKm' | 'clientVerified'>) => Promise<boolean>;
}

const REQUEST_DRAFT_KEY = 'biscato.request-draft.v1';

export function NewRequestModal({
  isOpen,
  initialCategory = 'canalizacao',
  targetProviderName,
  clientCoordinates,
  onRequestLocation,
  onClose,
  onCreateRequest,
}: NewRequestModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<ServiceCategoryId, 'all'>>(initialCategory);
  const [province, setProvince] = useState<ProvinceName>('Cidade de Maputo');
  const [neighborhood, setNeighborhood] = useState('Polana Cimento');
  const [urgency, setUrgency] = useState<'Urgente' | 'Esta semana' | 'Flexível'>('Urgente');
  const [budgetMinMT, setBudgetMinMT] = useState('2500');
  const [budgetMaxMT, setBudgetMaxMT] = useState('4500');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCategory(initialCategory);
    try {
      const savedDraft = window.localStorage.getItem(REQUEST_DRAFT_KEY);
      if (!savedDraft) return;
      const draft = JSON.parse(savedDraft) as Partial<{
        title: string;
        category: Exclude<ServiceCategoryId, 'all'>;
        province: ProvinceName;
        neighborhood: string;
        urgency: 'Urgente' | 'Esta semana' | 'Flexível';
        budgetMinMT: string;
        budgetMaxMT: string;
        description: string;
      }>;
      if (draft.title) setTitle(draft.title);
      if (draft.category) setCategory(draft.category);
      if (draft.province) setProvince(draft.province);
      if (draft.neighborhood) setNeighborhood(draft.neighborhood);
      if (draft.urgency) setUrgency(draft.urgency);
      if (draft.budgetMinMT) setBudgetMinMT(draft.budgetMinMT);
      if (draft.budgetMaxMT) setBudgetMaxMT(draft.budgetMaxMT);
      if (draft.description) setDescription(draft.description);
    } catch {
      window.localStorage.removeItem(REQUEST_DRAFT_KEY);
    }
  }, [isOpen, initialCategory]);

  useEffect(() => {
    if (!isOpen) return;
    window.localStorage.setItem(REQUEST_DRAFT_KEY, JSON.stringify({
      title, category, province, neighborhood, urgency, budgetMinMT, budgetMaxMT, description,
    }));
  }, [isOpen, title, category, province, neighborhood, urgency, budgetMinMT, budgetMaxMT, description]);

  useEffect(() => {
    if (clientCoordinates) {
      setFieldErrors((previous) => {
        const remaining = { ...previous };
        delete remaining.location;
        return remaining;
      });
    }
  }, [clientCoordinates]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    const minVal = Number(budgetMinMT);
    const maxVal = Number(budgetMaxMT);

    if (title.trim().length < 5) nextErrors.title = 'O título deve ter pelo menos 5 caracteres.';
    if (!clientCoordinates) nextErrors.location = 'Partilhe a localização para limitar o pedido a prestadores até 10 km.';
    if (description.trim().length < 10) nextErrors.description = 'Descreva o trabalho com pelo menos 10 caracteres.';
    if (description.trim().length > 2000) nextErrors.description = 'A descrição não pode ultrapassar 2000 caracteres.';
    if (!Number.isFinite(minVal) || minVal < 300) nextErrors.budgetMinMT = 'O orçamento mínimo é de 300 MT.';
    if (!Number.isFinite(maxVal) || maxVal < 300) nextErrors.budgetMaxMT = 'O orçamento mínimo é de 300 MT.';
    if (Number.isFinite(minVal) && Number.isFinite(maxVal) && maxVal < minVal) {
      nextErrors.budgetMaxMT = 'O orçamento máximo deve ser igual ou maior que o mínimo.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    let created = false;
    try {
      created = await onCreateRequest({
        title: title.trim(),
        category,
        province,
        neighborhood: neighborhood.trim() || 'Centro',
        urgency,
        budgetMinMT: minVal,
        budgetMaxMT: maxVal,
        description: description.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
    if (!created) return;
    window.localStorage.removeItem(REQUEST_DRAFT_KEY);
    setTitle('');
    setDescription('');
    setFieldErrors({});
    onClose();
  };

  const renderError = (field: string) => fieldErrors[field] ? (
    <p className="mt-1 text-xs font-medium text-[#B42318]" role="alert">{fieldErrors[field]}</p>
  ) : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-request-title"
    >
      <div className="bg-white rounded-3xl border border-[#E1E7E4] w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl my-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#066E53]">
              {targetProviderName
                ? `Pedido direto para ${targetProviderName}`
                : 'Publicar uma única vez · Receber múltiplas propostas'}
            </p>
            <h2 id="new-request-title" className="font-display text-xl font-bold text-[#10201B] mt-0.5">
              Pedir Orçamento
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#52635D] hover:bg-[#F6F7F5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2 rounded-xl border border-[#C9E3D8] bg-[#E7F3EE] p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-[#245B48]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {clientCoordinates ? 'Localização partilhada. O frontend mostra prestadores com localização confirmada até 10 km.' : 'A localização é necessária para limitar prestadores a um raio máximo de 10 km.'}
            </p>
            {!clientCoordinates && <button type="button" onClick={onRequestLocation} className="min-h-9 shrink-0 rounded-lg bg-[#066E53] px-3 text-xs font-semibold text-white">Partilhar localização</button>}
          </div>
          {renderError('location')}
          <div>
            <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
              O que precisa de resolver?
            </label>
            <input
              type="text"
              maxLength={120}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Substituir torneira e reparar infiltração na cozinha"
              className="w-full h-11 px-3.5 rounded-xl border border-[#D4DDD9] text-sm text-[#10201B] outline-none focus:border-[#066E53]"
            />
            {renderError('title')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<ServiceCategoryId, 'all'>)}
                className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] bg-white text-sm text-[#10201B] outline-none focus:border-[#066E53]"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
                Urgência
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as 'Urgente' | 'Esta semana' | 'Flexível')}
                className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] bg-white text-sm text-[#10201B] outline-none focus:border-[#066E53]"
              >
                <option value="Urgente">Urgente (Hoje / 24h)</option>
                <option value="Esta semana">Esta semana</option>
                <option value="Flexível">Flexível</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
                Província
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value as ProvinceName)}
                className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] bg-white text-sm text-[#10201B] outline-none focus:border-[#066E53]"
              >
                {MOZAMBIQUE_PROVINCES.filter((p) => p !== 'Todas as Províncias').map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
                Bairro / Zona
              </label>
              <input
                type="text"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex: Polana Cimento, Matola..."
                className="w-full h-11 px-3.5 rounded-xl border border-[#D4DDD9] text-sm text-[#10201B] outline-none focus:border-[#066E53]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
                Orçamento mín. (MT)
              </label>
              <input
                type="number"
                min={300}
                step={100}
                required
                value={budgetMinMT}
                onChange={(e) => setBudgetMinMT(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] font-mono text-sm text-[#10201B] outline-none focus:border-[#066E53] tabular-nums"
              />
              {renderError('budgetMinMT')}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
                Orçamento máx. (MT)
              </label>
              <input
                type="number"
                min={300}
                step={100}
                required
                value={budgetMaxMT}
                onChange={(e) => setBudgetMaxMT(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] font-mono text-sm text-[#10201B] outline-none focus:border-[#066E53] tabular-nums"
              />
              {renderError('budgetMaxMT')}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#10201B]">
                Descrição do trabalho
              </label>
              <span className="text-[11px] text-[#718079] tabular-nums">{description.length}/2000</span>
            </div>
            <textarea
              rows={3}
              maxLength={2000}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva medidas, materiais já disponíveis ou horários preferenciais..."
              className="w-full p-3 rounded-xl border border-[#D4DDD9] text-sm text-[#10201B] outline-none focus:border-[#066E53]"
            />
            {renderError('description')}
          </div>

          <div className="bg-[#E7F3EE] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#054A38]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#066E53]" aria-hidden="true" />
            <span>
              Receba propostas comparáveis de técnicos verificados na sua zona e só pague em custódia quando aprovar o orçamento.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 px-4 rounded-xl border border-[#D4DDD9] text-sm font-semibold text-[#10201B] hover:bg-[#F6F7F5] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-5 rounded-xl bg-[#F4811F] hover:bg-[#DD6E0F] text-white text-sm font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {isSubmitting ? 'A publicar…' : 'Publicar e Receber Propostas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
