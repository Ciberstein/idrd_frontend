import { useState } from 'react';
import {
  Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption,
} from '@headlessui/react';
import { DEPARTMENTS } from '../data/colombia';

export default function DepartmentCombobox({ value, onChange, error }) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? DEPARTMENTS.filter((d) => d.toLowerCase().includes(query.toLowerCase()))
    : DEPARTMENTS;

  const selected = value || null;

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">Departamento</label>
      <Combobox
        value={selected}
        onChange={(val) => { onChange(val ?? ''); setQuery(''); }}
        onClose={() => setQuery('')}
      >
        <div className="relative">
          <ComboboxInput
            className={`w-full px-3 py-2 pr-8 rounded-lg border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
              error ? 'border-red-400' : 'border-slate-200'
            }`}
            displayValue={(val) => val ?? ''}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar departamento…"
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </ComboboxButton>
        </div>
        <ComboboxOptions
          anchor="bottom"
          className="w-(--input-width) max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50 focus:outline-none empty:hidden mt-1"
        >
          {filtered.map((dep) => (
            <ComboboxOption
              key={dep}
              value={dep}
              className="px-4 py-2 text-sm text-slate-700 cursor-pointer select-none data-focus:bg-indigo-50 data-focus:text-indigo-700 data-selected:font-semibold data-selected:text-indigo-600"
            >
              {dep}
            </ComboboxOption>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-2 text-sm text-slate-400">Sin resultados</p>
          )}
        </ComboboxOptions>
      </Combobox>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
