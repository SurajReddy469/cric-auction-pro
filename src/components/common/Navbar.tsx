import React from 'react';
import { useGameStore, GameScreen } from '../../store/useGameStore';
import { soundService } from '../../services/soundService';
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  Flame, 
  Users, 
  Calendar, 
  Home,
  RotateCcw,
  Radio,
  Trophy,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentScreen,
    setScreen,
    userTeam,
    settings,
    toggleSound,
    setSettingsOpen,
    resetAllGameData,
    auction,
    leagueMatches,
    gameMode,
    multiplayerRoom,
    toggleTheme,
  } = useGameStore();

  const team = userTeam();
  const hasDraftedPlayers = (team?.squad.length || 0) > 0;
  const isSeasonReady = leagueMatches.length > 0;

  const handleNavClick = (screen: GameScreen) => {
    soundService.playClick();

    // Stage Guarding (Fixes Issue 12)
    if (screen === 'squad' && !hasDraftedPlayers) {
      alert('Draft your squad first! Enter the Live Auction to sign players.');
      setScreen(auction.phase === 'idle' ? 'teams' : 'auction');
      return;
    }

    if (screen === 'season' && !isSeasonReady) {
      alert('Complete the auction and finalize your Starting XI in Squad Management before entering the Season campaign!');
      setScreen(hasDraftedPlayers ? 'squad' : 'auction');
      return;
    }

    setScreen(screen);
  };

  const navItems: { 
    screen: GameScreen; 
    label: string; 
    shortLabel: string; 
    icon: any; 
    highlight?: boolean;
    disabled?: boolean;
    disabledReason?: string;
  }[] = [
    { screen: 'start', label: 'Start & Teams', shortLabel: 'Start', icon: Trophy },
    { screen: 'menu', label: 'Dashboard', shortLabel: 'Home', icon: Home },
    ...(gameMode === 'multiplayer' || multiplayerRoom ? [
      {
        screen: 'multiplayer_lobby' as GameScreen,
        label: `Room #${multiplayerRoom?.roomCode || 'Lobby'}`,
        shortLabel: 'Room',
        icon: Radio,
        highlight: true,
      }
    ] : []),
    { screen: 'auction', label: 'Live Auction', shortLabel: 'Auction', icon: Flame, highlight: auction.phase !== 'completed' && auction.phase !== 'idle' },
    { 
      screen: 'squad', 
      label: 'Starting XI & Squad', 
      shortLabel: 'Lineup', 
      icon: Users,
      disabled: !hasDraftedPlayers,
      disabledReason: 'Sign players in auction first'
    },
    { 
      screen: 'season', 
      label: 'Season & Playoffs', 
      shortLabel: 'Season', 
      icon: Calendar,
      disabled: !isSeasonReady,
      disabledReason: 'Assemble squad first'
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 dark:border-slate-800/80 dark:bg-slate-900/95 backdrop-blur-md shadow-sm transition-colors duration-300">
      {/* Broadcast Ticker Bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${
        gameMode === 'multiplayer'
          ? 'from-emerald-500 via-teal-500 to-sky-500'
          : 'from-amber-500 via-rose-500 to-sky-500'
      }`} />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6">
        {/* Brand & Active Team Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button 
            type="button"
            onClick={() => handleNavClick('start')}
            className="flex items-center gap-2 group text-left flex-shrink-0"
            aria-label="Open start screen"
            title="Open Start Screen & Team Select"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 font-black text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform text-sm sm:text-base">
              🏏
            </div>
            <div className="hidden xs:block sm:block" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop Navigation Screen Links */}
        <nav className={`${currentScreen === 'start' ? 'hidden' : 'hidden xl:flex'} items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screen;
            return (
              <button
                type="button"
                key={item.screen}
                onClick={() => handleNavClick(item.screen)}
                title={item.disabled ? item.disabledReason : item.label}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : item.disabled
                    ? 'text-slate-400 dark:text-slate-600 opacity-60'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.highlight && !isActive ? 'text-amber-600 animate-pulse' : ''}`} />
                <span>{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: One-Click Day/Night Switch ALWAYS Visible */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Universal One-Click Day / Night Mode Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={settings.theme === 'night'}
            aria-label={settings.theme === 'day' ? 'Switch to Night mode' : 'Switch to Day mode'}
            title={settings.theme === 'day' ? 'Click for Night Mode (Dark)' : 'Click for Day Mode (Light)'}
            className={`inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-3 text-xs font-black shadow-sm transition-all duration-300 border active:scale-95 cursor-pointer ${
              settings.theme === 'day'
                ? 'bg-amber-500/15 border-amber-400/50 text-amber-800 hover:bg-amber-500/25 shadow-amber-500/10'
                : 'bg-indigo-500/25 border-indigo-400/50 text-indigo-200 hover:bg-indigo-500/35 shadow-indigo-500/20'
            }`}
          >
            {settings.theme === 'day' ? (
              <>
                <Sun className="h-4 w-4 text-amber-600 fill-amber-400 animate-pulse" />
                <span className="font-extrabold tracking-wide">Day</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-indigo-300 fill-indigo-300 animate-pulse" />
                <span className="font-extrabold tracking-wide">Night</span>
              </>
            )}
          </button>

          {/* Additional controls for active game screens */}
          {currentScreen !== 'start' && (
            <>
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                aria-label={settings.soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
                title={settings.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:border-amber-300 shadow-sm transition-colors"
              >
                {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />}
              </button>

              {/* Settings Trigger */}
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                aria-label="Open settings"
                title="Game Settings"
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 shadow-sm transition-colors"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Reset / Restart */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Start a fresh new auction campaign? This will reset the current draft and season.')) {
                    resetAllGameData();
                  }
                }}
                aria-label="Reset game data"
                title="Reset / Start Fresh"
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 shadow-sm transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Phone Screen Navigation Bar */}
      <div className={`${currentScreen === 'start' ? 'hidden' : 'grid'} ${navItems.length > 5 ? 'grid-cols-6' : 'grid-cols-5'} xl:hidden px-2 py-1 border-t border-slate-200 dark:border-slate-800 gap-1 bg-slate-50/90 dark:bg-slate-900/90 text-center`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.screen;
          return (
            <button
              type="button"
              key={item.screen}
              onClick={() => handleNavClick(item.screen)}
              className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1.5 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black' 
                  : item.disabled
                  ? 'text-slate-400 opacity-60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{item.shortLabel}</span>
              {item.highlight && !isActive && (
                <span className="absolute top-1 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
