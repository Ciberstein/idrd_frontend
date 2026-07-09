// Input global de la app + fuente única del diseño de TODOS los inputs.
// Cambia el look de los campos (text, select, date, time, password, código…)
// editando solo las funciones de estilo de este archivo.
//
// Se exportan helpers de estilo junto al componente a propósito (todo en un
// mismo archivo); eso solo afecta el Fast Refresh en dev, no el build.
/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// Estilos base compartidos por los inputs estándar.
export const inputClasses = ({ error = false, readOnly = false, extra = '' } = {}) => {
  return [
    'w-full px-3 py-2 rounded-xl lg:rounded-lg border text-slate-900 placeholder-slate-400 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition',
    error ? 'border-red-400' : 'border-slate-200',
    readOnly ? 'bg-slate-50 text-slate-500 cursor-default' : '',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

// Variante para inputs de código/OTP (grande, centrado, monoespaciado).
export const codeInputClasses = ({ error = false } = {}) => {
  return [
    'w-full px-3 py-3 rounded-xl lg:rounded-lg border text-slate-900 placeholder-slate-400',
    'text-center text-xl tracking-widest font-mono',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition',
    error ? 'border-red-400' : 'border-slate-200',
  ]
    .filter(Boolean)
    .join(' ');
}

// Estilos compartidos de la etiqueta y el mensaje de error de un campo.
export const labelClass = 'text-sm font-medium text-slate-700 flex gap-1';
export const errorClass = 'text-xs text-red-600';

// Componente de campo: etiqueta + input + mensaje de error.
// Con type="password" añade automáticamente el botón de mostrar/ocultar.
// Props: label, id, optional, error (string), className (extra), y cualquier
// prop nativa del <input> (type, placeholder, value, readOnly, register…).
const Input = ({ label, id, optional, error, className = '', type = 'text', ...props }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && show ? 'text' : type;

  const field = (
    <input
      id={id}
      type={inputType}
      className={inputClasses({
        error: !!error,
        readOnly: props.readOnly,
        extra: [isPassword && 'pr-10', className].filter(Boolean).join(' '),
      })}
      {...props}
    />
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={labelClass} htmlFor={id}>
          {label}
          {optional && <span className="text-slate-400 font-normal">(opcional)</span>}
        </label>
      )}

      {isPassword ? (
        <div className="relative">
          {field}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            {show ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        field
      )}

      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

export default Input;
