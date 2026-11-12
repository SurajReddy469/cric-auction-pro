import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../common/Modal';
import { TeamBadge } from '../common/TeamBadge';
import { soundService } from '../../services/soundService';
import { Match } from '../../types/season';
import { Team } from '../../types/team';
import confetti from 'canvas-confetti';
import { 
  Play, 
  FastForward, 
  Trophy
} from 'lucide-react';

interface LiveMatchArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  homeTeam: Team | null;
  awayTeam: Team | null;
  onMatchComplete: (simulatedMatch: Match) => void;
  onSimulateFull: () => Match | null;
}

export const LiveMatchArenaModal: React.FC<LiveMatchArenaModalProps> = ({
  isOpen,
  onClose,
  match,
  homeTeam,
  awayTeam,
  onMatchComplete,
  onSimulateFull
}) => {
  const [currentOver, setCurrentOver] = useState<number>(0);
  const [completedMatch, setCompletedMatch] = useState<Match | null>(null);
  const [recentBalls, setRecentBalls] = useState<string[]>(['1', '0', '4', '1', '2', '6']);
  const [commentary, setCommentary] = useState<string[]>([
    '🏟️ Teams have taken the field under the stadium floodlights.',
    '🏏 Match underway with high tactical stakes!'
  ]);

  if (!isOpen || !match || !homeTeam || !awayTeam) return null;

  const isCompleted = completedMatch !== null;

  const handleNextOver = () => {
    soundService.playClick();
    const nextOverVal = currentOver + 1;

    // Generate realistic over delivery sequence
    const outcomes = ['0', '1', '1', '2', '4', '6', 'W'];
    const overBalls = Array.from({ length: 6 }, () => outcomes[Math.floor(Math.random() * outcomes.length)]);
    setRecentBalls(overBalls);

    const hasSix = overBalls.includes('6');
    const hasWicket = overBalls.includes('W');

    if (hasSix) soundService.playSix();
    else if (hasWicket) soundService.playWicket();

    const newComment = hasSix 
      ? `💥 Over ${nextOverVal}.0: Smashed into the upper tiers! Maximum SIX!` 
      : hasWicket 
      ? `⚡ Over ${nextOverVal}.0: OUT! Clean bowled! Timber disturbed!` 
      : `🏏 Over ${nextOverVal}.0: Tidy over with disciplined line and length.`;

    setCommentary(prev => [newComment, ...prev.slice(0, 3)]);
    setCurrentOver(nextOverVal);

    if (nextOverVal >= 20) {
      handleFinishMatch();
    }
  };

  const handleFinishMatch = () => {
    const sim = onSimulateFull();
    if (sim) {
      setCompletedMatch(sim);
      setCurrentOver(20);
      soundService.playTrophyFanfare();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleModalClose = () => {
    if (completedMatch) {
      onMatchComplete(completedMatch);
    }
    onClose();
  };

  const inn1 = completedMatch?.innings1;
  const inn2 = completedMatch?.innings2;

  // Deriving live displayed runs matching progress towards final score
  const displayInn1Runs = completedMatch && inn1 
    ? inn1.totalRuns 
    : Math.floor(Math.min(currentOver, 20) * 8.4);
  const displayInn1Wickets = completedMatch && inn1 
    ? inn1.totalWickets 
    : Math.min(5, Math.floor(currentOver / 4));

  const displayInn2Runs = completedMatch && inn2 
    ? inn2.totalRuns 
    : currentOver >= 10 ? Math.floor((currentOver - 10) * 8.2) : null;
  const displayInn2Wickets = completedMatch && inn2 
    ? inn2.totalWickets 
    : currentOver >= 10 ? Math.min(4, Math.floor((currentOver - 10) / 4)) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="IPL Live Match Arena"
      subtitle={`${homeTeam.name} vs ${awayTeam.name} • ${homeTeam.stadium}`}
      maxWidth="3xl"
    >
      <div className="space-y-4 sm:space-y-6">
        
        {/* Live Broadcast Scoreboard Header */}
        <div className="rounded-3xl bg-slate-900 text-white p-4 sm:p-6 shadow-xl border border-slate-800">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                {isCompleted ? 'FINAL RESULT' : 'LIVE 20-OVER MATCH'}
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-slate-400">
              Over {Math.min(currentOver, 20)} / 20.0
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Home Team */}
            <div className="flex items-center gap-3">
              <TeamBadge teamId={homeTeam.id} size="md" />
              <div>
                <span className="text-xs sm:text-sm font-black text-slate-200 block truncate">
                  {homeTeam.shortName}
                </span>
                <span className="text-xl sm:text-3xl font-black text-amber-400 font-mono">
                  {displayInn1Runs}/{displayInn1Wickets}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  ({isCompleted && inn1 ? inn1.totalOvers : Math.min(currentOver, 20)} ov)
                </span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-end gap-3 text-right">
              <div>
                <span className="text-xs sm:text-sm font-black text-slate-200 block truncate">
                  {awayTeam.shortName}
                </span>
                <span className="text-xl sm:text-3xl font-black text-amber-400 font-mono">
                  {displayInn2Runs !== null ? `${displayInn2Runs}/${displayInn2Wickets}` : 'Yet to Bat'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {displayInn2Runs !== null ? (isCompleted && inn2 ? `(${inn2.totalOvers} ov)` : `(${currentOver - 10} ov)`) : '-'}
                </span>
              </div>
              <TeamBadge teamId={awayTeam.id} size="md" />
            </div>
          </div>

          {/* Win Predictor Meter */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>{homeTeam.shortName} (54%)</span>
              <span className="uppercase tracking-wider">Win Predictor</span>
              <span>{awayTeam.shortName} (46%)</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div className="h-full bg-amber-500 w-[54%]" />
              <div className="h-full bg-sky-500 w-[46%]" />
            </div>
          </div>
        </div>

        {/* Cricket Pitch Action Field */}
        <div className="rounded-3xl bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-900 p-5 sm:p-6 text-white shadow-lg relative overflow-hidden border border-emerald-600">
          
          {/* Pitch Crease Visual */}
          <div className="mx-auto max-w-sm rounded-2xl bg-amber-100/20 border border-amber-200/30 p-4 text-center backdrop-blur-sm">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-200 block mb-2">
              RECENT BALL OUTCOMES (OVER {currentOver})
            </span>
            <div className="flex items-center justify-center gap-2">
              {recentBalls.map((b, idx) => (
                <span
                  key={idx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                    b === '6'
                      ? 'bg-rose-500 text-white animate-bounce'
                      : b === '4'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : b === 'W'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-white/90 text-slate-900'
                  }`}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Live Action Commentary Box */}
          <div className="mt-4 rounded-xl bg-black/40 p-3 text-xs space-y-1 font-semibold text-emerald-100 border border-emerald-500/30">
            {commentary.map((c, i) => (
              <div key={i} className="truncate">
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Post-Match Winner Banner */}
        {isCompleted && completedMatch && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-3xl bg-amber-50 border border-amber-300 p-4 sm:p-5 text-center shadow-md"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>MATCH RESULT</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900">
              {completedMatch.margin ? `${completedMatch.winnerTeamId === homeTeam.id ? homeTeam.name : awayTeam.name} ${completedMatch.margin}` : 'Match Completed!'}
            </h3>
            {completedMatch.playerOfTheMatch && (
              <p className="text-xs text-amber-900 font-bold mt-1">
                ⭐ Player of the Match: <span className="font-black">{completedMatch.playerOfTheMatch.playerName}</span> ({completedMatch.playerOfTheMatch.performance})
              </p>
            )}
          </motion.div>
        )}

        {/* Interactive Match Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!isCompleted ? (
            <>
              <button
                onClick={handleNextOver}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>BOWL NEXT OVER (OVER {currentOver + 1})</span>
              </button>

              <button
                onClick={handleFinishMatch}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FastForward className="w-4 h-4 text-amber-400" />
                <span>FAST SIMULATE FINISH</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleModalClose}
              className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl transition-all"
            >
              VIEW SCORECARD & STANDINGS ➔
            </button>
          )}
        </div>

      </div>
    </Modal>
  );
};
