import { useState, useEffect } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'error', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};

const Toast = ({ id, message, type, onRemove }) => {
  const bgColor = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type] || 'bg-gray-500';

  const icon = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  }[type] || '📢';

  return (
    <div
      className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between gap-4 animate-slide-in`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span>{message}</span>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="text-white hover:text-gray-200 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
