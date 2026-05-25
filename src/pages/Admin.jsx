import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import Combobox from '../components/Combobox';
import { useToast } from '../context/ToastContext';
import { getUsers, updateUser } from '../api/admin';
import { getDocTypes } from '../api/auth';

const AUTHORITY_OPTIONS = [
  { value: -1, label: 'No verificado' },
  { value: 0, label: 'Usuario' },
  { value: 1, label: 'Administrador' },
];

function authorityBadge(authority) {
  if (authority === 1)
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Admin</span>;
  if (authority === 0)
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Usuario</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">No verificado</span>;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Field({ label, id, error, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700" htmlFor={id}>{label}</label>
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

function EditModal({ user, docTypes, open, onClose, onSaved }) {
  const showToast = useToast();
  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name ?? '',
        middle_name: user.middle_name ?? '',
        last_name1: user.last_name1 ?? '',
        last_name2: user.last_name2 ?? '',
        birth_date: user.birth_date ?? '',
        doc_type: user.doc_type ?? '',
        doc_number: user.doc_number ?? '',
        phone: user.phone ?? '',
        authority: user.authority,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const { data: res } = await updateUser(user.id, {
        ...data,
        authority: Number(data.authority),
      });
      onSaved(res.user);
      showToast('Usuario actualizado');
      onClose();
    } catch (err) {
      showToast(err?.data?.message || 'Error al actualizar el usuario', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <DialogPanel className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-slate-800">Editar usuario</DialogTitle>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition cursor-pointer text-lg leading-none">✕</button>
          </div>

          {user && (
            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              <span className="font-medium text-slate-600">Correo:</span> {user.email}
              <span className="mx-3 text-slate-300">|</span>
              <span className="font-medium text-slate-600">ID:</span> #{user.id}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Primer nombre" id="first_name" error={errors.first_name?.message}
                {...register('first_name', { required: 'Requerido' })} />
              <Field label="Segundo nombre" id="middle_name"
                {...register('middle_name')} />
              <Field label="Primer apellido" id="last_name1" error={errors.last_name1?.message}
                {...register('last_name1', { required: 'Requerido' })} />
              <Field label="Segundo apellido" id="last_name2"
                {...register('last_name2')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha de nacimiento" id="birth_date" type="date"
                {...register('birth_date')} />
              <Field label="Teléfono" id="phone" type="tel"
                {...register('phone')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="doc_type"
                control={control}
                rules={{ required: 'Requerido' }}
                render={({ field }) => (
                  <Combobox
                    label="Tipo de documento"
                    options={docTypes}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.doc_type?.message}
                  />
                )}
              />
              <Field label="Número de documento" id="doc_number" error={errors.doc_number?.message}
                {...register('doc_number', { required: 'Requerido' })} />
            </div>

            <Controller
              name="authority"
              control={control}
              render={({ field }) => (
                <Combobox
                  label="Rol"
                  options={AUTHORITY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.authority?.message}
                  emptyValue={0}
                />
              )}
            />

            <div className="flex items-center justify-between pt-1">
              <button type="button" onClick={onClose}
                className="text-sm text-slate-500 hover:text-slate-700 transition cursor-pointer">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
                {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [docTypes, setDocTypes] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const showToast = useToast();

  const fetchUsers = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const { data } = await getUsers({ q: q || undefined });
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      showToast('Error al cargar los usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
    getDocTypes().then(({ data }) =>
      setDocTypes(data.map((d) => ({ value: d.code, label: `${d.code} — ${d.name}` })))
    );
  }, [fetchUsers]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  const handleSaved = (updated) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de administración</h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} usuario{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <input
            type="search"
            placeholder="Buscar por nombre, correo o documento…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-16">Cargando…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">No se encontraron usuarios.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">ID</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Nombre</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Correo</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Documento</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Teléfono</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Rol</th>
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Registro</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{u.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {[u.first_name, u.last_name1].filter(Boolean).join(' ')}
                        </p>
                        {(u.middle_name || u.last_name2) && (
                          <p className="text-xs text-slate-400">
                            {[u.middle_name, u.last_name2].filter(Boolean).join(' ')}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="text-xs text-slate-400 mr-1">{u.doc_type}</span>
                        {u.doc_number}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{u.phone || '—'}</td>
                      <td className="px-4 py-3">{authorityBadge(u.authority)}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setEditUser(u)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
                        >
                          <PencilSquareIcon className="w-3.5 h-3.5" />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <EditModal
        user={editUser}
        docTypes={docTypes}
        open={!!editUser}
        onClose={() => setEditUser(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
