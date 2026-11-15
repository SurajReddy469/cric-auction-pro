import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { Gavel, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '../../services/soundService';

export const SoldOverlay: React.FC = () => {
  const { auction, teams, userTeamId, nextAuctionPlayer, gameMode } = useGameStore();

  const isSold = auction.phase === 'sold' && !!auction.currentPlayer;

  // Resilient resolution of buyer franchise across singleplayer, multiplayer, and admin commands
  const buyerTeam = teams.find(t => 
    t.id === auction.highestBidderId ||
    t.id === auction.currentPlayer?.soldToTeamId ||
    t.name === auction.highestBidderName ||
    t.shortName === auction.highestBidderName
  );

  const winningTeamName = buyerTeam?.name || auction.highestBidderName || 'Franchise';
  const isHumanWinner = Boolean(
    (buyerTeam && buyerTeam.id === userTeamId) ||
    (auction.highestBidderId && auction.highestBidderId === userTeamId)
  );

  // Trigger celebration effects on sold popup mount
  useEffect(() => {
    if (isSold) {
      if (isHumanWinner) {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
        });
      }
    }
  }, [isSold, isHumanWinner]);

  return (
    <AnimatePresence>
      {isSold && auction.currentPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            key={auction.currentPlayer.id || 'sold-card'}
            initial={{ scale: 0.4, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            className={`relative max-w-lg w-full rounded-3xl bg-white dark:bg-slate-900 border-4 ${
              isHumanWinner 
                ? 'border-amber-400 dark:border-amber-500 shadow-amber-500/30' 
                : 'border-emerald-500 dark:border-emerald-600 shadow-emerald-500/25'
            } p-6 sm:p-8 shadow-2xl text-center overflow-hidden`}
          >
            {/* Top Broadcast SOLD Ribbon */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-widest uppercase shadow-md ${
                isHumanWinner
                  ? 'bg-amber-500 text-slate-950 border border-amber-300'
                  : 'bg-emerald-600 text-white border border-emerald-400'
              }`}>
                <Gavel className="w-4 h-4 stroke-[2.5]" />
                <span>LOT SOLD • WINNING BID</span>
                {isHumanWinner && <Sparkles className="w-4 h-4 text-slate-950" />}
              </span>
            </div>

            {/* Human Victory Celebration Callout */}
            {isHumanWinner && (
              <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider animate-pulse">
                🎉 Congratulations! Your franchise won the bidding war!
              </div>
            )}

            {/* Buyer Franchise Crest & Identity */}
            <div className="flex flex-col items-center justify-center my-3">
              {buyerTeam ? (
                <>
                  <TeamBadge teamId={buyerTeam.id} size="xl" className="my-2 filter drop-shadow-lg" />
                  <div className="text-[11px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                    ACQUIRED BY
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">
                    {buyerTeam.name}
                  </h2>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center my-2 text-2xl font-black text-amber-600">
                    <CheckCircle2 className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {winningTeamName}
                  </h2>
                </>
              )}
            </div>

            {/* Signed Player Asset & Hammer Price */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 mt-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold uppercase">
                  {auction.currentPlayer.tier} SET
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase">
                  {auction.currentPlayer.role} • {auction.currentPlayer.country}
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {auction.currentPlayer.name}
              </div>

              <div className="flex items-baseline justify-center gap-2 mt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Hammer Price:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  ₹{auction.currentBid.toFixed(2)} Crore
                </span>
              </div>
            </div>

            {/* Controls / Auto-Advance Notice */}
            <div className="mt-5 flex items-center justify-center gap-3">
              {gameMode !== 'multiplayer' && (
                <button
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    nextAuctionPlayer();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <span>Next Lot</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>

            {/* Automated Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 2.4, ease: 'linear' }}
                className={`h-full ${isHumanWinner ? 'bg-amber-500' : 'bg-emerald-500'}`}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
