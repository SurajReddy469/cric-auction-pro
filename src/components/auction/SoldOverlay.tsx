import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';

export const SoldOverlay: React.FC = () => {
  const { auction, teams } = useGameStore();

  if (auction.phase !== 'sold' || !auction.currentPlayer) return null;

  const buyerTeam = teams.find(t => t.id === auction.highestBidderId);
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm pointer-events-none">
        <motion.div
          initial={{ scale: 0.3, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="relative max-w-lg w-full rounded-3xl bg-white border-4 border-amber-500 p-8 shadow-2xl text-center overflow-hidden"
        >
          {/* Buyer Team Info */}
          {buyerTeam && (
            <div className="flex flex-col items-center justify-center my-3">
              <TeamBadge teamId={buyerTeam.id} size="xl" className="my-2 filter drop-shadow-md" />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                {buyerTeam.name}
              </h2>
            </div>
          )}

          {/* Player & Final Hammer Price */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mt-4">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              ACQUIRED ASSET
            </span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {auction.currentPlayer.name}
            </div>
            <div className="text-3xl font-black text-amber-700 font-mono mt-1">
              ₹{auction.currentBid.toFixed(2)} Crore
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
