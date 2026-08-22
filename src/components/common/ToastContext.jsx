import React, { createContext, useContext, useState, useCallback } from 'react';
import Icon from './Icons';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-emerald-900/90 text-white border-emerald-500/30',
            error: 'bg-rose-900/90 text-white border-rose-500/30',
            warning: 'bg-amber-900/90 text-white border-amber-500/30',
            info: 'bg-slate-900/95 text-white border-slate-700/60',
          }[toast.type] || 'bg-slate-900/95 text-white border-slate-700/60';

          const iconName = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'sparkles',
          }[toast.type] || 'sparkles';

          const iconColor = {
            success: 'text-emerald-400',
            error: 'text-rose-400',
            warning: 'text-amber-400',
            info: 'text-indigo-400',
          }[toast.type] || 'text-indigo-400';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-up ${typeStyles}`}
            >
              <div className="flex items-center gap-3">
                <Icon name={iconName} className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                <p className="text-sm font-medium leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-slate-400 hover:text-white rounded-md transition-colors ml-2"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
