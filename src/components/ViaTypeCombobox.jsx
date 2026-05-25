import { useState, useEffect } from 'react';
import {
  Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption,
} from '@headlessui/react';
import { getViaTypes } from '../api/auth';

export default function ViaTypeCombobox({ value, onChange, error }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    getViaTypes()
      .then(({ data }) =>
        setOptions(data.map((t) => ({ value: t.code, label: `${t.code} – ${t.name}` })))
      )
      .catch(() => {});
  }, []);

  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">Tipo de vía</label>
      <Combobox value={selected} onChange={(opt) => onChange(opt?.value ?? '')}>
        <div className="relative">
          <ComboboxInput
            readOnly
            className={`w-full px-3 py-2 pr-8 rounded-lg border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition cursor-pointer ${
              error ? 'border-red-400' : 'border-slate-200'
            }`}
            displayValue={(opt) => opt?.label ?? ''}
            placeholder="Selecciona un tipo"
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
              key={opt.value}
              value={opt}
              className="px-4 py-2 text-sm text-slate-700 cursor-pointer select-none data-focus:bg-indigo-50 data-focus:text-indigo-700 data-selected:font-semibold data-selected:text-indigo-600"
            >
              {opt.label}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
