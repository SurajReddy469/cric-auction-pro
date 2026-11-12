import React from 'react';
import { Modal } from '../common/Modal';
import { useGameStore } from '../../store/useGameStore';
import { Volume2, VolumeX, Gauge, Zap, RotateCcw, Sun, Moon, Flame } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    settings,
    updateSettings,
    setDataset,
    resetAllGameData,
  } = useGameStore();

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="Game Settings"
      subtitle="Customize Auction Speed, Audio, Dataset & AI Behavior"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Dataset Selection (Fixes Issue 14) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-bold text-slate-900">Player & Franchise Tournament Dataset</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              {settings.dataset === 'fictional' ? 'Fictional League' : '🔥 Real IPL 2025'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDataset('real')}
              className={`p-3 rounded-xl text-left transition-all flex flex-col gap-1 border ${
                settings.dataset !== 'fictional'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-black">
                <span>🔥 Real IPL 2025 Dataset</span>
                {settings.dataset !== 'fictional' && <span>✓</span>}
              </div>
              <span className={`text-[11px] leading-tight ${settings.dataset !== 'fictional' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                Kohli, Dhoni, Rohit, Bumrah, Pant, Klaasen • 10 Official Franchises (CSK, MI, RCB...)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDataset('fictional')}
              className={`p-3 rounded-xl text-left transition-all flex flex-col gap-1 border ${
                settings.dataset === 'fictional'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-black">
                <span>🛡️ Fictional League</span>
                {settings.dataset === 'fictional' && <span>✓</span>}
              </div>
              <span className={`text-[11px] leading-tight ${settings.dataset === 'fictional' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                Arjun Sharma, Zane Montgomery, Marcus Sterling • 8 Franchises (Meteors, Chargers...)
              </span>
            </button>
          </div>
        </div>

        {/* Sound Toggle (Fixes Issue 19: accessible role="switch" and aria-checked) */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Game Sound FX</span>
              <span className="text-xs text-slate-500">Hammer gavels, crowd roars & boundary sirens</span>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.soundEnabled}
            aria-label="Toggle sound effects"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
              settings.soundEnabled ? 'bg-amber-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Stadium Theme Mode */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-slate-900">Stadium Environment Theme</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateSettings({ theme: 'day' })}
              className={`p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                settings.theme === 'day'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <span className="text-xs font-black">Day Match (Clean Light)</span>
              </div>
              {settings.theme === 'day' && <span>✓</span>}
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ theme: 'night' })}
              className={`p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                settings.theme === 'night'
                  ? 'bg-slate-900 text-white shadow-md font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4" />
                <span className="text-xs font-black">Night Match (Floodlights)</span>
              </div>
              {settings.theme === 'night' && <span>✓</span>}
            </button>
          </div>
        </div>

        {/* Auction Speed */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-slate-900">Bidding Clock Pace</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['slow', 'standard', 'fast'] as const).map((spd) => (
              <button
                type="button"
                key={spd}
                onClick={() => updateSettings({ timerSpeed: spd })}
                className={`py-2 px-3 rounded-lg text-xs font-bold capitalize transition-colors ${
                  settings.timerSpeed === spd
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {spd === 'slow' ? 'Relaxed (1.5s)' : spd === 'standard' ? 'Standard (1.0s)' : 'Blitz (0.35s)'}
              </button>
            ))}
          </div>
        </div>

        {/* AI Bidding Aggression (Fixes Issue 2) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-slate-900">Franchise AI Intelligence</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['chill', 'balanced', 'ruthless'] as const).map((agg) => (
              <button
                type="button"
                key={agg}
                onClick={() => updateSettings({ aiAggression: agg })}
                className={`py-2 px-3 rounded-lg text-xs font-bold capitalize transition-colors ${
                  settings.aiAggression === agg
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {agg === 'chill' ? 'Casual' : agg === 'balanced' ? 'Balanced' : 'Hardcore War'}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset current career and start fresh with ₹120.00 Cr?')) {
                resetAllGameData();
                setSettingsOpen(false);
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Career & New Mega Auction</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
