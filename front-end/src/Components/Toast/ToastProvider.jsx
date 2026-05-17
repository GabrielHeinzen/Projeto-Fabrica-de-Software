import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import './ToastProvider.css';

const ToastContext = createContext(null);

const iconMap = {
  success: 'OK',
  error: 'X',
  warning: '!',
  info: 'i'
};

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, variant = 'info', options = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const duration = typeof options.duration === 'number' ? options.duration : 4200;

      const toast = {
        id,
        message,
        variant,
        title: options.title || null,
        duration
      };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-layer" role="status" aria-live="polite" aria-atomic="true">
        {toasts.map((toast, index) => (
          <div
            className={`toast toast--${toast.variant}`}
            key={toast.id}
            style={{ '--toast-index': index }}
          >
            <div className="toast__icon" aria-hidden="true">
              {iconMap[toast.variant] || iconMap.info}
            </div>
            <div className="toast__content">
              {toast.title && <span className="toast__title">{toast.title}</span>}
              <span className="toast__message">{toast.message}</span>
            </div>
            <button
              type="button"
              className="toast__close"
              aria-label="Fechar notificacao"
              onClick={() => removeToast(toast.id)}
            >
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};

export { ToastProvider, useToast };
