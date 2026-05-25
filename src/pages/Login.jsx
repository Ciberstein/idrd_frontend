import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { login } from '../api/auth';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, checking, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const verified = location.state?.verified;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ mode: 'onChange' });

  if (!checking && user) return <Navigate to="/home" replace />;

  const onSubmit = async ({ email, password }) => {
    try {
      const { data, status } = await login(email, password);
      if (status === 200 && data.account) {
        signIn(data.account, data.token);
        navigate('/home');
      } else if (status === 202 && data.account) {
        navigate('/verify', {
          state: { accountId: data.account.id, email: data.account.email },
        });
      }
    } catch (err) {
      setError('root', { message: err?.data?.message || 'Authentication failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Bienvenido</h1>
          <p className="text-sm text-slate-500 mt-1">Inicia sesión en tu cuenta</p>
        </div>

        {verified && (
          <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-4 py-3 text-center">
            Correo verificado. Ya puedes iniciar sesión.
          </p>
        )}

        {location.state?.recovered && (
          <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-4 py-3 text-center">
            Contraseña restablecida. Ya puedes iniciar sesión.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              {...register('email', { required: 'El correo es requerido' })}
              className={`w-full px-3 py-2 rounded-lg border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                errors.email ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <PasswordField
            label="Contraseña"
            id="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'La contraseña es requerida' })}
          />

          {errors.root && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
          >
            {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-slate-500 hover:text-indigo-600 transition"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        <p className="text-sm text-center text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
