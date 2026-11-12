import React from 'react';
import { AdminPanel } from '../../src/components/admin/AdminPanel';
import { ExternalLink } from 'lucide-react';

export const AdminApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Standalone Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <a
            href="https://lbs-poultry-shopping-buyers.trycloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <span>OPEN LIVE GAME WEBSITE</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>
        </div>
      </div>

      <main className="flex-1 w-full">
        <AdminPanel />
      </main>

      <footer className="text-center text-xs text-slate-500 py-3 border-t border-slate-900">
        IPL Auction Commissioner Admin Website • Standalone Controller Portal
      </footer>
    </div>
  );
};
