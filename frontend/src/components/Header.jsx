import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';

export const Header = ({
  currentUser,
  isFirebaseConfigured,
  onLogout,
  onAuthTrigger
}) => {
  return (
    <header className="border-b border-[#1a1a1a] bg-editorial-paper/95 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-baseline justify-between gap-4">
        
        {/* Editorial Brand Header */}
        <div className="flex items-center gap-4">
          <img src={logo} alt="Readari logo" className="w-12 h-12 object-contain" />
          <div className="flex flex-col">
            <span className="text-[9px] font-sans font-black uppercase tracking-[0.25em] text-[#1a1a1a]/40 mb-1">
              BIBLIOGRAPHIC LOG
            </span>
            <h1 className="font-serif font-black text-2xl uppercase tracking-tighter text-editorial-ink select-none leading-none">
              Readari Journal
            </h1>
            <p className="font-serif italic text-xs text-editorial-ink/65 mt-1 border-t border-editorial-ink/10 pt-1.5 shrink-0">
              A minimalist archive for private book records.
            </p>
          </div>
        </div>

        {/* Account Authentication controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          
          {currentUser ? (
            <div id="user-controls" className="inline-flex items-center gap-2 bg-editorial-bone border border-editorial-ink/10 p-1 pr-3">
              <div className="w-5.5 h-5.5 bg-editorial-ink text-editorial-paper flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
              </div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-editorial-ink/80 max-w-[120px] truncate">
                {currentUser.displayName || 'Collector'}
              </span>
              <button
                onClick={onLogout}
                className="p-1 text-editorial-ink/65 hover:text-editorial-ink transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthTrigger}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-editorial-ink text-editorial-paper border border-editorial-ink hover:bg-editorial-paper hover:text-editorial-ink transition-all text-[10px] font-sans font-bold uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>Reader Portal</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
