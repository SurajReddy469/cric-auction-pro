import React from 'react';
import { LeagueStanding } from '../../types/season';
import { TeamBadge } from '../common/TeamBadge';
import { Trophy } from 'lucide-react';

interface LeagueTableProps {
  standings: LeagueStanding[];
  userTeamId: string;
}

export const LeagueTable: React.FC<LeagueTableProps> = ({ standings, userTeamId }) => {
  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600" />
            OFFICIAL LEAGUE STANDINGS
          </h3>
          <span className="text-[11px] text-slate-500">Top 4 Franchises Qualify for Championship Playoffs</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Pos</th>
              <th className="py-3 px-4">Franchise</th>
              <th className="py-3 px-2 text-center">P</th>
              <th className="py-3 px-2 text-center">W</th>
              <th className="py-3 px-2 text-center">L</th>
              <th className="py-3 px-3 text-center">Pts</th>
              <th className="py-3 px-3 text-right">NRR</th>
              <th className="py-3 px-4 text-center">Recent Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {standings.map((team, idx) => {
              const isUser = team.teamId === userTeamId;
              const isPlayoffSpot = idx < 4;

              return (
                <tr
                  key={team.teamId}
                  className={`transition-colors ${
                    isUser
                      ? 'bg-amber-50/80 font-bold text-slate-900'
                      : isPlayoffSpot
                      ? 'hover:bg-slate-50 text-slate-800'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs ${
                      isPlayoffSpot ? 'bg-amber-100 text-amber-800 border border-amber-300 font-black' : 'text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <TeamBadge teamId={team.teamId} size="sm" />
                      <div>
                        <span className="font-extrabold text-slate-900 block">
                          {team.teamName} {isUser && <span className="text-[10px] text-amber-700 font-bold">(You)</span>}
                        </span>
                        {isPlayoffSpot && (
                          <span className="text-[9px] text-emerald-700 font-bold tracking-wider uppercase">
                            Playoff Zone
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-2 text-center font-mono font-semibold">{team.played}</td>
                  <td className="py-3 px-2 text-center font-mono text-emerald-700 font-bold">{team.won}</td>
                  <td className="py-3 px-2 text-center font-mono text-rose-700 font-semibold">{team.lost}</td>
                  <td className="py-3 px-3 text-center font-mono text-sm font-black text-amber-700">
                    {team.points}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold">
                    <span className={team.nrr >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700'}>
                      {team.nrr >= 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3)}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {team.form.length > 0 ? (
                        team.form.map((res, i) => (
                          <span
                            key={i}
                            className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${
                              res === 'W' ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                            }`}
                          >
                            {res}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
