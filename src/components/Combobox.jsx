import { useState } from 'react';
import {
  Combobox as HCombobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Combobox = ({
  label,
  options = [],
  value,
  onChange,
  error,
  searchable = false,
  disabled = false,
  placeholder = 'Selecciona una opción',
  emptyValue = '',
}) => {
  const [query, setQuery] = useState('');

  const filtered = searchable && query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`text-sm font-medium ${disabled ? 'text-slate-400' : 'text-slate-700'}`}>
          {label}
        </label>
      )}
      <HCombobox
        value={selected}
        onChange={(opt) => onChange(opt?.value ?? emptyValue)}
        onClose={() => setQuery('')}
        disabled={disabled}
      >
        <div className="relative">
          <ComboboxInput
            readOnly={!searchable}
            className={`w-full px-3 py-2 pr-8 rounded-lg border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
              !searchable ? 'cursor-pointer' : ''
            } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''} ${
              error ? 'border-red-400' : 'border-slate-200'
            }`}
            displayValue={(opt) => opt?.label ?? ''}
            onChange={searchable ? (e) => setQuery(e.target.value) : undefined}
            placeholder={placeholder}
          />
          {searchable ? (
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer">
              <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            </ComboboxButton>
          ) : (
            <ComboboxButton className="absolute inset-0 flex items-center justify-end pr-2 cursor-pointer">
              <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            </ComboboxButton>
          )}
        </div>
        <ComboboxOptions
          anchor="bottom"
          className="w-(--input-width) max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg z-50 focus:outline-none empty:hidden mt-1"
        >
          {filtered.map((opt) => (
            <ComboboxOption
              key={String(opt.value)}
              value={opt}
              className="group px-4 py-2 cursor-pointer select-none data-focus:bg-indigo-50 rounded-lg"
            >
              <p className="text-sm text-slate-700 group-data-selected:font-semibold group-data-selected:text-indigo-600">
                {opt.label}
              </p>
              {opt.subtitle && (
                <p className="text-xs text-slate-400">{opt.subtitle}</p>
              )}
            </ComboboxOption>
          ))}
          {searchable && filtered.length === 0 && (
            <p className="px-4 py-2 text-sm text-slate-400">Sin resultados</p>
          )}
        </ComboboxOptions>
      </HCombobox>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default Combobox;
