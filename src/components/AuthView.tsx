import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getErrorMessage } from '../api/client';
import { catalogApi } from '../api/endpoints';
import type { ApiCategory, ApiProvince, RegisterBody } from '../api/types';
import { useSession } from '../session/SessionContext';

type AuthMode = 'login' | 'register';
type RegisterRole = 'client' | 'provider';

interface AuthViewProps {
  initialMode?: AuthMode;
  initialRole?: RegisterRole;
  onAuthenticated: () => void;
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

function buildRegisterBody(form: FormState, role: RegisterRole): RegisterBody | string {
  if (!PASSWORD_PATTERN.test(form.password)) return PASSWORD_MESSAGE;

  const phone = form.phone.trim();
  const common = {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    password: form.password,
    ...(phone ? { phone } : {}),
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

export function AuthView({ initialMode = 'login', initialRole = 'client', onAuthenticated }: AuthViewProps) {
  const { login, register } = useSession();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<RegisterRole>(initialRole);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isProviderRegistration = mode === 'register' && role === 'provider';

  useEffect(() => {
    if (!isProviderRegistration || catalog) return;
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
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (mode === 'register') {
      const body = buildRegisterBody(form, role);
      if (typeof body === 'string') {
        setError(body);
        return;
      }
      setSubmitting(true);
      try {
        await register(body);
        onAuthenticated();
      } catch (caught) {
        setError(getErrorMessage(caught));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      onAuthenticated();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer ${
      active ? 'bg-[#066E53] text-white' : 'bg-white text-[#52635D] border border-[#E1E7E4]'
    }`;

  return (
    <section className="max-w-md mx-auto bg-white border border-[#E1E7E4] rounded-2xl p-6 shadow-sm">
      <div className="flex gap-2 mb-5">
        <button type="button" onClick={() => switchMode('login')} className={tabClass(mode === 'login')}>
          Entrar
        </button>
        <button type="button" onClick={() => switchMode('register')} className={tabClass(mode === 'register')}>
          Criar conta
        </button>
      </div>

      {mode === 'register' && (
        <div className="flex gap-2 mb-4">
          <button type="button" onClick={() => setRole('client')} className={tabClass(role === 'client')}>
            Sou Cliente
          </button>
          <button type="button" onClick={() => setRole('provider')} className={tabClass(role === 'provider')}>
            Sou Prestador
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <Field label="Nome completo" value={form.fullName} onChange={updateField('fullName')} autoComplete="name" />
        )}
        <Field label="Email" type="email" value={form.email} onChange={updateField('email')} autoComplete="email" />
        <Field
          label="Palavra-passe"
          type="password"
          value={form.password}
          onChange={updateField('password')}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {mode === 'register' && (
          <Field
            label="Telemóvel (opcional)"
            type="tel"
            value={form.phone}
            onChange={updateField('phone')}
            autoComplete="tel"
            required={false}
          />
        )}

        {isProviderRegistration && (
          <>
            <Field label="Especialidade" value={form.specialty} onChange={updateField('specialty')} />
            <SelectField
              label="Categoria"
              value={form.category}
              onChange={updateField('category')}
              options={(catalog?.categories ?? []).map((category) => ({
                value: category.id,
                label: category.label,
              }))}
            />
            <SelectField
              label="Província"
              value={form.province}
              onChange={updateField('province')}
              options={(catalog?.provinces ?? []).map((province) => ({
                value: province.name,
                label: province.name,
              }))}
            />
            <Field label="Bairro" value={form.neighborhood} onChange={updateField('neighborhood')} />
            <Field
              label="Anos de experiência"
              type="number"
              value={form.yearsExperience}
              onChange={updateField('yearsExperience')}
            />
            <Field label="Valor base (MT)" type="number" value={form.baseRateMT} onChange={updateField('baseRateMT')} />
            <label className="block">
              <span className="block text-xs font-semibold text-[#10201B] mb-1">Apresentação</span>
              <textarea
                value={form.bio}
                required
                rows={3}
                onChange={(event) => updateField('bio')(event.target.value)}
                className={INPUT_CLASS}
              />
            </label>
          </>
        )}

        {error && (
          <p role="alert" className="text-xs font-medium text-red-700 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#066E53] text-white text-sm font-semibold py-2.5 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'A processar...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
    </section>
  );
}
