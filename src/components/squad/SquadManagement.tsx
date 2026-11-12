import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { calculateTeamChemistry } from '../../services/scoutService';
import { TeamBadge } from '../common/TeamBadge';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { PitchLineup } from './PitchLineup';
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle, 
  Plus, 
  Play
} from 'lucide-react';

import { soundService } from '../../services/soundService';

export const SquadManagement: React.FC = () => {
  const { userTeam, updateStartingXI, startSeason, unlockAchievement } = useGameStore();
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const team = userTeam();
  if (!team) return null;

  const squad = team.squad;
  const chemistry = calculateTeamChemistry(team);

  // Check chemistry achievement
  if (chemistry.score >= 90) {
    unlockAchievement('ach-perfect-squad');
  }

  const startingPlayers = team.startingXI
    .map(id => squad.find(p => p.id === id))
    .filter(Boolean) as typeof squad;

  const benchPlayers = squad.filter(p => !team.startingXI.includes(p.id));

  const filteredBench = roleFilter === 'All'
    ? benchPlayers
    : roleFilter === 'Overseas'
    ? benchPlayers.filter(p => p.isOverseas)
    : benchPlayers.filter(p => p.role === roleFilter);

  const handleAddToXI = (playerId: string) => {
    soundService.playClick();
    if (team.startingXI.length >= 11) {
      alert('Starting XI is already full (11 players). Remove a player first!');
      return;
    }
    updateStartingXI([...team.startingXI, playerId]);
  };

  const handleRemoveFromXI = (playerId: string) => {
    soundService.playClick();
    updateStartingXI(team.startingXI.filter(id => id !== playerId));
  };

  const overseasInXI = startingPlayers.filter(p => p.isOverseas).length;

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 min-h-[calc(100vh-65px)] flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <TeamBadge teamId={team.id} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-slate-900">{team.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Roster Operations
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
                Configure your Starting XI, optimize tactical chemistry, and prepare for the league campaign.
              </p>
            </div>
          </div>

          {/* Start Season Simulation Button */}
          <button
            onClick={() => {
              if (startingPlayers.length < 11) {
                alert('Please select a complete 11-player Starting XI before commencing the season!');
                return;
              }
              if (overseasInXI > 4) {
                alert('League Rule Violation: You have more than 4 Overseas players in your Starting XI! Please adjust.');
                return;
              }
              startSeason();
            }}
            className="w-full md:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>COMMENCE LEAGUE SEASON</span>
          </button>
        </div>

        {/* Dashboard Metrics: Chemistry & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Team Chemistry Meter */}
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Team Chemistry Score
              </span>
              <span className="text-purple-800 font-extrabold">{chemistry.tier}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                {chemistry.score}
              </span>
              <span className="text-slate-400 text-lg font-bold">/ 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  chemistry.score >= 85 ? 'bg-emerald-500' : chemistry.score >= 70 ? 'bg-purple-500' : 'bg-rose-500'
                }`}
                style={{ width: `${chemistry.score}%` }}
              />
            </div>
          </div>

          {/* Budget Status */}
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                Purse Utilization
              </span>
              <span className="font-mono">₹120.0 Cr Total</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              ₹{team.spentPurse.toFixed(2)} Cr <span className="text-xs text-slate-500 font-normal">spent</span>
            </div>
            <p className="text-xs text-amber-700 font-mono mt-2 font-bold">
              Remaining: ₹{team.currentPurse.toFixed(2)} Cr
            </p>
          </div>

          {/* Lineup Quotas */}
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Lineup Validation
              </span>
              <span className={overseasInXI <= 4 ? 'text-emerald-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                {overseasInXI}/4 Overseas
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {startingPlayers.length} <span className="text-slate-400 text-base font-normal">/ 11 in XI</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Squad Total: {squad.length}/25 players
            </p>
          </div>
        </div>

        {/* Warnings & Synergies Bar */}
        {(chemistry.compositionWarnings.length > 0 || chemistry.synergies.some(s => s.active)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Active Synergies */}
            <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Active Tactical Synergies
              </span>
              <div className="space-y-1.5 text-xs">
                {chemistry.synergies.filter(s => s.active).map(s => (
                  <div key={s.name} className="flex items-center justify-between py-1 border-b border-emerald-100 last:border-none">
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <span className="text-emerald-700 font-medium">{s.bonus}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            <div className="rounded-3xl bg-amber-50 border border-amber-200 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Composition Alerts & Rules
              </span>
              {chemistry.compositionWarnings.length > 0 ? (
                <ul className="space-y-1 text-xs text-amber-900 font-medium">
                  {chemistry.compositionWarnings.map((w, i) => (
                    <li key={i}>⚠️ {w}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-600">All lineup quotas and league eligibility rules are fully compliant.</p>
              )}
            </div>
          </div>
        )}

        {/* 2-Column Pitch & Bench Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-start">
          {/* Left 6 cols: Cricket Pitch Lineup */}
          <div className="lg:col-span-6">
            <PitchLineup
              players={startingPlayers}
              teamId={team.id}
              onRemoveFromXI={handleRemoveFromXI}
            />
          </div>

          {/* Right 6 cols: Bench & Available Roster */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                  FRANCHISE BENCH RESERVES ({benchPlayers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Click the plus (+) icon to promote bench players into your Playing XI.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-1">
                {['All', 'Batter', 'Fast Bowler', 'Spin Bowler', 'All-rounder', 'Wicketkeeper', 'Overseas'].map(f => (
                  <button
                    key={f}
                    onClick={() => setRoleFilter(f)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      roleFilter === f
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Bench Players List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredBench.map(p => (
                <div
                  key={p.id}
                  className="rounded-3xl bg-white border border-slate-200 p-3 hover:border-amber-300 hover:shadow-sm transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PlayerAvatar
                      name={p.name}
                      role={p.role}
                      country={p.country}
                      isOverseas={p.isOverseas}
                      form={p.form}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">{p.name}</h4>
                      <span className="text-xs text-slate-500 block truncate">
                        {p.role} • OVR {p.overallRating} • {p.battingHand}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right text-xs">
                      <span className="text-[10px] text-slate-400 block font-semibold">Hammer</span>
                      <span className="font-mono font-bold text-amber-700">
                        ₹{p.soldPrice?.toFixed(2)} Cr
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToXI(p.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white border border-emerald-300 transition-all shadow-sm"
                      title="Add to Starting XI"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredBench.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50">
                  No reserves match the selected category filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <footer className="text-center text-xs text-slate-500 py-3 border-t border-slate-200">
        Lineup selections dynamically calculate match odds in the Season Simulation Engine.
      </footer>
    </div>
  );
};
