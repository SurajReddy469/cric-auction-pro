import React from 'react';
import { useGameStore } from './store/useGameStore';
import { Navbar } from './components/common/Navbar';
import { MainMenu } from './components/menu/MainMenu';
import { TeamSelection } from './components/teams/TeamSelection';
import { MainAuctionScreen } from './components/auction/MainAuctionScreen';
import { SquadManagement } from './components/squad/SquadManagement';
import { SeasonHub } from './components/season/SeasonHub';
import { AdminPanel } from './components/admin/AdminPanel';
import { SettingsModal } from './components/menu/SettingsModal';
import { IPLSessionModal } from './components/session/IPLSessionModal';

export const App: React.FC = () => {
  const { currentScreen } = useGameStore();

  const renderScreen = () => {
    switch (currentScreen) {
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
    </div>
  );
};

export default App;
