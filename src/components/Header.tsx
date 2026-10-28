import React, { useState } from 'react';
import { Check, Share2, Shield, HelpCircle, Sun, Moon } from 'lucide-react';
import { Formation, ThemeMode } from '../types/clubs';

interface HeaderProps {
  formations: Formation[];
  selectedFormation: Formation;
  onSelectFormation: (formationId: string) => void;
  onCopyShareLink: () => string;
  showPriorityNumbers: boolean;
  onTogglePriorityNumbers: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  formations,
  selectedFormation,
  onSelectFormation,
  onCopyShareLink,
  showPriorityNumbers,
  onTogglePriorityNumbers,
  theme,
  onToggleTheme,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = onCopyShareLink();
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-300/30">
            <span className="font-display font-bold text-slate-950 text-xl tracking-tighter italic">
              XI
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl tracking-wider text-slate-900 dark:text-white uppercase">
                Eleven
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                FC Clubs Draw
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Front-to-back squad distributor • Forwards → Midfielders → Defenders → GK
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Formation Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-inner transition-colors">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold leading-none mb-0.5">
                Formation
              </span>
              <select
                aria-label="Formation"
                value={selectedFormation.id}
                onChange={(e) => onSelectFormation(e.target.value)}
                className="bg-transparent text-sm font-display font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-2"
              >
                <optgroup label="3 At The Back" className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400">
                  {formations
                    .filter((f) => f.name.startsWith('3-'))
                    .map((f) => (
                      <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {f.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="4 At The Back" className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400">
                  {formations
                    .filter((f) => f.name.startsWith('4-'))
                    .map((f) => (
                      <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {f.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="5 At The Back" className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400">
                  {formations
                    .filter((f) => f.name.startsWith('5-'))
                    .map((f) => (
                      <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {f.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Toggle Fill Order Numbers */}
          <button
            type="button"
            onClick={onTogglePriorityNumbers}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showPriorityNumbers
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-700 dark:text-cyan-300'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
            title="Show exact 1-11 front-to-back fill priority numbers on pitch slots"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Fill Order</span>
          </button>

          {/* Share Squad Link */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-95"
            title="Copy a shareable link with your saved squad names pre-loaded"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Copy Squad Link</span>
              </>
            )}
          </button>

          {/* Theme Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
