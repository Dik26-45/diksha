import React, { useState } from 'react';
import { Database, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DemoBanner: React.FC = () => {
  const { isDemoMode } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-b border-amber-200/80 px-4 py-2 text-xs md:text-sm text-amber-900 flex items-center justify-between">
      <div className="max-w-7xl mx-auto flex items-center gap-2.5">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span className="font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs uppercase tracking-wider flex items-center gap-1">
          <Database className="w-3 h-3" /> Demo Mode
        </span>
        <p className="hidden sm:inline">
          <span className="font-medium">Fictional sample data.</span> Running with isolated in-memory/fallback data store. Connect PostgreSQL in <code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-900 font-mono text-xs">server/.env</code> for persistent SQL mode.
        </p>
        <p className="sm:hidden font-medium">Demo Mode: Fictional sample data active.</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-700 hover:text-amber-950 p-1 rounded-md hover:bg-amber-200/50 transition-colors"
        title="Dismiss notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
