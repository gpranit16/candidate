'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (opts: { title: string; description?: string; variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description,
      variant = 'info',
    }: {
      title: string;
      description?: string;
      variant?: ToastVariant;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, variant }]);
      setTimeout(() => {
        dismiss(id);
      }, 4500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 w-[calc(100vw-2.5rem)] max-w-sm pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((item) => {
            const borderAccent =
              item.variant === 'success'
                ? 'border-[#C6F36B]'
                : item.variant === 'error'
                ? 'border-[#FF895D]'
                : 'border-[#A78BFA]';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.16 }}
                className={`pointer-events-auto bg-[#1B1B1B] border ${borderAccent} p-4 brutal-shadow flex items-start gap-3`}
                role="status"
              >
                <div className="mt-0.5 shrink-0">
                  {item.variant === 'success' && (
                    <CheckCircle2 className="h-4 w-4 text-[#C6F36B]" aria-hidden="true" />
                  )}
                  {item.variant === 'error' && (
                    <AlertTriangle className="h-4 w-4 text-[#FF895D]" aria-hidden="true" />
                  )}
                  {item.variant === 'info' && (
                    <Info className="h-4 w-4 text-[#A78BFA]" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-[#F5F5F0]">{item.title}</p>
                  {item.description && (
                    <p className="mt-1 text-xs text-[#969696] leading-relaxed">{item.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Dismiss notification"
                  className="text-[#969696] hover:text-[#F5F5F0] p-0.5"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

