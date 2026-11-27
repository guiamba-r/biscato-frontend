import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getErrorMessage } from '../api/client';
import { catalogApi } from '../api/endpoints';
import type { ApiAuthUser, ApiCategory, ApiProvince, RegisterBody } from '../api/types';
import { useSession } from '../session/SessionContext';
import { MOZAMBIQUE_PROVINCES, SERVICE_CATEGORIES } from '../data/biscatoData';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, UserRound } from 'lucide-react';

type AuthMode = 'login' | 'register';
type RegisterRole = 'client' | 'provider';

interface AuthViewProps {
  initialMode?: AuthMode;
  initialRole?: RegisterRole;
  adminOnly?: boolean;
  onAuthenticated: (user: ApiAuthUser) => void;
}

interface FormState {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  specialty: string;
  category: string;
  province: string;
  neighborhood: string;
  yearsExperience: string;
  bio: string;
  baseRateMT: string;
}

interface Catalog {
  provinces: ApiProvince[];
  categories: ApiCategory[];
}

const LOCAL_CATALOG: Catalog = {
  provinces: MOZAMBIQUE_PROVINCES
    .filter((province) => province !== 'Todas as Províncias')
    .map((name) => ({ id: name, name })),
  categories: SERVICE_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    shortLabel: category.shortLabel,
    averageRangeMinMT: 0,
    averageRangeMaxMT: 0,
  })),
};

const EMPTY_FORM: FormState = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  specialty: '',
  category: '',
  province: '',
  neighborhood: '',
  yearsExperience: '',
  bio: '',
  baseRateMT: '',
};

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PASSWORD_MESSAGE = 'A palavra-passe deve ter pelo menos 8 caracteres, com letras e números.';
const INPUT_CLASS =
  'w-full rounded-xl border border-[#E1E7E4] bg-white px-3 py-2 text-sm text-[#10201B] focus:outline-none focus:ring-2 focus:ring-[#066E53]';

function GoogleMark({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M48 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h13.48c-.6 3.2-2.39 5.91-5.09 7.74v6.32h8.24C45.45 38.84 48 32.12 48 24.55Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.15 15.9-5.82l-8.24-6.32c-2.15 1.45-4.89 2.3-7.66 2.3-5.9 0-10.9-3.98-12.7-9.33H2.79v6.52C6.75 42.9 14.7 48 24 48Z" />
      <path fill="#FBBC05" d="M11.3 28.83a14.4 14.4 0 0 1 0-9.66v-6.52H2.79a24 24 0 0 0 0 22.7l8.51-6.52Z" />
      <path fill="#EA4335" d="M24 9.5c3.53 0 6.7 1.21 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.7 0 6.75 5.1 2.79 12.65l8.51 6.52C13.1 13.48 18.1 9.5 24 9.5Z" />
    </svg>
  );
}

function AppleMark({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 384 512" aria-hidden="true">
      <path fill="currentColor" d="M318.7 268.7c-.2-36.7 30-54.3 31.4-55.2-17.1-25-43.7-28.4-53.2-28.8-22.6-2.3-44.1 13.3-55.5 13.3-11.7 0-29-13.1-48-12.7-24.6.4-47.7 14.3-60.3 36.1-25.7 44.5-6.5 110.1 18.2 146.2 12 17.6 26.1 37.3 44.9 36.6 18.2-.7 25-11.8 46.9-11.8 21.7 0 28.1 11.8 47.1 11.4 19.6-.3 31.8-17.7 43.4-35.5 13.9-20.1 19.5-39.9 19.7-40.9-.5-.2-37.9-14.4-38.6-57.7ZM281.3 160.8c10.1-12.1 17-28.5 15.1-45.1-14.6.7-32.8 10.2-43.2 22.1-9.1 10.5-17.2 27.5-15.1 43.5 16.3 1.2 32.9-8.2 43.2-20.5Z" />
    </svg>
  );
}

function buildRegisterBody(form: FormState, role: RegisterRole): RegisterBody | string {
  if (!PASSWORD_PATTERN.test(form.password)) return PASSWORD_MESSAGE;

  const rawPhone = form.phone.replace(/[^0-9+]/g, '').trim();
  const phone =
    rawPhone.startsWith('+258')
      ? rawPhone
      : rawPhone.startsWith('258')
      ? `+${rawPhone}`
      : rawPhone
      ? `+258${rawPhone.replace(/^0/, '')}`
      : '';

  if (!/^\+2588[2-7][0-9]{7}$/.test(phone)) {
    return 'Introduza um número moçambicano válido, por exemplo +258 84 123 4567.';
  }

  const common = {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    password: form.password,
    phone,
  };

  if (role === 'client') return { ...common, role: 'client' };

  const yearsExperience = Number(form.yearsExperience);
  const baseRateMT = Number(form.baseRateMT);
  if (form.yearsExperience.trim() === '' || !Number.isInteger(yearsExperience) || yearsExperience < 0) {
    return 'Indique os anos de experiência.';
  }
  if (!Number.isFinite(baseRateMT) || baseRateMT <= 0) {
    return 'Indique o valor base em MT.';
  }

  return {
    ...common,
    role: 'provider',
    specialty: form.specialty.trim(),
    category: form.category,
    province: form.province,
    neighborhood: form.neighborhood.trim(),
    yearsExperience,
    bio: form.bio.trim(),
    baseRateMT,
  };
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}

function Field({ label, value, onChange, type = 'text', autoComplete, required = true }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[#10201B] mb-1">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
      />
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[#10201B] mb-1">{label}</span>
      <select
        value={value}
        required
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
      >
        <option value="">Seleccione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AuthView({ initialMode = 'login', initialRole = 'client', adminOnly = false, onAuthenticated }: AuthViewProps) {
  const { login, register, startDemoSession } = useSession();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<RegisterRole>(initialRole);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  const isProviderRegistration = mode === 'register' && role === 'provider';

  useEffect(() => {
    if (!isProviderRegistration || catalog) return;
    if (import.meta.env.DEV) {
      setCatalog(LOCAL_CATALOG);
      return;
    }
    const controller = new AbortController();
    Promise.all([catalogApi.provinces(controller.signal), catalogApi.categories(controller.signal)])
      .then(([provinces, categories]) => setCatalog({ provinces, categories }))
      .catch((caught) => {
        if (!controller.signal.aborted) setError(getErrorMessage(caught));
      });
    return () => controller.abort();
  }, [isProviderRegistration, catalog]);

  function updateField(field: keyof FormState) {
    return (value: string) => setForm((current) => ({ ...current, [field]: value }));
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setRegisterStep(1);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (registerStep === 1) {
        setRegisterStep(2);
        setError(null);
        return;
      }

      const body = buildRegisterBody(form, role);
      if (typeof body === 'string') {
        setError(body);
        return;
      }
      setSubmitting(true);
      try {
        const user = await register(body);
        onAuthenticated(user);
      } catch (caught) {
        setError(getErrorMessage(caught));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (adminOnly && import.meta.env.DEV) {
      const adminCredentialsMatch = form.email.trim().toLowerCase() === 'admin@biscato.local' && form.password === 'BiscatoAdmin2026!';
      if (adminCredentialsMatch) {
        onAuthenticated(startDemoSession('admin'));
        return;
      }
    }

    setSubmitting(true);
    try {
      const user = await login({ email: form.email.trim(), password: form.password });
      onAuthenticated(user);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  function handleSocialLogin(provider: 'Google' | 'Facebook' | 'Apple') {
    setError(`O início de sessão com ${provider} será ativado assim que a integração estiver disponível.`);
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer ${
      active ? 'bg-[#066E53] text-white' : 'bg-white text-[#52635D] border border-[#E1E7E4]'
    }`;

  return (
    <section className="max-w-md mx-auto bg-white border border-[#DCE3DF] rounded-[10px] p-6 shadow-none">
      {adminOnly ? (
        <div className="mb-5 rounded-xl border border-[#C9E3D8] bg-[#E7F3EE] p-4">
          <p className="font-display text-lg font-bold text-[#054A38]">Acesso de operação</p>
          <p className="mt-1 text-xs leading-relaxed text-[#245B48]">Entre com uma conta de operador autorizada. O registo público não cria acesso administrativo.</p>
        </div>
      ) : <div className="flex gap-2 mb-5" aria-label="Escolher entre entrar ou criar conta">
        <button type="button" onClick={() => switchMode('login')} className={tabClass(mode === 'login')}>
          Entrar
        </button>
        <button type="button" onClick={() => switchMode('register')} className={tabClass(mode === 'register')}>
          Criar conta
        </button>
      </div>}

      {mode === 'register' && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2" aria-label={`Etapa ${registerStep} de 2`}>
            <p className="text-xs font-semibold text-[#52635D]">Etapa {registerStep} de 2</p>
            <p className="text-xs text-[#718079]">{registerStep === 1 ? 'Conta' : 'Dados finais'}</p>
          </div>
          <div className="h-1.5 rounded-full bg-[#EDF1EF] overflow-hidden">
            <div className="h-full rounded-full bg-[#066E53] transition-all duration-300" style={{ width: registerStep === 1 ? '50%' : '100%' }} />
          </div>
        </div>
      )}

      {import.meta.env.DEV && (
        <aside className="mb-5 rounded-xl border border-[#F4C47D] bg-[#FFF8EA] p-4" aria-label="Sessões de demonstração">
          <p className="text-sm font-semibold text-[#6B4811]">{adminOnly ? 'Acesso admin fictício para desenvolvimento' : 'Testar sem backend ou criar conta'}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#6B4811]">
            {adminOnly ? 'Disponível apenas no modo de desenvolvimento. Não é uma conta real e não deve ser usada em produção.' : 'O login e o registo reais precisam da API activa. Para testar as telas agora, use um perfil demo; os dados ficam só enquanto esta página estiver aberta.'}
          </p>
          {adminOnly ? (
            <button type="button" onClick={() => onAuthenticated(startDemoSession('admin'))} className="mt-3 min-h-11 w-full rounded-xl border border-[#066E53] bg-white px-3 py-2 text-sm font-semibold text-[#055741] hover:bg-[#EAF5F1] cursor-pointer">Entrar como Admin Demo</button>
          ) : <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onAuthenticated(startDemoSession('client'))}
              className="min-h-11 rounded-xl border border-[#066E53] bg-[#EAF5F1] px-3 py-2 text-sm font-semibold text-[#055741] hover:bg-[#DDF0E8] cursor-pointer"
            >
              Entrar como Cliente Demo
            </button>
            <button
              type="button"
              onClick={() => onAuthenticated(startDemoSession('provider'))}
              className="min-h-11 rounded-xl border border-[#066E53] bg-white px-3 py-2 text-sm font-semibold text-[#055741] hover:bg-[#F6F8F6] cursor-pointer"
            >
              Entrar como Prestador Demo
            </button>
          </div>}
        </aside>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && registerStep === 1 && (
          <>
            <div>
              <p className="font-display text-lg font-bold text-[#10201B]">Como pretende usar o Biscato?</p>
              <p className="mt-1 text-sm text-[#52635D]">Escolha o perfil principal da sua conta.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('client')}
                aria-pressed={role === 'client'}
                className={`min-h-[104px] rounded-xl border p-3 text-left transition-colors cursor-pointer ${role === 'client' ? 'border-[#066E53] bg-[#EAF5F1] ring-1 ring-[#066E53]' : 'border-[#D4DDD9] hover:border-[#9FB1A9]'}`}
              >
                <UserRound className="w-5 h-5 text-[#066E53] mb-2" aria-hidden="true" />
                <span className="block text-sm font-semibold text-[#10201B]">Sou Cliente</span>
                <span className="block mt-1 text-xs text-[#52635D]">Quero pedir serviços</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                aria-pressed={role === 'provider'}
                className={`min-h-[104px] rounded-xl border p-3 text-left transition-colors cursor-pointer ${role === 'provider' ? 'border-[#066E53] bg-[#EAF5F1] ring-1 ring-[#066E53]' : 'border-[#D4DDD9] hover:border-[#9FB1A9]'}`}
              >
                <BriefcaseBusiness className="w-5 h-5 text-[#066E53] mb-2" aria-hidden="true" />
                <span className="block text-sm font-semibold text-[#10201B]">Sou Prestador</span>
                <span className="block mt-1 text-xs text-[#52635D]">Quero oferecer serviços</span>
              </button>
            </div>

            <Field label="Nome completo" value={form.fullName} onChange={updateField('fullName')} autoComplete="name" />
            <Field
              label="Telemóvel moçambicano (+258)"
              type="tel"
              value={form.phone}
              onChange={updateField('phone')}
              autoComplete="tel"
              required
            />
          </>
        )}

        {mode === 'login' && !adminOnly && (
          <>
            <div>
              <p className="font-display text-lg font-bold text-[#10201B]">Bem-vindo de volta</p>
              <p className="mt-1 text-sm text-[#52635D]">Entre para continuar.</p>
            </div>
            <Field label="Email" type="email" value={form.email} onChange={updateField('email')} autoComplete="email" />
            <Field
              label="Palavra-passe"
              type="password"
              value={form.password}
              onChange={updateField('password')}
              autoComplete="current-password"
            />
          </>
        )}

        {mode === 'register' && registerStep === 2 && (
          <>
            <div>
              <p className="font-display text-lg font-bold text-[#10201B]">Segurança e {role === 'provider' ? 'perfil profissional' : 'acesso'}</p>
              <p className="mt-1 text-sm text-[#52635D]">Preencha apenas os dados necessários para começar.</p>
            </div>
            <Field label="Email" type="email" value={form.email} onChange={updateField('email')} autoComplete="email" />
            <Field
              label="Palavra-passe"
              type="password"
              value={form.password}
              onChange={updateField('password')}
              autoComplete="new-password"
            />

            {isProviderRegistration && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Especialidade" value={form.specialty} onChange={updateField('specialty')} />
                <SelectField
                  label="Categoria"
                  value={form.category}
                  onChange={updateField('category')}
                  options={(catalog?.categories ?? []).map((category) => ({ value: category.id, label: category.label }))}
                />
                <SelectField
                  label="Província"
                  value={form.province}
                  onChange={updateField('province')}
                  options={(catalog?.provinces ?? []).map((province) => ({ value: province.name, label: province.name }))}
                />
                <Field label="Bairro" value={form.neighborhood} onChange={updateField('neighborhood')} />
                <Field label="Anos de experiência" type="number" value={form.yearsExperience} onChange={updateField('yearsExperience')} />
                <Field label="Valor base (MT)" type="number" value={form.baseRateMT} onChange={updateField('baseRateMT')} />
                <label className="block sm:col-span-2">
                  <span className="block text-xs font-semibold text-[#10201B] mb-1">Apresentação</span>
                  <textarea
                    value={form.bio}
                    required
                    rows={3}
                    onChange={(event) => updateField('bio')(event.target.value)}
                    className={INPUT_CLASS}
                  />
                </label>
              </div>
            )}
          </>
        )}

        {error && (
          <p role="alert" className="text-xs font-medium text-red-700 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {mode === 'register' && registerStep === 2 ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRegisterStep(1)}
              className="h-11 w-11 shrink-0 rounded-xl border border-[#D4DDD9] text-[#52635D] flex items-center justify-center cursor-pointer"
              aria-label="Voltar à etapa anterior"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 flex-1 rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'A processar...' : 'Criar conta'}
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-xl bg-[#066E53] hover:bg-[#055741] text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
          >
            {mode === 'login'
              ? (submitting ? 'A entrar...' : 'Entrar')
              : <span className="inline-flex items-center justify-center gap-2">Continuar <ArrowRight className="w-4 h-4" aria-hidden="true" /></span>}
          </button>
        )}

        {mode === 'login' && (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Google', icon: <GoogleMark className="h-4 w-4" /> },
                { label: 'Facebook', icon: <span className="text-base font-bold text-[#1877F2]">f</span> },
                { label: 'Apple', icon: <AppleMark className="h-4 w-4" /> },
              ].map((provider) => (
                <button
                  key={provider.label}
                  type="button"
                  onClick={() => handleSocialLogin(provider.label as 'Google' | 'Facebook' | 'Apple')}
                  className="h-11 rounded-lg border border-[#CAD3CE] bg-white text-xs font-bold text-[#10201B] hover:border-[#066E53] hover:bg-[#F6F8F6] transition-colors cursor-pointer"
                  aria-label={`Continuar com ${provider.label}`}
                >
                  <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center" aria-hidden="true">{provider.icon}</span>
                  {provider.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-[#DCE3DF]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#718079]">ou</span>
              <span className="h-px flex-1 bg-[#DCE3DF]" />
            </div>
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="w-full h-11 rounded-xl border border-[#D4DDD9] text-[#52635D] flex items-center justify-center gap-2 transition-colors hover:border-[#9FB1A9]"
              aria-label="Iniciar sessão com o Google"
            >
              <GoogleMark />
              Iniciar sessão com o Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Facebook')}
              className="mt-2 w-full h-11 rounded-xl border border-[#D4DDD9] text-[#52635D] flex items-center justify-center gap-2 transition-colors hover:border-[#9FB1A9]"
              aria-label="Iniciar sessão com o Facebook"
            >
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path
                  fill="#1877F2"
                  d="M24 0C10.745 0 0 10.745 0 24c0 11.673 8.388 21.354 19.25 23.485v-16.6H13.5v-6.885h5.75V18.1c0-5.684 2.957-8.85 8.1-8.85 2.344 0 4.84.438 4.84.438v5.344h-2.725c-2.688 0-3.515 1.67-3.515 3.385v4.012h6.25l-.875 6.885h-5.375v16.6C39.612 45.354 48 35.673 48 24c0-13.255-10.745-24-24-24z"
                />
              </svg>
              Iniciar sessão com o Facebook
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Apple')}
              className="mt-2 w-full h-11 rounded-xl border border-[#D4DDD9] text-[#52635D] flex items-center justify-center gap-2 transition-colors hover:border-[#9FB1A9]"
              aria-label="Iniciar sessão com a Apple"
            >
              <AppleMark />
              Iniciar sessão com a Apple
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
