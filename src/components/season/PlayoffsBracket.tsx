import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { Trophy, Play } from 'lucide-react';

export const PlayoffsBracket: React.FC = () => {
  const {
    playoffMatches,
    playoffStage,
    progressPlayoffs,
    teams,
    viewMatchScorecard,
    championTeam
  } = useGameStore();

  const getTeam = (id?: string) => teams.find(t => t.id === id);

  const q1 = playoffMatches.find(m => m.playoffStage === 'Qualifier 1');
  const elim = playoffMatches.find(m => m.playoffStage === 'Eliminator');
  const q2 = playoffMatches.find(m => m.playoffStage === 'Qualifier 2');
  const finalMatch = playoffMatches.find(m => m.playoffStage === 'Final');

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-600" />
            CHAMPIONSHIP PLAYOFFS BRACKET
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-0.5">The Road to the Trophy</h2>
        </div>

        {playoffStage !== 'completed' && (
          <button
            onClick={progressPlayoffs}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>
              {playoffStage === 'not_started'
                ? 'SIMULATE QUALIFIER 1 & ELIMINATOR'
                : playoffStage === 'qualifier_1'
                ? 'SIMULATE QUALIFIER 2'
                : 'SIMULATE GRAND FINAL'}
            </span>
          </button>
        )}
      </div>

      {/* Bracket Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Stage 1: Q1 and Eliminator */}
        <div className="space-y-4">
          {/* Qualifier 1 */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-2">
              QUALIFIER 1 (1st vs 2nd)
            </span>
            {q1 ? (
              <div 
                onClick={() => viewMatchScorecard(q1)}
                className="cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TeamBadge teamId={q1.homeTeamId} size="sm" />
                    <span className="font-bold text-slate-900 group-hover:text-amber-700">{getTeam(q1.homeTeamId)?.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700">
                    {q1.innings1?.teamId === q1.homeTeamId ? q1.innings1.totalRuns : q1.innings2?.totalRuns}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TeamBadge teamId={q1.awayTeamId} size="sm" />
                    <span className="font-bold text-slate-900 group-hover:text-amber-700">{getTeam(q1.awayTeamId)?.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700">
                    {q1.innings1?.teamId === q1.awayTeamId ? q1.innings1.totalRuns : q1.innings2?.totalRuns}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold pt-1 border-t border-slate-200">
                  ✓ {getTeam(q1.winnerTeamId)?.shortName} {q1.margin} (Advanced to Final)
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Waiting for league stage conclusion...</p>
            )}
          </div>

          {/* Eliminator */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block mb-2">
              ELIMINATOR (3rd vs 4th)
            </span>
            {elim ? (
              <div 
                onClick={() => viewMatchScorecard(elim)}
                className="cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TeamBadge teamId={elim.homeTeamId} size="sm" />
                    <span className="font-bold text-slate-900 group-hover:text-sky-700">{getTeam(elim.homeTeamId)?.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700">
                    {elim.innings1?.teamId === elim.homeTeamId ? elim.innings1.totalRuns : elim.innings2?.totalRuns}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TeamBadge teamId={elim.awayTeamId} size="sm" />
                    <span className="font-bold text-slate-900 group-hover:text-sky-700">{getTeam(elim.awayTeamId)?.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700">
                    {elim.innings1?.teamId === elim.awayTeamId ? elim.innings1.totalRuns : elim.innings2?.totalRuns}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold pt-1 border-t border-slate-200">
                  ✓ {getTeam(elim.winnerTeamId)?.shortName} won (Advanced to Q2)
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Waiting for league stage conclusion...</p>
            )}
          </div>
        </div>

        {/* Stage 2: Qualifier 2 */}
        <div>
          <div className="rounded-2xl bg-purple-50/60 border border-purple-200 p-4 relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block mb-2">
              QUALIFIER 2 (Loser Q1 vs Winner Elim)
            </span>
            {q2 ? (
              <div 
                onClick={() => viewMatchScorecard(q2)}
                className="cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TeamBadge teamId={q2.homeTeamId} size="sm" />
                    <span className="font-bold text-slate-900 group-hover:text-purple-700">{getTeam(q2.homeTeamId)?.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700">
                    {q2.innings1?.teamId === q2.homeTeamId ? q2.innings1.totalRuns : q2.innings2?.totalRuns}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TeamBadge teamId={q2.awayTeamId} size="sm" />
                    <span className="font-bold text-slate-900 group-hover:text-purple-700">{getTeam(q2.awayTeamId)?.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700">
                    {q2.innings1?.teamId === q2.awayTeamId ? q2.innings1.totalRuns : q2.innings2?.totalRuns}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold pt-1 border-t border-purple-200">
                  ✓ {getTeam(q2.winnerTeamId)?.shortName} {q2.margin} (Advanced to Final)
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Determined after Q1 and Eliminator.</p>
            )}
          </div>
        </div>

        {/* Stage 3: Grand Final */}
        <div>
          <div className="rounded-3xl bg-gradient-to-b from-amber-50 to-white border-2 border-amber-400 p-5 shadow-md relative overflow-hidden">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 block mb-3 text-center">
              👑 PREMIER LEAGUE GRAND FINAL
            </span>
            {finalMatch ? (
              <div 
                onClick={() => viewMatchScorecard(finalMatch)}
                className="cursor-pointer space-y-3 group text-center"
              >
                <div className="flex items-center justify-center gap-4 my-2">
                  <div className="flex flex-col items-center">
                    <TeamBadge teamId={finalMatch.homeTeamId} size="md" />
                    <span className="text-xs font-extrabold text-slate-900 mt-1">{getTeam(finalMatch.homeTeamId)?.shortName}</span>
                  </div>
                  <span className="text-sm font-black text-amber-700">VS</span>
                  <div className="flex flex-col items-center">
                    <TeamBadge teamId={finalMatch.awayTeamId} size="md" />
                    <span className="text-xs font-extrabold text-slate-900 mt-1">{getTeam(finalMatch.awayTeamId)?.shortName}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-amber-200 text-xs">
                  <span className="font-bold text-emerald-700 block">
                    CHAMPION: {championTeam?.name} 🏆
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {finalMatch.margin}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-50" />
                <span>The ultimate showdown awaits the top two contenders</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
