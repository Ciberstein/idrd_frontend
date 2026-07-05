import { useState, useEffect, useReducer } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { CalendarIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Combobox from '../components/Combobox';
import StreakPanel from '../components/StreakPanel';
import { inputClasses } from '../components/Input';
import Button from '../components/Button';
import clsx from 'clsx';
import {
  getGimnasios,
  getAddresses,
  getReservas,
  getStreak,
  createReserva,
  deleteReserva,
} from '../api/auth';

// ── State ─────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const initialState = {
  reservas: [],
  total: 0,
  hasMore: false,
  streak: { current: 0, longest: 0 },
  gimnasios: [],
  userAddresses: [],
  loading: true,
  loadingMore: false,
  serverError: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOADED':
      return { ...state, loading: false, ...action.payload };
    case 'LOADING_MORE':
      return { ...state, loadingMore: true };
    case 'APPEND_RESERVAS':
      return {
        ...state,
        loadingMore: false,
        reservas: [...state.reservas, ...action.payload.reservas],
        total: action.payload.total,
        hasMore: action.payload.hasMore,
      };
    case 'LOADING_MORE_DONE':
      return { ...state, loadingMore: false };
    case 'SET_RESERVAS':
      return { ...state, ...action.payload };
    case 'SET_STREAK':
      return { ...state, streak: action.payload };
    case 'SET_ERROR':
      return { ...state, loading: false, serverError: action.payload };
    default:
      return state;
  }
}

// ── Thunks ────────────────────────────────────────────────────────────────────
async function loadAll(dispatch) {
  try {
    const [reservasRes, streakRes, gimnasiosRes, addressesRes] = await Promise.all([
      getReservas({ limit: PAGE_SIZE, offset: 0 }),
      getStreak(),
      getGimnasios(),
      getAddresses(),
    ]);
    dispatch({
      type: 'LOADED',
      payload: {
        reservas: reservasRes.data.reservas,
        total: reservasRes.data.total,
        hasMore: reservasRes.data.hasMore,
        streak: streakRes.data,
        gimnasios: gimnasiosRes.data,
        userAddresses: addressesRes.data,
      },
    });
  } catch {
    dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los datos.' });
  }
}

async function loadMoreReservas(dispatch, offset) {
  dispatch({ type: 'LOADING_MORE' });
  try {
    const { data } = await getReservas({ limit: PAGE_SIZE, offset });
    dispatch({
      type: 'APPEND_RESERVAS',
      payload: { reservas: data.reservas, total: data.total, hasMore: data.hasMore },
    });
  } catch {
    dispatch({ type: 'LOADING_MORE_DONE' });
  }
}

// Tras crear/eliminar: recarga las reservas ya visibles y la racha (aparte).
async function refreshReservas(dispatch, loadedCount) {
  try {
    const limit = Math.max(PAGE_SIZE, loadedCount);
    const [reservasRes, streakRes] = await Promise.all([
      getReservas({ limit, offset: 0 }),
      getStreak(),
    ]);
    dispatch({
      type: 'SET_RESERVAS',
      payload: {
        reservas: reservasRes.data.reservas,
        total: reservasRes.data.total,
        hasMore: reservasRes.data.hasMore,
      },
    });
    dispatch({ type: 'SET_STREAK', payload: streakRes.data });
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

function fmtDate(d, config = {
  day: '2-digit', month: 'short', timeZone: 'America/Bogota'
}) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', config);
}

function fmtTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':');
  return `${h}:${m}`;
}

// ── Components ────────────────────────────────────────────────────────────────

function TimeField({ label, id, registration, error, readOnly, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="time"
        readOnly={readOnly}
        className={inputClasses({ error: !!error, readOnly, extra: 'min-w-0' })}
        {...registration}
        {...props}
      />
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
    <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
      <Controller
        name="gimnasio_id"
        control={control}
        rules={{ required: 'Requerido' }}
        render={({ field }) => (
          <Combobox
            label="Gimnasio"
            options={gimnasioOptions}
            value={field.value}
            onChange={field.onChange}
            error={errors.gimnasio_id?.message}
            placeholder="Selecciona una sede"
          />
        )}
      />

      <Controller
        name="address_id"
        control={control}
        rules={{ required: 'Requerido' }}
        render={({ field }) => (
          <Combobox
            label="Dirección"
            options={userAddresses.map((a) => ({
              value: a.id,
              label: a.label || formatAddress(a),
              subtitle: [a.city, a.department].filter(Boolean).join(', '),
            }))}
            value={field.value}
            onChange={field.onChange}
            error={errors.address_id?.message}
            placeholder="Selecciona una dirección"
            emptyValue={null}
          />
        )}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="reservation_date">Fecha</label>
          <input
            id="reservation_date"
            type="date"
            className={inputClasses({ error: !!errors.reservation_date })}
            {...register('reservation_date', { required: 'Requerido' })}
          />
          {errors.reservation_date && <p className="text-xs text-red-600">{errors.reservation_date.message}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TimeField label="Hora inicio" id="start_time"
            registration={register('start_time', { required: 'Requerido' })}
            error={errors.start_time?.message}
            step="3600"
          />
          <TimeField label="Hora fin" id="end_time_display"
            registration={{}}
            value={addOneHour(watch('start_time'))}
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? 'Guardando…' : 'Reservar'}
        </Button>
      </div>
    </form>
  );
}

function ReservaModal({ open, title, onClose, children }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-slate-800">{title}</DialogTitle>
            <button onClick={onClose} aria-label="Cerrar"
              className="text-slate-400 hover:text-slate-600 transition cursor-pointer text-lg leading-none">
              <XMarkIcon className="size-6" />
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
      await refreshReservas(dispatch, state.reservas.length + 1);
      setModalOpen(false);
      showToast('Reserva creada exitosamente');
    } catch (err) {
      showToast(err?.data?.message || 'Error al guardar la reserva.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReserva(id);
      dispatch({
        type: 'SET_RESERVAS',
        payload: {
          reservas: state.reservas.filter((r) => r.id !== id),
          total: Math.max(0, state.total - 1),
          hasMore: state.hasMore,
        },
      });
      // La racha se recalcula en el backend (aparte de la lista).
      const { data } = await getStreak();
      dispatch({ type: 'SET_STREAK', payload: data });
      showToast('Reserva eliminada');
    } catch (err) {
      showToast(err?.data?.message || 'Error al eliminar la reserva.', 'error');
    }
  };

  const openAdd = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (state.loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 w-full">
        <p className="text-sm text-slate-400 text-center py-8">Cargando…</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-4 w-full flex flex-1 flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Mis reservas</h2>
          <Button onClick={openAdd} className="w-full sm:w-max">
            Nueva reserva
          </Button>
        </div>

        {state.reservas.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No tienes reservas activas.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {state.reservas.map(r => (
              <div className="border border-slate-200 rounded-lg p-2 flex gap-2 items-center justify-between" key={r.id}>
                <div className="flex gap-2 items-center">
                  <div className="flex justify-center items-center size-10 rounded-md bg-indigo-50 text-indigo-600">
                    <CalendarIcon className="size-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{r.gimnasio?.idrd_id}</span>
                    <span className="text-xs text-slate-400">{r.gimnasio?.park}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-slate-800">{fmtDate(r.reservation_date)}</span>
                    <span className="text-xs text-slate-400">{fmtTime(r.start_time)} - {fmtTime(r.end_time)}</span>
                  </div>
                  <button onClick={() => handleDelete(r.id)}
                    className={clsx("text-red-500 hover:text-red-700 transition cursor-pointer size-10 rounded-md", 
                      "flex justify-center items-center bg-red-100")}>
                    <TrashIcon className="size-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {state.hasMore && (
          <button
            onClick={() => loadMoreReservas(dispatch, state.reservas.length)}
            disabled={state.loadingMore}
            className="mx-auto text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 transition cursor-pointer"
          >
            {state.loadingMore ? 'Cargando…' : 'Cargar más'}
          </button>
        )}

        {state.total > 0 && (
          <p className="text-center text-xs text-slate-400">
            Mostrando {state.reservas.length} de {state.total}
          </p>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-lg font-medium">Hola, {user?.first_name}</p>
        <p className="text-slate-500 text-sm">Has iniciado sesión en el portal IRDR.</p>
      </div>
      <StreakPanel current={state.streak.current} longest={state.streak.longest} loading={state.loading} />
      <ReservasSection state={state} dispatch={dispatch} />
    </div>
  );
}
