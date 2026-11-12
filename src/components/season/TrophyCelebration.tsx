import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { Award, ArrowRight } from 'lucide-react';

export const TrophyCelebration: React.FC = () => {
  const {
    isTrophyModalOpen,
    setTrophyModalOpen,
    championTeam,
    userTeamId,
    seasonAwards,
    profile,
    startNextSeason,
    setScreen,
  } = useGameStore();

  if (!isTrophyModalOpen || !championTeam) return null;

  const isUserWinner = championTeam.id === userTeamId;

  const handleStartNextSeason = () => {
    startNextSeason();
  };

  const handleReturnMenu = () => {
    setTrophyModalOpen(false);
    setScreen('menu');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.8, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-2xl w-full rounded-2xl sm:rounded-3xl bg-white border-2 sm:border-4 border-amber-400 p-5 sm:p-8 shadow-2xl text-center overflow-hidden my-auto"
        >
          {/* Trophy Graphic */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <motion.div
              animate={{ rotate: [-2, 2, -2], y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="relative"
            >
              <div className="flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 shadow-xl text-3xl sm:text-5xl">
                🏆
              </div>
            </motion.div>
          </div>

          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-800">
            PREMIER LEAGUE 2026 CHAMPIONS
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1 uppercase tracking-tight">
            {championTeam.name}
          </h1>

          {isUserWinner ? (
            <p className="text-sm font-bold text-emerald-700 mt-2">
              🎉 Congratulations, Boss! Your tactical genius at the auction table and starting lineup has delivered cricket silverware!
            </p>
          ) : (
            <p className="text-xs text-slate-600 mt-2">
              {championTeam.name} reigns supreme after a sensational tournament campaign!
            </p>
          )}

          {/* Season Honors & Caps Grid */}
          {seasonAwards && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-left">
              {/* Orange Cap */}
              <div className="rounded-2xl bg-orange-50/70 border border-orange-200 p-3.5">
                <div className="flex items-center gap-1.5 text-orange-800 text-xs font-bold uppercase mb-1">
                  <span>🧢</span>
                  <span>Orange Cap</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 truncate">
                  {seasonAwards.orangeCap.playerName}
                </div>
                <div className="text-xs text-orange-700 font-mono font-bold mt-0.5">
                  {seasonAwards.orangeCap.runs} Runs (SR {seasonAwards.orangeCap.strikeRate})
                </div>
              </div>

              {/* Purple Cap */}
              <div className="rounded-2xl bg-purple-50/70 border border-purple-200 p-3.5">
                <div className="flex items-center gap-1.5 text-purple-800 text-xs font-bold uppercase mb-1">
                  <span>🟣</span>
                  <span>Purple Cap</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 truncate">
                  {seasonAwards.purpleCap.playerName}
                </div>
                <div className="text-xs text-purple-700 font-mono font-bold mt-0.5">
                  {seasonAwards.purpleCap.wickets} Wickets (Econ {seasonAwards.purpleCap.economy})
                </div>
              </div>

              {/* MVP */}
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-3.5">
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase mb-1">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>MVP of Season</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 truncate">
                  {seasonAwards.mvp.playerName}
                </div>
                <div className="text-xs text-amber-700 font-mono font-bold mt-0.5">
                  {seasonAwards.mvp.points} Impact Pts
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartNextSeason}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>START SEASON #{profile.totalSeasons + 1} AUCTION</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleReturnMenu}
              className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors border border-slate-200 shadow-sm"
            >
              Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
