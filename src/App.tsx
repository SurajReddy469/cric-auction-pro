import React from 'react';
import { useGameStore } from './store/useGameStore';
import { Navbar } from './components/common/Navbar';
import { StartPage } from './components/start/StartPage';
import { MainMenu } from './components/menu/MainMenu';
import { TeamSelection } from './components/teams/TeamSelection';
import { MainAuctionScreen } from './components/auction/MainAuctionScreen';
import { SquadManagement } from './components/squad/SquadManagement';
import { SeasonHub } from './components/season/SeasonHub';
import { AdminPanel } from './components/admin/AdminPanel';
import { SettingsModal } from './components/menu/SettingsModal';
import { IPLSessionModal } from './components/session/IPLSessionModal';
import { MultiplayerLobby } from './components/multiplayer/MultiplayerLobby';
import { MultiplayerModal } from './components/multiplayer/MultiplayerModal';
import { DisconnectPauseOverlay } from './components/multiplayer/DisconnectPauseOverlay';

export const App: React.FC = () => {
  const { currentScreen } = useGameStore();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'start':
        return <StartPage />;
      case 'menu':
        return <MainMenu />;
      case 'teams':
        return <TeamSelection />;
      case 'auction':
        return <MainAuctionScreen />;
      case 'squad':
        return <SquadManagement />;
      case 'season':
        return <SeasonHub />;
      case 'admin':
        return <AdminPanel />;
      case 'multiplayer_lobby':
        return <MultiplayerLobby />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      <Navbar />
      <main className="flex-1 w-full">
        {renderScreen()}
      </main>

      {/* Global Settings Modal */}
      <SettingsModal />

      {/* IPL Session Creator & Manager Modal */}
      <IPLSessionModal />

      {/* Online Multiplayer Modal & Reconnection Overlays */}
      <MultiplayerModal />
      <DisconnectPauseOverlay />
    </div>
  );
};

export default App;
