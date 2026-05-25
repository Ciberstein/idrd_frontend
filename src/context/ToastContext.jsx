import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ToastContext = createContext(null);

let _nextId = 0;

function ToastItem({ toast, onDismiss }) {
  const isSuccess = toast.type === 'success';
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-72 max-w-sm pointer-events-auto animate-toast-in ${
      isSuccess
        ? 'bg-emerald-600 text-white'
        : 'bg-red-600 text-white'
    }`}>
      {isSuccess
        ? <CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
        : <XCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
      }
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition cursor-pointer mt-0.5"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++_nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
