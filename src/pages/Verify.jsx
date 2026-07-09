import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyCode } from '../api/auth';
import { codeInputClasses } from '../components/Input';
import Button from '../components/Button';

const Verify = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ mode: 'onChange' });

  if (!state?.accountId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
          <p className="text-slate-600">No hay verificación pendiente.</p>
          <Link to="/login" className="text-indigo-600 font-medium hover:underline text-sm">
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async ({ code }) => {
    try {
      await verifyCode(state.accountId, code);
      navigate('/login', { state: { verified: true } });
    } catch (err) {
      setError('root', { message: err?.data?.message || 'Código inválido. Inténtalo de nuevo.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Verifica tu correo</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enviamos un código de 6 dígitos a{' '}
            <span className="font-medium text-slate-700">{state.email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="code">
              Código de seguridad
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              {...register('code', {
                required: 'El código es requerido',
                pattern: { value: /^\d{6}$/, message: 'Debe ser un código de 6 dígitos' },
              })}
              maxLength={6}
              className={codeInputClasses({ error: !!errors.code })}
            />
            {errors.code && <p className="text-xs text-red-600">{errors.code.message}</p>}
          </div>

          {errors.root && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errors.root.message}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full"
          >
            {isSubmitting ? 'Verificando…' : 'Verificar correo'}
          </Button>
        </form>

        <p className="text-sm text-center text-slate-500">
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Verify;
