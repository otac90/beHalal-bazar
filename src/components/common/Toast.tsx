import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div 
      id="toast-container" 
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-sm backdrop-blur-md ${
                isSuccess
                  ? 'bg-[#123D2A]/95 text-white border-[#F5C518]/30 shadow-[#123D2A]/10'
                  : isWarning
                  ? 'bg-amber-900/95 text-amber-50 border-amber-500/40 shadow-amber-900/20'
                  : isError
                  ? 'bg-red-900/95 text-red-50 border-red-500/40 shadow-red-900/20'
                  : 'bg-slate-900/95 text-slate-100 border-slate-700/50 shadow-slate-900/20'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#F5C518]" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {isError && <XCircle className="w-5 h-5 text-red-400" />}
                {isInfo && <Info className="w-5 h-5 text-sky-400" />}
              </div>

              <div className="flex-1 text-xs leading-relaxed font-medium">
                {toast.message}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white p-0.5 rounded-md transition-colors"
                aria-label="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export const Toast = ToastContainer;
