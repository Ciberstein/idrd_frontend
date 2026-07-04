import { useMemo } from 'react';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { computeStreaks } from '../utils/streaks';

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900">
          {value}
          <span className="ml-1 text-sm font-medium text-slate-400">
            {value === 1 ? 'día' : 'días'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function StreakPanel({ reservas, loading }) {
  const { current, longest } = useMemo(() => computeStreaks(reservas), [reservas]);

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Tu racha</h2>
        <span className="text-xs text-slate-400">Se permite 1 descanso por semana</span>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">Cargando…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard icon={FireIcon} label="Racha actual" value={current} tone="indigo" />
          <StatCard icon={TrophyIcon} label="Racha máxima" value={longest} tone="amber" />
        </div>
      )}
    </section>
  );
}
