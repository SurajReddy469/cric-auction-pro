import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { XCircle } from 'lucide-react';

export const UnsoldOverlay: React.FC = () => {
  const { auction } = useGameStore();

  if (auction.phase !== 'unsold' || !auction.currentPlayer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm pointer-events-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="max-w-md w-full rounded-3xl bg-white border-2 border-slate-300 p-8 shadow-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-100 text-slate-700 font-black text-xl uppercase tracking-widest border border-slate-300 mb-4">
            <XCircle className="w-6 h-6 text-slate-500" />
            <span>UNSOLD</span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mt-2">
            {auction.currentPlayer.name}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            No bids registered at Base Price of ₹{auction.currentPlayer.basePrice.toFixed(2)} Cr. Will return in accelerated rounds.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
