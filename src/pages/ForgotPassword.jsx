import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { requestRecovery, confirmRecovery } from '../api/auth';
import Captcha from '../components/Captcha';
import Input, { codeInputClasses } from '../components/Input';

// ── Step 1: request recovery code ─────────────────────────────────────────────
function EmailStep({ onSuccess }) {
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ mode: 'onChange' });

  const onSubmit = async ({ email }) => {
    try {
      const { data } = await requestRecovery(email, captchaToken);
      onSuccess({ accountId: data.account.id, email: data.account.email });
    } catch (err) {
      setCaptchaToken('');
      setCaptchaKey((k) => k + 1); // remonta el captcha: token de un solo uso
      setError('root', {
        message: err?.data?.message || 'No se encontró una cuenta con ese correo.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Correo electrónico"
        id="email"
        type="email"
        placeholder="tu@correo.com"
        error={errors.email?.message}
        {...register('email', {
          required: 'El correo es requerido',
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
        })}
      />

      <Captcha key={captchaKey} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {errors.root.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !isValid || !captchaToken}
        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
      >
        {isSubmitting ? 'Enviando código…' : 'Enviar código'}
      </button>
    </form>
  );
}

// ── Step 2: enter code + new password ────────────────────────────────────────
function ResetStep({ accountId, email, onBack }) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ mode: 'onChange' });

  const newPassword = watch('password');

  const onSubmit = async (data) => {
    try {
      await confirmRecovery(accountId, data.code, data.password, data.password_repeat);
      navigate('/login', { state: { recovered: true } });
    } catch (err) {
      setError('root', {
        message: err?.data?.message || 'Código inválido o expirado.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-slate-500 bg-slate-50 rounded-lg px-4 py-3">
        Código enviado a{' '}
        <span className="font-medium text-slate-700">{email}</span>
      </p>

      {/* Code */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="code">
          Código de verificación (6 dígitos)
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          {...register('code', {
            required: 'El código es requerido',
            pattern: { value: /^\d{6}$/, message: 'Debe ser un código de 6 dígitos' },
          })}
          className={codeInputClasses({ error: !!errors.code })}
        />
        {errors.code && <p className="text-xs text-red-600">{errors.code.message}</p>}
      </div>

      <Input type="password"
        label="Nueva contraseña"
        id="password"
        placeholder="Mínimo 8 caracteres"
        error={errors.password?.message}
        {...register('password', {
          required: 'La nueva contraseña es requerida',
          minLength: { value: 8, message: 'Mínimo 8 caracteres' },
        })}
      />

      <Input type="password"
        label="Confirmar nueva contraseña"
        id="password_repeat"
        placeholder="••••••••"
        error={errors.password_repeat?.message}
        {...register('password_repeat', {
          required: 'Confirma la nueva contraseña',
          validate: (v) => v === newPassword || 'Las contraseñas no coinciden',
        })}
      />

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {errors.root.message}
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-700 transition cursor-pointer"
        >
          ← Volver
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
        >
          {isSubmitting ? 'Guardando…' : 'Restablecer contraseña'}
        </button>
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ForgotPassword() {
  const [step, setStep] = useState('email');
  const [account, setAccount] = useState(null);

  const handleEmailSuccess = (data) => {
    setAccount(data);
    setStep('reset');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 'email' ? 'Recuperar contraseña' : 'Nueva contraseña'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {step === 'email'
              ? 'Ingresa tu correo para recibir un código de recuperación'
              : 'Ingresa el código y define tu nueva contraseña'}
          </p>
        </div>

        {step === 'email' && <EmailStep onSuccess={handleEmailSuccess} />}
        {step === 'reset' && (
          <ResetStep
            accountId={account.accountId}
            email={account.email}
            onBack={() => setStep('email')}
          />
        )}

        <p className="text-sm text-center text-slate-500">
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
