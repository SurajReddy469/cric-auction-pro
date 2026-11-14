import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { XCircle } from 'lucide-react';

export const UnsoldOverlay: React.FC = () => {
  const { auction } = useGameStore();

  if (auction.phase !== 'unsold' || !auction.currentPlayer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm pointer-events-none">
        <motion.div
          initial={{ scale: 0.5, rotate: -4, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 16, stiffness: 220 }}
          className="relative max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 border-4 border-rose-500/80 p-6 sm:p-8 shadow-2xl text-center overflow-hidden"
        >
          {/* Official Broadcast UNSOLD Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border-2 border-rose-500 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-black tracking-widest uppercase shadow-sm">
            <XCircle className="h-4 w-4 stroke-[3]" />
            <span>UNSOLD LOT</span>
          </div>

          <div className="my-4">
            <div className="inline-block px-4 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {auction.currentPlayer.role} · {auction.currentPlayer.country}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {auction.currentPlayer.name}
            </h3>
          </div>

          <div className="rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 p-4">
            <p className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
              No bids placed at Base Price of <span className="font-black text-rose-600 dark:text-rose-400 font-mono">₹{auction.currentPlayer.basePrice.toFixed(2)} Cr</span>.
            </p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Will return to the hammer in the accelerated auction rounds.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
