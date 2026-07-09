import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Captcha from '../components/Captcha';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const { user, checking, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const verified = location.state?.verified;
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ mode: 'onChange' });

  if (!checking && user) return <Navigate to="/home" replace />;

  const onSubmit = async ({ email, password }) => {
    try {
      const { data, status } = await login(email, password, captchaToken);
      if (status === 200 && data.account) {
        signIn(data.account, data.token);
        navigate('/home');
      } else if (status === 202 && data.account) {
        navigate('/verify', {
          state: { accountId: data.account.id, email: data.account.email },
        });
      }
    } catch (err) {
      setCaptchaToken('');
      setCaptchaKey((k) => k + 1); // remonta el captcha: token de un solo uso
      setError('root', { message: err?.data?.message || 'Authentication failed' });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center  bg-white lg:bg-slate-50 px-4">
      <div className="w-full max-w-sm lg:bg-white rounded-2xl lg:shadow-lg lg:p-8 flex flex-col gap-4">

        <img src="/favicon.svg" alt="IDRD" className="w-20 mx-auto" />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Bienvenido</h1>
          <p className="text-sm text-slate-500">Inicia sesión en tu cuenta</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            error={errors.email?.message}
            {...register('email', { required: 'El correo es requerido' })}
          />

          <Input type="password"
            label="Contraseña"
            id="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'La contraseña es requerida' })}
          />

          <div className="border border-slate-200 rounded-lg flex justify-center items-center pt-2">
            <Captcha key={captchaKey} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />
          </div>

          {errors.root && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errors.root.message}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !isValid || !captchaToken}
            className="w-full"
          >
            {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </Button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-slate-500 hover:text-indigo-600 transition">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <p className="text-sm text-center text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Regístrate
            </Link>
          </p>

        </form>

      </div>
    </div>
  );
}

export default Login;
