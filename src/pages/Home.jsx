import { useState, useEffect, useReducer } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogPanel, DialogTitle,
  Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption,
} from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import GimnasioCombobox from '../components/GimnasioCombobox';
import {
  getGimnasios,
  getAddresses,
  getReservas,
  createReserva,
  deleteReserva,
} from '../api/auth';

function fullName(user) {
  return [user?.first_name, user?.middle_name, user?.last_name1, user?.last_name2]
    .filter(Boolean)
    .join(' ');
}

// ── State ─────────────────────────────────────────────────────────────────────
const initialState = {
  reservas: [],
  gimnasios: [],
  userAddresses: [],
  loading: true,
  serverError: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOADED':
      return { ...state, loading: false, ...action.payload };
    case 'SET_RESERVAS':
      return { ...state, reservas: action.payload };
    case 'SET_ERROR':
      return { ...state, serverError: action.payload };
    default:
      return state;
  }
}

// ── Thunks ────────────────────────────────────────────────────────────────────
async function loadAll(dispatch) {
  try {
    const [reservasRes, gimnasiosRes, addressesRes] = await Promise.all([
      getReservas(),
      getGimnasios(),
      getAddresses(),
    ]);
    dispatch({
      type: 'LOADED',
      payload: {
        reservas: reservasRes.data,
        gimnasios: gimnasiosRes.data,
        userAddresses: addressesRes.data,
      },
    });
  } catch {
    dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los datos.' });
  }
}

async function refreshReservas(dispatch) {
  try {
    const { data } = await getReservas();
    dispatch({ type: 'SET_RESERVAS', payload: data });
  } catch { /* silent */ }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatAddress(addr) {
  if (!addr) return '—';
  return [
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
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':');
  return `${h}:${m}`;
}

// ── Components ────────────────────────────────────────────────────────────────

function TimeField({ label, id, registration, error, readOnly, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="time"
        readOnly={readOnly}
        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
          error ? 'border-red-400' : 'border-slate-200'
        } ${readOnly ? 'bg-slate-50 text-slate-500 cursor-default' : 'text-slate-900'}`}
        {...registration}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function AddressCombobox({ addresses, value, onChange, error }) {
  const options = addresses.map((a) => ({
    value: a.id,
    label: a.label || formatAddress(a),
    location: [a.city, a.department].filter(Boolean).join(', '),
  }));

  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">Dirección</label>
      <Combobox value={selected} onChange={(opt) => onChange(opt?.value ?? null)}>
        <div className="relative">
          <ComboboxInput
            readOnly
            className={`w-full px-3 py-2 pr-8 rounded-lg border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition cursor-pointer ${
              error ? 'border-red-400' : 'border-slate-200'
            }`}
            displayValue={(opt) => opt?.label ?? ''}
            placeholder="Selecciona una dirección"
          />
          <ComboboxButton className="absolute inset-0 flex items-center justify-end pr-2 cursor-pointer">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </ComboboxButton>
        </div>
        <ComboboxOptions
          anchor="bottom"
          className="w-(--input-width) rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50 focus:outline-none empty:hidden mt-1"
        >
          {options.map((opt) => (
            <ComboboxOption
              key={opt.value ?? '__none__'}
              value={opt}
              className="group px-4 py-2 cursor-pointer select-none data-focus:bg-indigo-50"
            >
              <p className="text-sm text-slate-700 group-data-selected:font-semibold group-data-selected:text-indigo-600">{opt.label}</p>
              {opt.location && <p className="text-xs text-slate-400">{opt.location}</p>}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function addOneHour(time) {
  if (!time) return '';
  const [h] = time.split(':');
  return `${String((parseInt(h, 10) + 1) % 24).padStart(2, '0')}:00`;
}

function ReservaForm({ gimnasioOptions, userAddresses, onSave, onCancel }) {
  const {
    register, handleSubmit, control, getValues, watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      gimnasio_id: '',
      address_id: userAddresses.find((a) => a.is_default)?.id ?? null,
      reservation_date: '',
      start_time: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4 pt-2">
      <Controller
        name="gimnasio_id"
        control={control}
        rules={{ required: 'Requerido' }}
        render={({ field }) => (
          <GimnasioCombobox
            options={gimnasioOptions}
            value={field.value}
            onChange={field.onChange}
            error={errors.gimnasio_id?.message}
          />
        )}
      />

      <Controller
        name="address_id"
        control={control}
        rules={{ required: 'Requerido' }}
        render={({ field }) => (
          <AddressCombobox
            addresses={userAddresses}
            value={field.value}
            onChange={field.onChange}
            error={errors.address_id?.message}
          />
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="reservation_date">Fecha</label>
          <input
            id="reservation_date"
            type="date"
            className={`w-full px-3 py-2 rounded-lg border text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
              errors.reservation_date ? 'border-red-400' : 'border-slate-200'
            }`}
            {...register('reservation_date', { required: 'Requerido' })}
          />
          {errors.reservation_date && <p className="text-xs text-red-600">{errors.reservation_date.message}</p>}
        </div>
        <TimeField label="Hora inicio" id="start_time"
          registration={register('start_time', {
            required: 'Requerido',
          })}
          error={errors.start_time?.message}
          step="3600"
        />
        <TimeField label="Hora fin" id="end_time_display"
          registration={{}}
          value={addOneHour(watch('start_time'))}
          readOnly
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <button type="button" onClick={onCancel}
          className="text-sm text-slate-500 hover:text-slate-700 transition cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting || !isValid}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
          {isSubmitting ? 'Guardando…' : 'Reservar'}
        </button>
      </div>
    </form>
  );
}

function ReservaModal({ open, title, onClose, children }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-slate-800">{title}</DialogTitle>
            <button onClick={onClose} aria-label="Cerrar"
              className="text-slate-400 hover:text-slate-600 transition cursor-pointer text-lg leading-none">
              ✕
            </button>
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

function ReservasSection({ state, dispatch }) {
  const [modalOpen, setModalOpen] = useState(false);
  const showToast = useToast();

  const gimnasioOptions = state.gimnasios.map((g) => ({
    value: g.id,
    label: `${g.idrd_id} – ${g.park}`,
  }));

  const handleSave = async (data) => {
    try {
      await createReserva({
        gimnasio_id: data.gimnasio_id,
        address_id: data.address_id || null,
        reservation_date: data.reservation_date,
        start_time: data.start_time,
      });
      await refreshReservas(dispatch);
      setModalOpen(false);
      showToast('Reserva creada exitosamente');
    } catch (err) {
      showToast(err?.data?.message || 'Error al guardar la reserva.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReserva(id);
      dispatch({ type: 'SET_RESERVAS', payload: state.reservas.filter((r) => r.id !== id) });
      showToast('Reserva eliminada');
    } catch (err) {
      showToast(err?.data?.message || 'Error al eliminar la reserva.', 'error');
    }
  };

  const openAdd = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (state.loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 w-full">
        <p className="text-sm text-slate-400 text-center py-8">Cargando…</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Mis reservas</h2>
          <button onClick={openAdd}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition cursor-pointer">
            + Nueva reserva
          </button>
        </div>


        {state.reservas.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No tienes reservas activas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 pr-6 text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">Gimnasio</th>
                  <th className="pb-3 pr-6 text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">Fecha</th>
                  <th className="pb-3 pr-6 text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">Horario</th>
                  <th className="pb-3 pr-6 text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">Dirección</th>
                  <th className="pb-3 text-xs font-medium text-slate-400 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.reservas.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 pr-6">
                      <p className="font-medium text-slate-800">{r.gimnasio?.idrd_id}</p>
                      <p className="text-xs text-slate-400">{r.gimnasio?.park}</p>
                    </td>
                    <td className="py-3 pr-6 text-slate-600 whitespace-nowrap">{fmtDate(r.reservation_date)}</td>
                    <td className="py-3 pr-6 whitespace-nowrap font-mono text-slate-600">
                      {fmtTime(r.start_time)} – {fmtTime(r.end_time)}
                    </td>
                    <td className="py-3 pr-6 text-slate-500 text-xs">
                      <p>{formatAddress(r.address)}</p>
                      {(r.address?.city || r.address?.department) && (
                        <p className="text-slate-400">{[r.address.city, r.address.department].filter(Boolean).join(', ')}</p>
                      )}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <button onClick={() => handleDelete(r.id)} title="Eliminar"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer">
                        <TrashIcon className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReservaModal open={modalOpen} title="Nueva reserva" onClose={closeModal}>
        <ReservaForm
          gimnasioOptions={gimnasioOptions}
          userAddresses={state.userAddresses}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </ReservaModal>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => { loadAll(dispatch); }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500 font-medium">Bienvenido,</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-1">{fullName(user)}</h1>
          <p className="text-slate-500 text-sm mt-2">Has iniciado sesión en el portal IRDR.</p>
        </div>

        <ReservasSection state={state} dispatch={dispatch} />
      </main>
    </div>
  );
}
