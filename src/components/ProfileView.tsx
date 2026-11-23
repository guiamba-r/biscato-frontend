import { useEffect, useState } from 'react';
import { UserRound, Wrench } from 'lucide-react';
import type { ApiAuthUser, UpdateProviderProfileBody } from '../api/types';
import { MOZAMBIQUE_PROVINCES, SERVICE_CATEGORIES } from '../data/biscatoData';
import type { ProviderProfile, ProvinceName, ServiceCategoryId } from '../types/biscato';

interface ProfileViewProps {
  user: ApiAuthUser;
  currentProvider: ProviderProfile | null;
  isDemoSession: boolean;
  onSaveAccount: (fullName: string, phone: string) => void;
  onSaveProvider: (updates: UpdateProviderProfileBody) => Promise<boolean>;
}

export function ProfileView({ user, currentProvider, isDemoSession, onSaveAccount, onSaveProvider }: ProfileViewProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [specialty, setSpecialty] = useState(currentProvider?.specialty ?? '');
  const [category, setCategory] = useState<Exclude<ServiceCategoryId, 'all'>>(currentProvider?.category ?? 'canalizacao');
  const [province, setProvince] = useState<ProvinceName>(currentProvider?.province ?? 'Cidade de Maputo');
  const [neighborhood, setNeighborhood] = useState(currentProvider?.neighborhood ?? '');
  const [yearsExperience, setYearsExperience] = useState(String(currentProvider?.yearsExperience ?? 0));
  const [bio, setBio] = useState(currentProvider?.bio ?? '');
  const [baseRate, setBaseRate] = useState(String(currentProvider?.hourlyOrBaseMT ?? 0));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isProvider = user.role === 'provider';

  useEffect(() => {
    setFullName(user.fullName);
    setPhone(user.phone ?? '');
    if (!currentProvider) return;
    setSpecialty(currentProvider.specialty);
    setCategory(currentProvider.category);
    setProvince(currentProvider.province);
    setNeighborhood(currentProvider.neighborhood);
    setYearsExperience(String(currentProvider.yearsExperience));
    setBio(currentProvider.bio);
    setBaseRate(String(currentProvider.hourlyOrBaseMT));
  }, [user.id, user.fullName, user.phone, currentProvider?.id, currentProvider?.specialty, currentProvider?.category, currentProvider?.province, currentProvider?.neighborhood, currentProvider?.yearsExperience, currentProvider?.bio, currentProvider?.hourlyOrBaseMT]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (fullName.trim().length < 2) {
      setError('Indique o seu nome completo.');
      return;
    }
    if (isProvider && !currentProvider) {
      setError('O perfil profissional ainda não está disponível.');
      return;
    }
    const years = Number(yearsExperience);
    const rate = Number(baseRate);
    if (isProvider && (!Number.isInteger(years) || years < 0 || !Number.isFinite(rate) || rate <= 0 || !specialty.trim() || !neighborhood.trim() || bio.trim().length < 10)) {
      setError('Verifique especialidade, bairro, anos de experiência, preço base e apresentação.');
      return;
    }

    setIsSaving(true);
    try {
      if (isProvider) {
        const saved = await onSaveProvider({
          specialty: specialty.trim(),
          category,
          province,
          neighborhood: neighborhood.trim(),
          yearsExperience: years,
          bio: bio.trim(),
          hourlyOrBaseMT: rate,
        });
        if (!saved) return;
      }
      onSaveAccount(fullName.trim(), phone.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      <header className="editorial-rule pt-6">
        <p className="section-kicker mb-3">A sua conta</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#162820]">Editar perfil</h1>
        <p className="mt-2 text-sm text-[#52635D]">Actualize os seus dados e mantenha as informações do perfil corretas.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border border-[#D5D9D3] rounded-2xl p-5 sm:p-7 space-y-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E1E7E4] pb-3">
            <UserRound className="w-4 h-4 text-[#066E53]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-[#10201B]">Dados da conta</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Nome completo</span>
              <input required minLength={2} maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] text-sm" />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Telemóvel</span>
              <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+258…" className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] text-sm" />
            </label>
          </div>
          <label className="block">
            <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Email</span>
            <input type="email" readOnly value={user.email} className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] bg-[#F6F7F5] text-sm text-[#52635D]" />
          </label>
        </section>

        {isProvider && currentProvider && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E1E7E4] pb-3">
              <Wrench className="w-4 h-4 text-[#066E53]" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-[#10201B]">Perfil profissional</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Especialidade</span>
                <input required value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] text-sm" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Categoria</span>
                <select value={category} onChange={(event) => setCategory(event.target.value as Exclude<ServiceCategoryId, 'all'>)} className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] bg-white text-sm">
                  {SERVICE_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Província</span>
                <select value={province} onChange={(event) => setProvince(event.target.value as ProvinceName)} className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] bg-white text-sm">
                  {MOZAMBIQUE_PROVINCES.filter((item) => item !== 'Todas as Províncias').map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Bairro</span>
                <input required value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] text-sm" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Anos de experiência</span>
                <input type="number" min={0} step={1} required value={yearsExperience} onChange={(event) => setYearsExperience(event.target.value)} className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] font-mono text-sm" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Preço base (MT)</span>
                <input type="number" min={1} step={50} required value={baseRate} onChange={(event) => setBaseRate(event.target.value)} className="w-full h-11 px-3 rounded-xl border border-[#D4DDD9] font-mono text-sm" />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-semibold text-[#10201B] mb-1.5">Apresentação profissional</span>
              <textarea rows={4} minLength={10} maxLength={1200} required value={bio} onChange={(event) => setBio(event.target.value)} className="w-full p-3 rounded-xl border border-[#D4DDD9] text-sm" />
            </label>
          </section>
        )}

        {isProvider && !currentProvider && <p role="alert" className="text-sm text-red-700">Não foi possível carregar o perfil profissional desta conta.</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

        <div className="space-y-3 border-t border-[#E1E7E4] pt-4">
          {isDemoSession || user.role === 'client' ? (
            <p className="text-xs leading-relaxed text-[#718079]">Os dados da conta são guardados neste navegador. A API ainda não tem uma rota para actualizar nome e telemóvel.</p>
          ) : (
            <p className="text-xs leading-relaxed text-[#718079]">Os dados do perfil profissional são actualizados na API. Nome e telemóvel continuam guardados localmente neste frontend.</p>
          )}
          <button type="submit" disabled={isSaving || (isProvider && !currentProvider)} className="min-h-11 w-full rounded-xl bg-[#066E53] px-4 text-sm font-semibold text-white hover:bg-[#055741] disabled:opacity-50 cursor-pointer">
            {isSaving ? 'A guardar…' : 'Guardar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
