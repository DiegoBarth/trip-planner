import React, { createContext, useContext, useState, useCallback } from 'react';
import { TOAST_DEFAULT_DURATION_MS } from '@/config/constants';
import ToastContainer from '@/contexts/toast/ToastContainer';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  add: (message: string, type: Toast['type'], duration?: number) => void;
  remove: (id: number) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((
    message: string,
    type: Toast['type'],
    duration: number = TOAST_DEFAULT_DURATION_MS
  ) => {
    const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const newToast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
  }, []);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, add, remove, clear }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    success: (msg: string, duration?: number) => context.add(msg, 'success', duration),
    error: (msg: string, duration?: number) => context.add(msg, 'error', duration),
    info: (msg: string, duration?: number) => context.add(msg, 'info', duration),
    warning: (msg: string, duration?: number) => context.add(msg, 'warning', duration),
    clear: () => context.clear(),
  };
}

export type { Toast };