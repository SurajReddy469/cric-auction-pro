import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { IPLFloatingButton } from '../session/IPLFloatingButton';
import { soundService } from '../../services/soundService';
import { CalendarDays, Users } from 'lucide-react';

export const MainMenu: React.FC = () => {
  const {
    setScreen,
    userTeam,
    profile,
    auction,
    leagueMatches,
    gameMode,
    multiplayerRoom,
    setMultiplayerModalOpen,
    sessions,
    activeSessionId,
  } = useGameStore();

  const team = userTeam();
  const activeSession = sessions.find((session) => session.id === activeSessionId);
  const auctionActive = auction.phase !== 'idle' && auction.phase !== 'completed';
  const auctionComplete = auction.phase === 'completed';

  const openAuction = () => {
    soundService.playClick();
    setScreen(auctionActive ? 'auction' : auctionComplete ? 'squad' : 'teams');
  };

  const openMultiplayer = () => {
    soundService.playClick();
    if (multiplayerRoom) setScreen('multiplayer_lobby');
    else setMultiplayerModalOpen(true);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
      <header>
        <p className="text-sm font-semibold text-slate-500">{profile.name ? `Welcome, ${profile.name}` : 'Welcome'}</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">{activeSession?.name || 'No session selected'}</p>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          {team && <TeamBadge teamId={team.id} size="lg" />}
          <div>
            <h2 className="text-lg font-black text-slate-900">{team?.name ?? 'Choose a team'}</h2>
            <p className="text-sm text-slate-500">{gameMode === 'multiplayer' ? 'Multiplayer' : 'Solo game'} · {team?.squad.length ?? 0}/25 players</p>
          </div>
        </div>
        <button onClick={gameMode === 'multiplayer' ? openMultiplayer : openAuction} className="rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950 hover:bg-amber-300">
          {gameMode === 'multiplayer' ? multiplayerRoom ? 'Resume room' : 'Host or join room' : auctionActive ? 'Resume auction' : auctionComplete ? 'Manage squad' : 'Start auction'}
        </button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <DashboardAction icon={<Users />} title="Squad" detail="Manage your players" onClick={() => setScreen('squad')} disabled={!team?.squad.length} />
        <DashboardAction icon={<CalendarDays />} title="Season" detail="Fixtures and standings" onClick={() => setScreen('season')} disabled={!leagueMatches.length} />
      </section>

      <IPLFloatingButton />
    </main>
  );
};

type DashboardActionProps = {
  icon: React.ReactNode;
  title: string;
  detail: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
};

const DashboardAction: React.FC<DashboardActionProps> = ({ icon, title, detail, onClick, disabled, accent }) => (
  <button
    onClick={() => { soundService.playClick(); onClick(); }}
    disabled={disabled}
    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${accent ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'border-slate-200 bg-white hover:bg-slate-50'} disabled:cursor-not-allowed disabled:opacity-45`}
  >
    <span className="text-slate-600">{icon}</span>
    <span>
      <span className="block font-black text-slate-900">{title}</span>
      <span className="block text-xs text-slate-500">{detail}</span>
    </span>
  </button>
);
