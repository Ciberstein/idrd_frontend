import { FireIcon, TrophyIcon } from '@heroicons/react/24/outline';

const StatCard = ({ icon: Icon, label, value, tone }) => {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="size-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-medium text-slate-900">
          {value}
          <span className="ml-1 text-sm font-medium text-slate-400">
            {value === 1 ? 'día' : 'días'}
          </span>
        </p>
      </div>
    </div>
  );
}

const StreakPanel = ({ current = 0, longest = 0, loading }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 z-10">
      <StatCard icon={FireIcon} label="Racha actual" value={current} tone="indigo" />
      <StatCard icon={TrophyIcon} label="Racha máxima" value={longest} tone="amber" />
    </div>
  );
}

export default StreakPanel;
