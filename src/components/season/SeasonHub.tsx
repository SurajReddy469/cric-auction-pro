import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { LeagueTable } from './LeagueTable';
import { PlayoffsBracket } from './PlayoffsBracket';
import { MatchScorecardModal } from './MatchScorecardModal';
import { TrophyCelebration } from './TrophyCelebration';
import { LiveMatchArenaModal } from './LiveMatchArenaModal';
import { TeamBadge } from '../common/TeamBadge';
import { soundService } from '../../services/soundService';
import { 
  Play, 
  FastForward, 
  Calendar, 
  Flame,
  Radio,
  Sparkles
} from 'lucide-react';

export const SeasonHub: React.FC = () => {
  const {
    leagueMatches,
    currentMatchIndex,
    standings,
    simulateNextMatch,
    simulateAllLeagueMatches,
    viewMatchScorecard,
    userTeamId,
    teams,
  } = useGameStore();

  const [isLiveArenaOpen, setIsLiveArenaOpen] = useState<boolean>(false);

  const totalMatches = leagueMatches.length;
  const nextMatch = currentMatchIndex < totalMatches ? leagueMatches[currentMatchIndex] : null;

  const nextHomeTeam = nextMatch ? teams.find(t => t.id === nextMatch.homeTeamId) : null;
  const nextAwayTeam = nextMatch ? teams.find(t => t.id === nextMatch.awayTeamId) : null;
  const isUserPlayingNext = nextMatch ? (nextMatch.homeTeamId === userTeamId || nextMatch.awayTeamId === userTeamId) : false;

  const isLeagueStageCompleted = currentMatchIndex >= totalMatches && totalMatches > 0;

  const handleOpenLiveArena = () => {
    soundService.playClick();
    setIsLiveArenaOpen(true);
  };

  const handleFastSimNext = () => {
    soundService.playGavel();
    simulateNextMatch();
  };

  const handleFastSimAll = () => {
    soundService.playTrophyFanfare();
    simulateAllLeagueMatches();
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 min-h-[calc(100vh-65px)] flex flex-col justify-between space-y-4 sm:space-y-6">
      <div>
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200 mb-4 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-black text-amber-900 mb-1.5 uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>IPL 2026 Championship Campaign</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              TOURNAMENT <span className="text-gold-gradient">ARENA</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              56-match IPL tournament • Top 4 qualify for Playoffs (Q1, Eliminator, Q2 & Final)
            </p>
          </div>

          {/* Action Simulation Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
            {!isLeagueStageCompleted && (
              <>
                <button
                  onClick={handleOpenLiveArena}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Radio className="w-4 h-4 text-slate-950" />
                  <span>PLAY LIVE MATCH</span>
                </button>

                <button
                  onClick={handleFastSimNext}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 text-slate-700" />
                  <span>Fast-Sim 1</span>
                </button>

                <button
                  onClick={handleFastSimAll}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs transition-colors shadow-sm"
                >
                  <FastForward className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sim All 56</span>
                </button>
              </>
            )}

            {isLeagueStageCompleted && (
              <span className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-xs shadow-sm text-center">
                ✓ League Stage Completed • Playoffs Live
              </span>
            )}
          </div>
        </div>

        {/* Next Match Fixture Banner */}
        {nextMatch && nextHomeTeam && nextAwayTeam && (
          <div className={`rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 border relative overflow-hidden shadow-md transition-all ${
            isUserPlayingNext
              ? 'bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 border-amber-400 ring-2 ring-amber-300/40'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs mb-3 font-bold">
              <span className="text-amber-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px] sm:text-xs font-black">
                <Flame className="w-4 h-4 text-amber-600" />
                UPCOMING FIXTURE • {nextMatch.dateStr}
                {isUserPlayingNext && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                    YOUR MATCH
                  </span>
                )}
              </span>
              <span className="text-slate-500 text-[10px] sm:text-xs truncate max-w-[140px] sm:max-w-none">{nextMatch.venue}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <TeamBadge teamId={nextHomeTeam.id} size="md" />
                <div>
                  <h3 className="text-sm sm:text-lg font-black text-slate-900">{nextHomeTeam.name}</h3>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-semibold">Home Franchise</span>
                </div>
              </div>

              {/* Action Button inside Fixture Card */}
              <button
                onClick={handleOpenLiveArena}
                className="my-1 sm:my-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>START MATCH</span>
              </button>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-left sm:text-right">
                <div className="order-2 sm:order-1">
                  <h3 className="text-sm sm:text-lg font-black text-slate-900">{nextAwayTeam.name}</h3>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-semibold">Away Franchise</span>
                </div>
                <div className="order-1 sm:order-2">
                  <TeamBadge teamId={nextAwayTeam.id} size="md" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column: Standings on Left, Playoffs or Recent Results on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-8 items-start">
          {/* Left 7 cols: Standings */}
          <div className="lg:col-span-7">
            <LeagueTable standings={standings} userTeamId={userTeamId} />
          </div>

          {/* Right 5 cols: Playoffs or Fixture Log */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {isLeagueStageCompleted ? (
              <PlayoffsBracket />
            ) : (
              <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 pb-3 border-b border-slate-100 mb-3">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  RECENT MATCH RESULTS ({currentMatchIndex}/{totalMatches})
                </h3>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {leagueMatches.slice(0, currentMatchIndex).reverse().slice(0, 10).map(m => {
                    const home = teams.find(t => t.id === m.homeTeamId);
                    const away = teams.find(t => t.id === m.awayTeamId);
                    const winner = teams.find(t => t.id === m.winnerTeamId);
                    const isUserMatch = m.homeTeamId === userTeamId || m.awayTeamId === userTeamId;

                    return (
                      <div
                        key={m.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`View scorecard for match #${m.matchNumber}, ${home?.shortName} versus ${away?.shortName}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            soundService.playClick();
                            viewMatchScorecard(m);
                          }
                        }}
                        onClick={() => { soundService.playClick(); viewMatchScorecard(m); }}
                        className={`p-3 rounded-2xl cursor-pointer transition-all border flex items-center justify-between gap-3 ${
                          isUserMatch
                            ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            #{m.matchNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {home?.shortName} vs {away?.shortName}
                          </span>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-[11px] font-extrabold text-amber-800 block">
                            {winner?.shortName} won
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">Click for Scorecard</span>
                        </div>
                      </div>
                    );
                  })}

                  {currentMatchIndex === 0 && (
                    <div className="p-8 text-center text-xs text-slate-500 rounded-3xl border border-dashed border-slate-200 bg-slate-50/40">
                      No matches played yet. Click "PLAY LIVE MATCH" to begin!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LiveMatchArenaModal
        isOpen={isLiveArenaOpen}
        onClose={() => setIsLiveArenaOpen(false)}
        match={nextMatch}
        homeTeam={nextHomeTeam || null}
        awayTeam={nextAwayTeam || null}
        onMatchComplete={(m) => {
          setIsLiveArenaOpen(false);
          viewMatchScorecard(m);
        }}
        onSimulateFull={() => simulateNextMatch()}
      />
      <MatchScorecardModal />
      <TrophyCelebration />
    </div>
  );
};
