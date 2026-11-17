import { useEffect, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { MOZAMBIQUE_PROVINCES, SERVICE_CATEGORIES } from '../data/biscatoData';
import type { ProvinceName, ServiceCategoryId, ServiceRequest } from '../types/biscato';

interface NewRequestModalProps {
  isOpen: boolean;
  initialCategory?: Exclude<ServiceCategoryId, 'all'>;
  targetProviderName?: string;
  onClose: () => void;
  onCreateRequest: (request: Omit<ServiceRequest, 'id' | 'status' | 'publishedLabel' | 'distanceKm' | 'clientVerified'>) => void;
}

export function NewRequestModal({
  isOpen,
  initialCategory = 'canalizacao',
  targetProviderName,
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

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory);
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = Math.max(300, Number(budgetMinMT) || 2000);
    const maxVal = Math.max(minVal, Number(budgetMaxMT) || minVal + 1500);
    onCreateRequest({
      title: title.trim() || `Serviço de ${SERVICE_CATEGORIES.find((c) => c.id === category)?.label ?? 'Manutenção'}`,
      category,
      province,
      neighborhood: neighborhood.trim() || 'Centro',
      urgency,
      budgetMinMT: minVal,
      budgetMaxMT: maxVal,
      description:
        description.trim() ||
        'Necessito de orçamento detalhado com prazo de execução e garantia Biscato.',
    });
    setTitle('');
    setDescription('');
    onClose();
  };

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
          <div>
            <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
              O que precisa de resolver?
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Substituir torneira e reparar infiltração na cozinha"
              className="w-full h-11 px-3.5 rounded-xl border border-[#D4DDD9] text-sm text-[#10201B] outline-none focus:border-[#066E53]"
            />
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
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#10201B] mb-1.5">
              Descrição do trabalho
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva medidas, materiais já disponíveis ou horários preferenciais..."
              className="w-full p-3 rounded-xl border border-[#D4DDD9] text-sm text-[#10201B] outline-none focus:border-[#066E53]"
            />
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
              className="h-11 px-4 rounded-xl border border-[#D4DDD9] text-sm font-semibold text-[#10201B] hover:bg-[#F6F7F5] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-[#F4811F] hover:bg-[#DD6E0F] text-white text-sm font-semibold cursor-pointer"
            >
              Publicar e Receber Propostas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
