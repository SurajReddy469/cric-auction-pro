import React from 'react';
import { Player } from '../../types/player';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { Flame, Search, Eye } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onOpenScout: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onOpenScout }) => {
  return (
    <div className="relative rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-6 shadow-md overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Role & Tier Badge */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
        <div className="flex items-center gap-1.5 sm:gap-2">
        </div>

        {/* Scout Button or Scouted Badge */}
        <button
          onClick={onOpenScout}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
            player.isScouted
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-sm'
          }`}
        >
          {player.isScouted ? (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scouted (Pot: {player.potential})</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5 text-amber-600" />
              <span>Scout</span>
            </>
          )}
        </button>
      </div>

      {/* Center Hero: Avatar & Name */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 my-2 sm:my-4 relative z-10">
        <PlayerAvatar
          name={player.name}
          role={player.role}
          country={player.country}
          isOverseas={player.isOverseas}
          form={player.form}
          size="lg"
          className="shadow-md ring-4 ring-slate-100 sm:w-24 sm:h-24 sm:text-2xl"
        />

        <div className="flex-1 text-center sm:text-left min-w-0">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase leading-tight truncate">
            {player.name}
          </h2>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-1.5 text-xs font-bold text-slate-600">
            <span className="text-amber-700">{player.battingHand}</span>
            <span>•</span>
            <span className="text-sky-700">{player.bowlingStyle !== 'None' ? player.bowlingStyle : 'Pure Batter'}</span>
            <span>•</span>
            <span>Age: {player.age}</span>
            <span>•</span>
            <span className={player.isOverseas ? 'text-amber-800 font-extrabold' : 'text-emerald-700 font-extrabold'}>
              {player.country}
            </span>
          </div>

        </div>

        {/* Overall Rating Box */}
        <div className="flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-amber-50 to-white border border-amber-300 min-w-[75px] sm:min-w-[85px] shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OVR</span>
          <span className="text-3xl sm:text-4xl font-black text-amber-600 leading-none my-0.5 sm:my-1 font-mono">
            {player.overallRating}
          </span>
          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
            <Flame className="w-3 h-3 text-amber-500" />
            {player.form}
          </span>
        </div>
      </div>

      {/* Ratings Radar Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 my-3 sm:my-5 relative z-10 text-center">
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-1.5 sm:p-2">
          <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold block">Batting</span>
          <span className="text-base sm:text-lg font-black text-slate-900 font-mono">{player.battingRating}</span>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-1.5 sm:p-2">
          <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold block">Bowling</span>
          <span className="text-base sm:text-lg font-black text-slate-900 font-mono">{player.bowlingRating}</span>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-1.5 sm:p-2">
          <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold block">Fielding</span>
          <span className="text-base sm:text-lg font-black text-slate-900 font-mono">{player.fieldingRating}</span>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-1.5 sm:p-2">
          <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold block">Power</span>
          <span className="text-base sm:text-lg font-black text-amber-700 font-mono">{player.power}</span>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-1.5 sm:p-2">
          <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold block">Timing</span>
          <span className="text-base sm:text-lg font-black text-sky-700 font-mono">{player.timing}</span>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-1.5 sm:p-2">
          <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold block">Clutch</span>
          <span className="text-base sm:text-lg font-black text-rose-700 font-mono">{player.clutch}</span>
        </div>
      </div>

      {/* Base Price & Market Estimate Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-200 relative z-10 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 uppercase font-bold text-[11px] sm:text-xs">BASE PRICE:</span>
          <span className="text-lg sm:text-xl font-black text-amber-700 font-mono">
            ₹{player.basePrice.toFixed(2)} Cr
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] sm:text-xs">
          <span className="uppercase">ESTIMATE:</span>
          <span className="text-slate-900 font-mono font-black text-sm sm:text-base">
            ₹{player.estimatedValue.toFixed(2)} Cr
          </span>
        </div>
      </div>
    </div>
  );
};
