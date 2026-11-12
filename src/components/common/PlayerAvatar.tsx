import React from 'react';
import { PlayerRole, PlayerForm } from '../../types/player';

interface PlayerAvatarProps {
  name: string;
  role: PlayerRole;
  country: string;
  isOverseas: boolean;
  form?: PlayerForm;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  role,
  country,
  isOverseas,
  form,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-base',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-36 h-36 text-4xl',
  };

  // Color by role
  const roleColor = () => {
    switch (role) {
      case 'Batter':
        return 'from-blue-600 to-indigo-800 border-blue-400';
      case 'Fast Bowler':
        return 'from-red-600 to-rose-900 border-rose-400';
      case 'Spin Bowler':
        return 'from-purple-600 to-violet-900 border-purple-400';
      case 'All-rounder':
        return 'from-amber-600 to-orange-800 border-amber-400';
      case 'Wicketkeeper':
        return 'from-emerald-600 to-teal-800 border-emerald-400';
      default:
        return 'from-slate-700 to-slate-900 border-slate-500';
    }
  };

  const getInitials = (str: string) => {
    const parts = str.trim().split(/[\s-]+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return str.substring(0, 2).toUpperCase();
  };

  const getFormEmoji = (f?: PlayerForm) => {
    switch (f) {
      case 'Blazing': return '⚡';
      case 'Hot': return '🔥';
      case 'In Form': return '✨';
      case 'Steady': return '🎯';
      case 'Cold': return '❄️';
      case 'Ice Cold': return '🧊';
      default: return null;
    }
  };

  return (
    <div className={`relative inline-flex flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${roleColor()} border-2 shadow-lg font-bold text-white uppercase select-none ${sizeClasses[size]} ${className}`}>
      {/* Background jersey collar styling */}
      <div className="absolute inset-x-2 top-0 h-1.5 bg-white/20 rounded-t-lg" />
      <span className="tracking-wider drop-shadow-md">{getInitials(name)}</span>

      {/* Form Badge on Top-Right */}
      {form && (
        <span 
          title={`Form: ${form}`}
          className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/90 border border-amber-400/60 text-xs shadow-md"
        >
          {getFormEmoji(form)}
        </span>
      )}

      {/* Overseas / Domestic Indicator on Bottom-Right */}
      <span 
        title={isOverseas ? `Overseas (${country})` : `Domestic (${country})`}
        className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black border shadow-md ${
          isOverseas 
            ? 'bg-amber-500 text-slate-950 border-amber-300' 
            : 'bg-emerald-600 text-white border-emerald-400'
        }`}
      >
        {isOverseas ? '✈️ OS' : 'IND'}
      </span>
    </div>
  );
};
