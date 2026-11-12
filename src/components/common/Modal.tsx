import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        // Focus trap
        if (e.key === 'Tab' && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
              last.focus();
              e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      // Focus first element in modal
      setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector<HTMLElement>(
            'button, [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) firstFocusable.focus();
        }
      }, 50);

      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleKeyDown);
        if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
          previouslyFocusedRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  const maxWMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWMap[maxWidth]} max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 text-slate-800`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50/80">
              <div className="min-w-0 pr-2">
                <h3 id="modal-title" className="text-base sm:text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2 truncate">
                  <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="truncate">{title}</span>
                </h3>
                {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
