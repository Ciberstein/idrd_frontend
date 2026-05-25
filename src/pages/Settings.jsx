import { useState, useEffect, useCallback } from 'react';
import { PencilSquareIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DocTypeCombobox from '../components/DocTypeCombobox';
import ViaTypeCombobox from '../components/ViaTypeCombobox';
import DepartmentCombobox from '../components/DepartmentCombobox';
import CityCombobox from '../components/CityCombobox';
import {
  updateProfile,
  requestEmailChange,
  confirmEmailChange,
  requestPasswordChange,
  confirmPasswordChange,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../api/auth';
import Navbar from '../components/Navbar';

// ── Shared primitives ─────────────────────────────────────────────────────────
function Field({ label, id, optional, error, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 flex gap-1" htmlFor={id}>
        {label}
        {optional && <span className="text-slate-400 font-normal">(opcional)</span>}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 rounded-lg border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
          error ? 'border-red-400' : 'border-slate-200'
        } ${props.readOnly ? 'bg-slate-50 text-slate-500 cursor-default' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function CodeInput({ id, registration, error }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700" htmlFor={id}>
        Código de verificación (6 dígitos)
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="000000"
        maxLength={6}
        {...registration}
        className={`w-full px-3 py-3 rounded-lg border text-slate-900 placeholder-slate-400 text-center text-xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
          error ? 'border-red-400' : 'border-slate-200'
        }`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Alert({ type, message }) {
  if (!message) return null;
  const cls = type === 'error' ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50';
  return <p className={`text-sm rounded-lg px-4 py-3 ${cls}`}>{message}</p>;
}

function SectionDivider({ title }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// ── General info section ──────────────────────────────────────────────────────
function GeneralSection() {
  const { user, updateUser } = useAuth();
  const showToast = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      first_name: user?.first_name ?? '',
      middle_name: user?.middle_name ?? '',
      last_name1: user?.last_name1 ?? '',
      last_name2: user?.last_name2 ?? '',
      birth_date: user?.birth_date ?? '',
      doc_type: user?.doc_type ?? '',
      doc_number: user?.doc_number ?? '',
      phone: user?.phone ?? '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const { data: res } = await updateProfile({
        first_name: data.first_name,
        middle_name: data.middle_name || undefined,
        last_name1: data.last_name1,
        last_name2: data.last_name2 || undefined,
        birth_date: data.birth_date,
        doc_type: data.doc_type,
        doc_number: data.doc_number,
        phone: data.phone || undefined,
      });
      updateUser(res.account);
      showToast('Información actualizada correctamente');
    } catch (err) {
      showToast(err?.data?.message || 'Error al actualizar.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Primer nombre" id="first_name" error={errors.first_name?.message}
          {...register('first_name', { required: 'Requerido' })} />
        <Field label="Segundo nombre" id="middle_name" optional error={errors.middle_name?.message}
          {...register('middle_name')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Primer apellido" id="last_name1" error={errors.last_name1?.message}
          {...register('last_name1', { required: 'Requerido' })} />
        <Field label="Segundo apellido" id="last_name2" optional error={errors.last_name2?.message}
          {...register('last_name2')} />
      </div>
      <Field label="Fecha de nacimiento" id="birth_date" type="date"
        max={new Date().toISOString().split('T')[0]}
        error={errors.birth_date?.message}
        {...register('birth_date', {
          required: 'La fecha de nacimiento es requerida',
          validate: (v) => new Date(v) < new Date() || 'Debe ser una fecha pasada',
        })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Controller
          name="doc_type"
          control={control}
          rules={{ required: 'Requerido' }}
          render={({ field }) => (
            <DocTypeCombobox
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.doc_type?.message}
            />
          )}
        />
        <Field label="Número de documento" id="doc_number"
          error={errors.doc_number?.message}
          {...register('doc_number', { required: 'Requerido' })}
        />
      </div>
      <Field label="Teléfono" id="phone" optional placeholder="Ej. 3001234567"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isSubmitting || !isDirty || !isValid}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer w-full sm:w-max">
          {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

// ── Email change section ──────────────────────────────────────────────────────
function EmailSection() {
  const { user, updateUser } = useAuth();
  const showToast = useToast();
  const [step, setStep] = useState('form');
  const [pendingEmail, setPendingEmail] = useState('');

  // Step 1
  const {
    register: reg1,
    handleSubmit: handle1,
    watch,
    reset: reset1,
    formState: { errors: err1, isSubmitting: sub1, isValid: isValid1 },
  } = useForm({ mode: 'onChange' });

  // Step 2
  const {
    register: reg2,
    handleSubmit: handle2,
    reset: reset2,
    formState: { errors: err2, isSubmitting: sub2, isValid: isValid2 },
  } = useForm({ mode: 'onChange' });

  const emailNew = watch('email_new');

  const onRequest = async (data) => {
    try {
      await requestEmailChange(data.email_new, data.email_new_repeat);
      setPendingEmail(data.email_new);
      setStep('verify');
      showToast(`Código de verificación enviado a ${data.email_new}`);
    } catch (err) {
      showToast(err?.data?.message || 'Error al solicitar el cambio.', 'error');
    }
  };

  const onConfirm = async (data) => {
    try {
      await confirmEmailChange(data.code, pendingEmail);
      updateUser({ email: pendingEmail.toLowerCase() });
      setStep('form');
      setPendingEmail('');
      reset1();
      reset2();
      showToast('Correo electrónico actualizado correctamente');
    } catch (err) {
      showToast(err?.data?.message || 'Código inválido o expirado.', 'error');
    }
  };

  const goBack = () => {
    setStep('form');
    reset2();
  };

  if (step === 'verify') {
    return (
      <form onSubmit={handle2(onConfirm)} className="space-y-4">
        <p className="text-sm text-slate-500">
          Ingresa el código enviado a{' '}
          <span className="font-medium text-slate-700">{pendingEmail}</span>
        </p>

        <CodeInput
          id="email_code"
          registration={reg2('code', {
            required: 'El código es requerido',
            pattern: { value: /^\d{6}$/, message: 'Debe ser un código de 6 dígitos' },
          })}
          error={err2.code?.message}
        />

<div className="flex items-center justify-between pt-2">
          <button type="button" onClick={goBack}
            className="text-sm text-slate-500 hover:text-slate-700 transition cursor-pointer">
            ← Volver
          </button>
          <button type="submit" disabled={sub2 || !isValid2}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
            {sub2 ? 'Verificando…' : 'Confirmar cambio'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handle1(onRequest)} className="space-y-4">
      <Field
        label="Correo actual"
        id="current_email"
        type="email"
        value={user?.email ?? ''}
        readOnly
        onChange={() => {}}
      />
      <Field
        label="Nuevo correo"
        id="email_new"
        type="email"
        placeholder="nuevo@correo.com"
        error={err1.email_new?.message}
        {...reg1('email_new', {
          required: 'El nuevo correo es requerido',
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
          validate: (v) =>
            v.toLowerCase() !== user?.email?.toLowerCase() ||
            'Debe ser diferente al correo actual',
        })}
      />
      <Field
        label="Repetir nuevo correo"
        id="email_new_repeat"
        type="email"
        placeholder="nuevo@correo.com"
        error={err1.email_new_repeat?.message}
        {...reg1('email_new_repeat', {
          required: 'Confirma el nuevo correo',
          validate: (v) =>
            v.toLowerCase() === emailNew?.toLowerCase() || 'Los correos no coinciden',
        })}
      />



      <div className="flex justify-end pt-2">
        <button type="submit" disabled={sub1 || !isValid1}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer w-full sm:w-max">
          {sub1 ? 'Enviando código…' : 'Cambiar correo'}
        </button>
      </div>
    </form>
  );
}

// ── Security section ──────────────────────────────────────────────────────────
function SecuritySection() {
  const { user } = useAuth();
  const showToast = useToast();
  const [step, setStep] = useState('form');
  const [newPassword, setNewPassword] = useState('');

  const {
    register: reg1,
    handleSubmit: handle1,
    watch,
    formState: { errors: err1, isSubmitting: sub1, isValid: isValid1 },
  } = useForm({ mode: 'onChange' });

  const {
    register: reg2,
    handleSubmit: handle2,
    formState: { errors: err2, isSubmitting: sub2, isValid: isValid2 },
  } = useForm({ mode: 'onChange' });

  const onRequestChange = async (data) => {
    try {
      await requestPasswordChange(data.password, data.new_password, data.new_password_repeat);
      setNewPassword(data.new_password);
      setStep('verify');
      showToast(`Código enviado a ${user?.email}`);
    } catch (err) {
      showToast(err?.data?.message || 'Error al solicitar el cambio.', 'error');
    }
  };

  const onConfirm = async (data) => {
    try {
      await confirmPasswordChange(data.code, newPassword);
      setStep('form');
      setNewPassword('');
      showToast('Contraseña actualizada correctamente');
    } catch (err) {
      showToast(err?.data?.message || 'Código inválido o expirado.', 'error');
    }
  };

  const currentPassword = watch('new_password');

  if (step === 'verify') {
    return (
      <form onSubmit={handle2(onConfirm)} className="space-y-4">
        <p className="text-sm text-slate-500">
          Código enviado a{' '}
          <span className="font-medium text-slate-700">{user?.email}</span>
        </p>

        <CodeInput
          id="pwd_code"
          registration={reg2('code', {
            required: 'El código es requerido',
            pattern: { value: /^\d{6}$/, message: 'Debe ser un código de 6 dígitos' },
          })}
          error={err2.code?.message}
        />

<div className="flex items-center justify-between pt-2">
          <button type="button"
            onClick={() => setStep('form')}
            className="text-sm text-slate-500 hover:text-slate-700 transition cursor-pointer">
            ← Volver
          </button>
          <button type="submit" disabled={sub2 || !isValid2}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer w-full sm:w-max">
            {sub2 ? 'Verificando…' : 'Confirmar cambio'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handle1(onRequestChange)} className="space-y-4">
      <Field label="Contraseña actual" id="password" type="password" placeholder="••••••••"
        error={err1.password?.message}
        {...reg1('password', { required: 'La contraseña actual es requerida' })}
      />
      <Field label="Nueva contraseña" id="new_password" type="password" placeholder="Mínimo 8 caracteres"
        error={err1.new_password?.message}
        {...reg1('new_password', {
          required: 'La nueva contraseña es requerida',
          minLength: { value: 8, message: 'Mínimo 8 caracteres' },
        })}
      />
      <Field label="Confirmar nueva contraseña" id="new_password_repeat" type="password" placeholder="••••••••"
        error={err1.new_password_repeat?.message}
        {...reg1('new_password_repeat', {
          required: 'Confirma la nueva contraseña',
          validate: (v) => v === currentPassword || 'Las contraseñas no coinciden',
        })}
      />



      <div className="flex justify-end pt-2">
        <button type="submit" disabled={sub1 || !isValid1}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer w-full sm:w-max">
          {sub1 ? 'Enviando código…' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  );
}

// ── Addresses section ─────────────────────────────────────────────────────────
const QUADRANTS = ['Norte', 'Sur', 'Este', 'Oeste'];

function formatAddress(addr) {
  const street = [
    addr.viaType?.code,
    addr.via_number,
    addr.via_bis ? 'BIS' : null,
    addr.via_quadrant || null,
    '#',
    addr.cross_number,
    addr.cross_quadrant || null,
    '-',
    addr.plate,
    addr.complement || null,
  ].filter(Boolean).join(' ');
  const location = [addr.city, addr.department].filter(Boolean).join(', ');
  return [street, location].filter(Boolean).join(', ');
}

function QuadrantSelect({ label, id, optional, error, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 flex gap-1" htmlFor={id}>
        {label}
        {optional && <span className="text-slate-400 font-normal">(opcional)</span>}
      </label>
      <select
        id={id}
        className={`w-full px-3 py-2 rounded-lg border text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white cursor-pointer ${
          error ? 'border-red-400' : 'border-slate-200'
        }`}
        {...props}
      >
        <option value="">Sin cuadrante</option>
        {QUADRANTS.map((q) => <option key={q} value={q}>{q}</option>)}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function AddressForm({ initial, onSave, onCancel }) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      via_type: initial?.viaType?.code ?? '',
      via_number: initial?.via_number ?? '',
      via_bis: initial?.via_bis ?? false,
      via_quadrant: initial?.via_quadrant ?? '',
      cross_number: initial?.cross_number ?? '',
      cross_quadrant: initial?.cross_quadrant ?? '',
      plate: initial?.plate ?? '',
      complement: initial?.complement ?? '',
      label: initial?.label ?? '',
      city: initial?.city ?? '',
      department: initial?.department ?? '',
      is_default: initial?.is_default ?? false,
    },
  });

  useEffect(() => { reset(initial
    ? {
        via_type: initial.viaType?.code ?? '',
        via_number: initial.via_number ?? '',
        via_bis: initial.via_bis ?? false,
        via_quadrant: initial.via_quadrant ?? '',
        cross_number: initial.cross_number ?? '',
        cross_quadrant: initial.cross_quadrant ?? '',
        plate: initial.plate ?? '',
        complement: initial.complement ?? '',
        label: initial.label ?? '',
        city: initial.city ?? '',
        department: initial.department ?? '',
        is_default: initial.is_default ?? false,
      }
    : { via_type: '', via_number: '', via_bis: false, via_quadrant: '', cross_number: '', cross_quadrant: '', plate: '', complement: '', label: '', city: '', department: '', is_default: false }
  ); }, [initial, reset]);

  const watched = watch();
  const preview = [
    watched.via_type,
    watched.via_number,
    watched.via_bis ? 'BIS' : null,
    watched.via_quadrant || null,
    watched.via_number || watched.cross_number ? '#' : null,
    watched.cross_number,
    watched.cross_quadrant || null,
    watched.plate ? '-' : null,
    watched.plate,
    watched.complement || null,
  ].filter(Boolean).join(' ');
  const previewLocation = [watched.city, watched.department].filter(Boolean).join(', ');

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Controller
          name="department"
          control={control}
          rules={{ required: 'Requerido' }}
          render={({ field }) => (
            <DepartmentCombobox
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                setValue('city', '');
              }}
              error={errors.department?.message}
            />
          )}
        />
        <Controller
          name="city"
          control={control}
          rules={{ required: 'Requerido' }}
          render={({ field }) => (
            <CityCombobox
              value={field.value}
              onChange={field.onChange}
              department={watch('department')}
              error={errors.city?.message}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Controller
          name="via_type"
          control={control}
          rules={{ required: 'Requerido' }}
          render={({ field }) => (
            <ViaTypeCombobox value={field.value ?? ''} onChange={field.onChange} error={errors.via_type?.message} />
          )}
        />
        <Field label="Número de vía" id="via_number" placeholder="17A"
          error={errors.via_number?.message}
          {...register('via_number', { required: 'Requerido' })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <QuadrantSelect label="Cuadrante vía" id="via_quadrant" optional
          error={errors.via_quadrant?.message}
          {...register('via_quadrant')}
        />
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4 rounded accent-indigo-600"
              {...register('via_bis')}
            />
            BIS
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Número cruce" id="cross_number" placeholder="22D"
          error={errors.cross_number?.message}
          {...register('cross_number', { required: 'Requerido' })}
        />
        <QuadrantSelect label="Cuadrante cruce" id="cross_quadrant" optional
          error={errors.cross_quadrant?.message}
          {...register('cross_quadrant')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Placa" id="plate" placeholder="50"
          error={errors.plate?.message}
          {...register('plate', { required: 'Requerido' })}
        />
        <Field label="Complemento" id="complement" placeholder="Apto 301" optional
          error={errors.complement?.message}
          {...register('complement')}
        />
      </div>

      <Field label="Etiqueta" id="label" placeholder="Casa, Trabajo…" optional
        error={errors.label?.message}
        {...register('label')}
      />

      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
        <input type="checkbox" className="w-4 h-4 rounded accent-indigo-600"
          {...register('is_default')}
        />
        Establecer como dirección principal
      </label>

      {(preview.length > 1 || previewLocation) && (
        <div className="bg-indigo-50 rounded-lg px-4 py-3">
          <p className="text-xs text-indigo-500 font-medium mb-0.5">Vista previa</p>
          <p className="text-sm font-mono text-indigo-800">{preview}</p>
          {previewLocation && <p className="text-xs text-indigo-600 mt-0.5">{previewLocation}</p>}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <button type="button" onClick={onCancel}
          className="text-sm text-slate-500 hover:text-slate-700 transition cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting || !isValid}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
          {isSubmitting ? 'Guardando…' : initial ? 'Actualizar' : 'Agregar'}
        </button>
      </div>
    </form>
  );
}

function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(address.id);
    setDeleting(false);
  };

  const handleSetDefault = async () => {
    setSettingDefault(true);
    await onSetDefault(address.id);
    setSettingDefault(false);
  };

  return (
    <div className={`rounded-xl border p-4 space-y-2 transition ${
      address.is_default ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <p className="text-sm font-mono font-medium text-slate-800 break-all">
            {[
              address.viaType?.code,
              address.via_number,
              address.via_bis ? 'BIS' : null,
              address.via_quadrant || null,
              '#',
              address.cross_number,
              address.cross_quadrant || null,
              '-',
              address.plate,
              address.complement || null,
            ].filter(Boolean).join(' ')}
          </p>
          {(address.city || address.department) && (
            <p className="text-xs text-slate-500">
              {[address.city, address.department].filter(Boolean).join(', ')}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {address.label && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{address.label}</span>
            )}
            {address.is_default && (
              <span className="text-xs bg-indigo-100 text-indigo-600 font-medium px-2 py-0.5 rounded-full">Principal</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
        {!address.is_default && (
          <button onClick={handleSetDefault} disabled={settingDefault}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50">
            <StarIcon className="w-3.5 h-3.5" />
            {settingDefault ? 'Guardando…' : 'Principal'}
          </button>
        )}
        <div className="flex-1" />
        <button onClick={() => onEdit(address)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer">
          <PencilSquareIcon className="w-3.5 h-3.5" />
          Editar
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer disabled:opacity-50">
          <TrashIcon className="w-3.5 h-3.5" />
          {deleting ? '…' : 'Eliminar'}
        </button>
      </div>
    </div>
  );
}

function AddressesSection() {
  const showToast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('list');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await getAddresses();
      setAddresses(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      const payload = {
        via_type: data.via_type,
        via_number: data.via_number,
        via_bis: Boolean(data.via_bis),
        via_quadrant: data.via_quadrant || null,
        cross_number: data.cross_number,
        cross_quadrant: data.cross_quadrant || null,
        plate: data.plate,
        complement: data.complement || null,
        label: data.label || null,
        city: data.city || null,
        department: data.department || null,
        is_default: Boolean(data.is_default),
      };
      if (editing) {
        await updateAddress(editing.id, payload);
        showToast('Dirección actualizada');
      } else {
        await createAddress(payload);
        showToast('Dirección agregada');
      }
      await load();
      setMode('list');
      setEditing(null);
    } catch (err) {
      showToast(err?.data?.message || 'Error al guardar la dirección.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast('Dirección eliminada');
    } catch (err) {
      showToast(err?.data?.message || 'Error al eliminar la dirección.', 'error');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      await load();
      showToast('Dirección principal actualizada');
    } catch (err) {
      showToast(err?.data?.message || 'Error al actualizar la dirección principal.', 'error');
    }
  };

  const openEdit = (address) => { setEditing(address); setMode('form'); };
  const openAdd = () => { setEditing(null); setMode('form'); };
  const cancel = () => { setMode('list'); setEditing(null); };

  if (loading) {
    return <p className="text-sm text-slate-400 text-center py-6">Cargando direcciones…</p>;
  }

  if (mode === 'form') {
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          {editing ? 'Editar dirección' : 'Nueva dirección'}
        </h3>
        <AddressForm initial={editing} onSave={handleSave} onCancel={cancel} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">No tienes direcciones guardadas.</p>
      ) : (
        addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            address={addr}
            onEdit={openEdit}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        ))
      )}
      <button onClick={openAdd}
        className="w-full py-2 px-4 border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 text-sm font-medium rounded-xl transition cursor-pointer">
        + Agregar dirección
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'general', label: 'Información general' },
  { id: 'addresses', label: 'Direcciones' },
  { id: 'security', label: 'Seguridad' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
          <p className="text-sm text-slate-500 mt-1">Administra tu información y seguridad</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-200">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px'
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-6">
            {activeTab === 'general' && (
              <>
                <GeneralSection />
                <SectionDivider title="Correo electrónico" />
                <EmailSection />
              </>
            )}
            {activeTab === 'security' && <SecuritySection />}
            {activeTab === 'addresses' && <AddressesSection />}
          </div>
        </div>
      </main>
    </div>
  );
}
