import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { Award } from 'lucide-react';

export const MatchScorecardModal: React.FC = () => {
  const { isMatchModalOpen, setMatchModalOpen, activeScorecardMatch, teams } = useGameStore();
  const [activeTab, setActiveTab] = useState<'inn1' | 'inn2'>('inn1');

  if (!activeScorecardMatch || !activeScorecardMatch.innings1 || !activeScorecardMatch.innings2) return null;

  const match = activeScorecardMatch;
  const inn1 = match.innings1!;
  const inn2 = match.innings2!;

  const team1 = teams.find(t => t.id === inn1.teamId);
  const team2 = teams.find(t => t.id === inn2.teamId);
  const winningTeam = teams.find(t => t.id === match.winnerTeamId);

  const activeInnings = activeTab === 'inn1' ? inn1 : inn2;

  return (
    <Modal
      isOpen={isMatchModalOpen}
      onClose={() => setMatchModalOpen(false)}
      title="Official Match Scorecard"
      subtitle={`${match.dateStr} • ${match.venue}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Match Result Banner */}
        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Team 1 Score */}
            <div className="flex items-center gap-3">
              {team1 && <TeamBadge teamId={team1.id} size="md" />}
              <div>
                <span className="text-sm font-bold text-slate-800 block">{inn1.teamName}</span>
                <span className="text-2xl font-black text-amber-700 font-mono">
                  {inn1.totalRuns}/{inn1.totalWickets}
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  ({inn1.totalOvers} ov)
                </span>
              </div>
            </div>

            {/* Team 2 Score */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-sm font-bold text-slate-800 block">{inn2.teamName}</span>
                <span className="text-2xl font-black text-amber-700 font-mono">
                  {inn2.totalRuns}/{inn2.totalWickets}
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  ({inn2.totalOvers} ov)
                </span>
              </div>
              {team2 && <TeamBadge teamId={team2.id} size="md" />}
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="text-center py-2 px-4 rounded-2xl bg-amber-100/70 border border-amber-300 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
            🏆 {winningTeam?.name} {match.margin}
          </div>
        </div>

        {/* Player of the Match Card */}
        {match.playerOfTheMatch && (
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-600" />
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  PLAYER OF THE MATCH
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {match.playerOfTheMatch.playerName}
                </span>
              </div>
            </div>
            <span className="text-amber-800 font-mono font-black text-xs">
              {match.playerOfTheMatch.performance}
            </span>
          </div>
        )}

        {/* Innings Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('inn1')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inn1'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            1st Inn: {inn1.teamName} ({inn1.totalRuns}/{inn1.totalWickets})
          </button>
          <button
            onClick={() => setActiveTab('inn2')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inn2'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            2nd Inn: {inn2.teamName} ({inn2.totalRuns}/{inn2.totalWickets})
          </button>
        </div>

        {/* Batting Scorecard Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
            Batting Card
          </h4>
          <div className="rounded-2xl overflow-x-auto border border-slate-200 bg-white">
            <table className="w-full text-left text-xs min-w-[340px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Batter</th>
                  <th className="py-2.5 px-2">Dismissal</th>
                  <th className="py-2.5 px-2 text-right">R</th>
                  <th className="py-2.5 px-2 text-right">B</th>
                  <th className="py-2.5 px-2 text-right">4s</th>
                  <th className="py-2.5 px-2 text-right">6s</th>
                  <th className="py-2.5 px-3 text-right">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {activeInnings.batting.map(b => (
                  <tr key={b.playerId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-sans font-bold text-slate-900">
                      {b.playerName} {b.isNotOut && <span className="text-amber-600 font-black">*</span>}
                    </td>
                    <td className="py-2 px-2 font-sans text-slate-500 text-[11px] truncate max-w-[120px]">
                      {b.dismissal}
                    </td>
                    <td className="py-2 px-2 text-right font-black text-amber-700 text-sm">
                      {b.runs}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-700">{b.balls}</td>
                    <td className="py-2 px-2 text-right text-slate-500">{b.fours}</td>
                    <td className="py-2 px-2 text-right text-slate-500">{b.sixes}</td>
                    <td className="py-2 px-3 text-right text-slate-700 font-semibold">{b.strikeRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bowling Scorecard Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
            Bowling Card
          </h4>
          <div className="rounded-2xl overflow-x-auto border border-slate-200 bg-white">
            <table className="w-full text-left text-xs min-w-[340px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Bowler</th>
                  <th className="py-2.5 px-2 text-center">O</th>
                  <th className="py-2.5 px-2 text-center">M</th>
                  <th className="py-2.5 px-2 text-right">R</th>
                  <th className="py-2.5 px-2 text-right">W</th>
                  <th className="py-2.5 px-3 text-right">Econ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {activeInnings.bowling.map(bw => (
                  <tr key={bw.playerId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-sans font-bold text-slate-900">{bw.playerName}</td>
                    <td className="py-2 px-2 text-center text-slate-700">{bw.overs}</td>
                    <td className="py-2 px-2 text-center text-slate-500">{bw.maidens}</td>
                    <td className="py-2 px-2 text-right text-slate-700">{bw.runs}</td>
                    <td className="py-2 px-2 text-right font-black text-rose-700 text-sm">{bw.wickets}</td>
                    <td className="py-2 px-3 text-right text-slate-700 font-semibold">{bw.economy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={() => setMatchModalOpen(false)}
          className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-xs transition-colors border border-slate-300"
        >
          Close Scorecard
        </button>
      </div>
    </Modal>
  );
};
