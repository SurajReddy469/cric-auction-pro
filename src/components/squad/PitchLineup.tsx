import React from 'react';
import { Player } from '../../types/player';

interface PitchLineupProps {
  players: Player[];
  teamId?: string;
  onRemoveFromXI: (playerId: string) => void;
}

export const PitchLineup: React.FC<PitchLineupProps> = ({ players, onRemoveFromXI }) => {
  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-800 border-2 border-emerald-600/50 p-3 sm:p-6 shadow-xl overflow-hidden min-h-[420px] sm:min-h-[500px] flex flex-col justify-between">
      {/* Stadium grass stripes pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #10b981 0, #10b981 30px, #047857 30px, #047857 60px)',
        }}
      />

      {/* Cricket Pitch Oval Crease Outline */}
      <div className="absolute inset-2 sm:inset-4 rounded-[60px] sm:rounded-[120px] border border-white/30 pointer-events-none flex items-center justify-center">
        {/* 22-Yard Pitch Center Strip */}
        <div className="w-20 sm:w-28 h-48 sm:h-64 bg-amber-200/25 border border-amber-300/40 rounded-lg flex flex-col justify-between p-2">
          <div className="h-0.5 w-full bg-white/60" />
          <div className="h-0.5 w-full bg-white/60" />
        </div>
      </div>

      {/* Header Info */}
      <div className="relative z-10 flex items-center justify-between text-[11px] sm:text-xs font-bold text-white">
        <span className="flex items-center gap-1.5 uppercase tracking-wider drop-shadow">
          🏏 PLAYING XI FORMATION
        </span>
        <span className="font-mono bg-emerald-950/40 px-2 sm:px-2.5 py-0.5 rounded-full border border-white/20 text-[10px] sm:text-xs">
          {players.length}/11 Selected
        </span>
      </div>

      {/* Visual Players Formation on Pitch */}
      <div className="relative z-10 grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-3 my-3 sm:my-6">
        {players.map((p, idx) => (
          <div
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={`Remove ${p.name} from playing XI`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRemoveFromXI(p.id);
              }
            }}
            onClick={() => onRemoveFromXI(p.id)}
            title="Click to move to bench"
            className="group cursor-pointer rounded-xl sm:rounded-2xl bg-white hover:bg-amber-50 border border-emerald-300 hover:border-amber-400 p-1.5 sm:p-2.5 transition-all text-center flex flex-col items-center shadow-lg active:scale-95"
          >
            <div className="relative mb-0.5 sm:mb-1">
              <span className="flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-emerald-700 group-hover:bg-amber-500 text-white group-hover:text-slate-950 font-black text-[10px] sm:text-xs shadow-sm">
                #{idx + 1}
              </span>
              {p.isOverseas && (
                <span className="absolute -top-1 -right-1 text-[8px] sm:text-[9px] px-0.5 sm:px-1 rounded-full bg-amber-500 text-slate-950 font-black shadow">
                  ✈️
                </span>
              )}
            </div>

            <span className="text-[10px] sm:text-xs font-extrabold text-slate-900 truncate max-w-[70px] sm:max-w-[90px] block leading-tight">
              {p.name.split(' ')[0]}
            </span>
            <span className="text-[8px] sm:text-[10px] text-amber-700 font-bold truncate max-w-[70px] sm:max-w-[90px]">
              {p.role}
            </span>
            <span className="text-[8px] sm:text-[9px] text-slate-500 font-mono font-bold mt-0.5">
              OVR {p.overallRating}
            </span>
          </div>
        ))}

        {/* Empty slots placeholders if fewer than 11 */}
        {Array.from({ length: Math.max(0, 11 - players.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="rounded-xl sm:rounded-2xl border-2 border-dashed border-white/40 bg-emerald-900/20 p-2 sm:p-4 flex flex-col items-center justify-center text-center text-emerald-100 text-[10px] sm:text-xs min-h-[70px] sm:min-h-[90px]"
          >
            <span>Slot #{players.length + i + 1}</span>
            <span className="text-[8px] sm:text-[10px] text-emerald-200/80 mt-0.5">Bench Slot</span>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="relative z-10 text-center text-[10px] sm:text-[11px] text-emerald-950 bg-white/90 py-1.5 px-2.5 sm:px-3 rounded-xl border border-white font-semibold shadow-sm">
        💡 Tap any player to bench. Balance Pace, Spin, & max 4 overseas!
      </div>
    </div>
  );
};
