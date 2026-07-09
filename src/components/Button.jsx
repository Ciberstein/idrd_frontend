// Button global de la app + fuente única del diseño de los botones.
// Cambia el look de TODOS los botones editando las variantes de este archivo.
//
// Se exporta el helper de estilo junto al componente a propósito (todo en un
// mismo archivo); eso solo afecta el Fast Refresh en dev, no el build.
/* eslint-disable react-refresh/only-export-components */

const BASE = 'transition cursor-pointer';

const VARIANTS = {
  // Acción principal (submit / confirmar).
  primary:
    'rounded-lg px-4 py-2 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed',
  // Peligro (eliminar).
  danger:
    'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50',
  // Texto plano (cancelar / volver).
  ghost: 'text-sm text-slate-500 hover:text-slate-700',
};

export const buttonClasses = ({ variant = 'primary', className = '' } = {}) => {
  return [BASE, VARIANTS[variant] ?? VARIANTS.primary, className].filter(Boolean).join(' ');
}

// Props: variant ('primary' | 'danger' | 'ghost'), className (extra), type
// (por defecto 'button'), y cualquier prop nativa del <button> (onClick, disabled…).
const Button = ({ variant = 'primary', className = '', type = 'button', ...props }) => {
  return <button type={type} className={buttonClasses({ variant, className })} {...props} />;
}

export default Button;
