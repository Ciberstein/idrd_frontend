import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { register as registerUser, getDocTypes } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Combobox from '../components/Combobox';
import PasswordField from '../components/PasswordField';
import Captcha from '../components/Captcha';

function Field({ label, id, optional, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 flex gap-1" htmlFor={id}>
        {label}
        {optional && <span className="text-slate-400 font-normal">(opcional)</span>}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 rounded-lg border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
          error ? 'border-red-400' : 'border-slate-200'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}


export default function Register() {
  const { user, checking } = useAuth();
  const navigate = useNavigate();
  const [docTypes, setDocTypes] = useState([]);
  const [captchaToken, setCaptchaToken] = useState('');

  useEffect(() => {
    getDocTypes()
      .then(({ data }) => setDocTypes(data.map((t) => ({ value: t.code, label: `${t.code} – ${t.name}` }))))
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ mode: 'onChange' });

  if (!checking && user) return <Navigate to="/home" replace />;

  const onSubmit = async (data) => {
    try {
      const payload = {
        doc_type: data.doc_type,
        doc_number: data.doc_number,
        first_name: data.first_name,
        middle_name: data.middle_name || undefined,
        last_name1: data.last_name1,
        last_name2: data.last_name2 || undefined,
        birth_date: data.birth_date,
        email: data.email,
        password: data.password,
        password_repeat: data.password_repeat,
        captcha_token: captchaToken,
      };
      const { data: res } = await registerUser(payload);
      if (res.account) {
        navigate('/verify', {
          state: { accountId: res.account.id, email: res.account.email, fromRegister: true },
        });
      }
    } catch (err) {
      setCaptchaToken('');
      setError('root', { message: err?.data?.message || 'Registration failed' });
    }
  };

  const password = watch('password');

  return (
    <div className="min-h-screen flex items-center justify-center bg-white lg:bg-slate-50 px-4 py-10">

      <div className="w-full max-w-md lg:bg-white rounded-2xl lg:shadow-lg lg:p-8 flex flex-col gap-4">

        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="text-sm text-slate-500">Completa tus datos para registrarte</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              name="doc_type"
              control={control}
              rules={{ required: 'Requerido' }}
              render={({ field }) => (
                <Combobox
                  label="Tipo de documento"
                  options={docTypes}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.doc_type?.message}
                  placeholder="Selecciona un tipo"
                />
              )}
            />
            <Field label="Número de documento" id="doc_number" placeholder="Ej: 1234567890"
              error={errors.doc_number?.message}
              {...register('doc_number', { required: 'Requerido' })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Primer nombre" id="first_name" placeholder="Ej: Carlos"
              error={errors.first_name?.message}
              {...register('first_name', { required: 'Requerido' })}
            />
            <Field label="Segundo nombre" id="middle_name" placeholder="Ej: Andrés" optional
              error={errors.middle_name?.message}
              {...register('middle_name')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Primer apellido" id="last_name1" placeholder="Ej: García"
              error={errors.last_name1?.message}
              {...register('last_name1', { required: 'Requerido' })}
            />
            <Field label="Segundo apellido" id="last_name2" placeholder="Ej: López" optional
              error={errors.last_name2?.message}
              {...register('last_name2')}
            />
          </div>

          <Field label="Fecha de nacimiento" id="birth_date" type="date"
            max={new Date().toISOString().split('T')[0]}
            error={errors.birth_date?.message}
            {...register('birth_date', {
              required: 'La fecha de nacimiento es requerida',
              validate: (v) => new Date(v) < new Date() || 'Debe ser una fecha pasada',
            })}
          />

          <Field label="Correo electrónico" id="email" type="email" placeholder="tu@correo.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'El correo es requerido',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
            })}
          />

          <PasswordField label="Contraseña" id="password" placeholder="Mínimo 8 caracteres"
            error={errors.password?.message}
            {...register('password', {
              required: 'La contraseña es requerida',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            })}
          />

          <PasswordField label="Confirmar contraseña" id="password_repeat" placeholder="••••••••"
            error={errors.password_repeat?.message}
            {...register('password_repeat', {
              required: 'Confirma tu contraseña',
              validate: (v) => v === password || 'Las contraseñas no coinciden',
            })}
          />

          <Captcha onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

          {errors.root && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isValid || !captchaToken}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
          >
            {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-sm text-center text-slate-500">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
