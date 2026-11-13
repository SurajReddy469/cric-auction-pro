import React from 'react';
import { AdminPanel } from '../../src/components/admin/AdminPanel';
import { useGameStore } from '../../src/store/useGameStore';
import { ExternalLink, Gavel } from 'lucide-react';

export const AdminApp: React.FC = () => {
  const { profile, auction } = useGameStore();
  const isAuctionLive = auction.phase !== 'idle' && auction.phase !== 'completed';

  return (
    <div className="admin-day min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Standalone Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur sm:px-5">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-sm">
              <Gavel className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-wide text-slate-900">CRIC-AUCTION PRO</p>
              <p className="text-[10px] font-medium text-slate-500">Commissioner Console · Season {profile.totalSeasons}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-wide ${isAuctionLive ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
              <span className={`h-2 w-2 rounded-full ${isAuctionLive ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'}`} />
              {isAuctionLive ? 'Auction Live' : 'Auction Standby'}
            </span>
            <span className="hidden max-w-36 truncate rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 sm:inline-flex">{profile.name}</span>
            <a
              href="https://lbs-poultry-shopping-buyers.trycloudflare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-[10px] font-black text-slate-950 shadow-sm transition hover:bg-amber-400"
            >
              <span>Open Game</span>
              <ExternalLink className="h-3.5 w-3.5 stroke-[2.5]" />
            </a>
          </div>
        </div>
      </header>

      <main className="w-full flex-1">
        <AdminPanel standalone />
      </main>

      <footer className="text-center text-xs text-slate-500 py-3 border-t border-slate-200">
        IPL Auction Commissioner Admin Website • Standalone Controller Portal
      </footer>
    </div>
  );
};
