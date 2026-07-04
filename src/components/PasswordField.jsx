import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function PasswordField({ label, id, optional, error, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 flex gap-1" htmlFor={id}>
        {label}
        {optional && <span className="text-slate-400 font-normal">(opcional)</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={`w-full px-3 py-2 pr-10 rounded-lg border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
            error ? 'border-red-400' : 'border-slate-200'
          }`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          {show
            ? <EyeSlashIcon className="w-4 h-4" />
            : <EyeIcon className="w-4 h-4" />
          }
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
