'use client';

import React from 'react';
import { useCurator } from '@/context/CuratorContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCurator();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-2xl backdrop-blur-md border text-sm transition-all duration-300 animate-in slide-in-from-bottom-3',
              isSuccess && 'bg-[#0f1712]/95 border-emerald-500/40 text-emerald-300',
              isError && 'bg-[#1a0e12]/95 border-rose-500/40 text-rose-300',
              !isSuccess && !isError && 'bg-[#0e141a]/95 border-tiktok-cyan/40 text-tiktok-cyan'
            )}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />}
              {isError && <AlertCircle size={18} className="shrink-0 text-rose-400" />}
              {!isSuccess && !isError && <Info size={18} className="shrink-0 text-tiktok-cyan" />}
              <span className="font-medium text-white">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
