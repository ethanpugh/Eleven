import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Bot, X, UserCheck } from 'lucide-react';
import { Formation, PitchLine, PitchSlot, Player, SlotAssignment } from '../types/clubs';

interface PitchViewProps {
  formation: Formation;
  onlinePlayers: Player[];
  activeSlotIds: Set<string>;
  assignments: Record<string, SlotAssignment>;
  pinnedBySlot: Record<string, string>;
  currentlyRevealingSlotId: string | null;
  rollingName: string;
  showPriorityNumbers: boolean;
  onPinPlayerToSlot: (slotId: string, playerId: string | null) => void;
}

const LINE_STYLES: Record<
  PitchLine,
  {
    badgeBg: string;
    badgeText: string;
    borderActive: string;
    glow: string;
  }
> = {
  FWD: {
    badgeBg: 'bg-rose-500',
    badgeText: 'text-white',
    borderActive: 'border-rose-500/60',
    glow: 'shadow-rose-500/20',
  },
  MID: {
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-slate-950',
    borderActive: 'border-emerald-500/60',
    glow: 'shadow-emerald-500/20',
  },
  DEF: {
    badgeBg: 'bg-sky-500',
    badgeText: 'text-slate-950',
    borderActive: 'border-sky-500/60',
    glow: 'shadow-sky-500/20',
  },
  GK: {
    badgeBg: 'bg-amber-400',
    badgeText: 'text-slate-950',
    borderActive: 'border-amber-400/60',
    glow: 'shadow-amber-400/20',
  },
};

export const PitchView: React.FC<PitchViewProps> = ({
  formation,
  onlinePlayers,
  activeSlotIds,
  assignments,
  pinnedBySlot,
  currentlyRevealingSlotId,
  rollingName,
  showPriorityNumbers,
  onPinPlayerToSlot,
}) => {
  const [openSlotPopover, setOpenSlotPopover] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpenSlotPopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onlineMap = new Map(onlinePlayers.map((p) => [p.id, p]));

  const renderSlotNode = (slot: PitchSlot) => {
    const isActive = activeSlotIds.has(slot.id);
    const assignment = assignments[slot.id];
    const pinnedPlayerId = pinnedBySlot[slot.id];
    const pinnedPlayer = pinnedPlayerId ? onlineMap.get(pinnedPlayerId) : undefined;
    const isPinned = Boolean(pinnedPlayer);

    const isCurrentlyRolling = currentlyRevealingSlotId === slot.id;
    const isRevealed = assignment?.isRevealed ?? false;
    const assignedPlayer = assignment?.player ?? pinnedPlayer ?? null;

    const lineStyle = LINE_STYLES[slot.line];
    const isPopoverOpen = openSlotPopover === slot.id;

    // Determine what label to show on the card
    let displayPlayerName = 'OPEN';
    let statusSubtext = isActive ? 'Ready to Draw' : 'AI Controlled';

    if (isCurrentlyRolling) {
      displayPlayerName = rollingName || '...';
      statusSubtext = 'Drawing...';
    } else if (isPinned && pinnedPlayer) {
      displayPlayerName = pinnedPlayer.name;
      statusSubtext = 'Locked In';
    } else if (assignment && isRevealed && assignedPlayer) {
      displayPlayerName = assignedPlayer.name;
      statusSubtext = slot.fullName;
    } else if (assignment && !isRevealed && isActive) {
      displayPlayerName = '???';
      statusSubtext = 'Pending Reveal';
    } else if (!isActive) {
      displayPlayerName = 'CPU / AI';
      statusSubtext = 'Unfilled Backline';
    }

    const hasLockedInPlayer =
      !isCurrentlyRolling && ((isPinned && pinnedPlayer) || (assignment && isRevealed && assignedPlayer));

    return (
      <div
        key={slot.id}
        style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
        className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
          isPopoverOpen ? 'z-30' : 'z-10 hover:z-20'
        }`}
      >
        <button
          type="button"
          onClick={() => setOpenSlotPopover(isPopoverOpen ? null : slot.id)}
          className={`group relative flex flex-col items-center w-24 sm:w-28 md:w-32 rounded-xl border px-2 py-1.5 backdrop-blur-md transition-all cursor-pointer select-none ${
            hasLockedInPlayer ? 'animate-slot-lock' : ''
          } ${
            isCurrentlyRolling
              ? 'bg-emerald-950/95 border-emerald-400 ring-4 ring-emerald-400/30 scale-110 shadow-2xl'
              : hasLockedInPlayer
              ? `bg-white/95 dark:bg-slate-900/95 ${lineStyle.borderActive} shadow-lg ${lineStyle.glow} hover:scale-105`
              : isActive
              ? 'bg-white/90 dark:bg-slate-900/85 border-slate-300 dark:border-slate-600/80 hover:border-emerald-500 dark:hover:border-emerald-400/70 shadow-md hover:scale-105'
              : 'bg-slate-100/75 dark:bg-slate-950/55 border-slate-300/80 dark:border-slate-800/70 opacity-65 dark:opacity-55 hover:opacity-90'
          }`}
        >
          {/* Top Row: Position Badge + Priority or Lock Icon */}
          <div className="w-full flex items-center justify-between gap-1 mb-1">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-display font-bold tracking-wider uppercase leading-none ${lineStyle.badgeBg} ${lineStyle.badgeText}`}
            >
              {slot.label}
            </span>

            <div className="flex items-center gap-1">
              {showPriorityNumbers && (
                <span
                  className="text-[10px] font-mono font-bold px-1 rounded bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30"
                  title={`Front-to-back fill order #${slot.priority}`}
                >
                  #{slot.priority}
                </span>
              )}
              {isPinned ? (
                <Lock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              ) : !isActive ? (
                <Bot className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              ) : (
                <Unlock className="w-3 h-3 text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>

          {/* Player Name */}
          <div
            className={`w-full truncate text-center font-display font-bold text-xs sm:text-sm tracking-wide ${
              isCurrentlyRolling
                ? 'text-emerald-300 animate-pulse'
                : hasLockedInPlayer
                ? 'text-slate-900 dark:text-white'
                : isActive
                ? 'text-slate-700 dark:text-slate-300'
                : 'text-slate-500'
            }`}
          >
            {displayPlayerName}
          </div>

          {/* Subtext */}
          <div className="w-full truncate text-center text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
            {statusSubtext}
          </div>
        </button>

        {/* Click-to-Pin Popover */}
        {isPopoverOpen && (
          <div
            ref={popoverRef}
            className={`absolute w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2.5 z-40 text-left ${
              slot.y > 55 ? 'bottom-full mb-2' : 'top-full mt-2'
            } ${
              slot.x < 25
                ? 'left-0'
                : slot.x > 75
                ? 'right-0'
                : 'left-1/2 -translate-x-1/2'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-display font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${lineStyle.badgeBg} ${lineStyle.badgeText}`}
                  >
                    {slot.label}
                  </span>
                  <span>{slot.fullName}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Fill Priority #{slot.priority} of 11
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenSlotPopover(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>Pin Player to {slot.label}:</span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1">
              {isPinned && (
                <button
                  type="button"
                  onClick={() => {
                    onPinPlayerToSlot(slot.id, null);
                    setOpenSlotPopover(null);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-300 hover:bg-rose-500/15 flex items-center justify-between cursor-pointer"
                >
                  <span>Remove Pin (Open for random)</span>
                  <Unlock className="w-3 h-3" />
                </button>
              )}

              {onlinePlayers.length === 0 ? (
                <div className="text-xs text-slate-400 dark:text-slate-500 py-2 text-center">
                  Select active players first
                </div>
              ) : (
                onlinePlayers.map((p) => {
                  const isSelected = pinnedPlayerId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onPinPlayerToSlot(slot.id, isSelected ? null : p.id);
                        setOpenSlotPopover(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {isSelected && <UserCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-[16/13] max-h-[680px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-[#165b3c] dark:bg-[#0a2218] select-none transition-colors">
      {/* Pitch Turf Stripes */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.08) 10%, transparent 10%, transparent 20%)',
        }}
      />

      {/* Subtle Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-100"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 55%, rgba(2, 6, 23, 0.65) 100%)',
        }}
      />

      {/* SVG Pitch Markings */}
      <svg
        viewBox="0 0 100 120"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full stroke-white/40 dark:stroke-emerald-300/25 fill-none pointer-events-none"
        strokeWidth="0.45"
      >
        {/* Outer Boundary */}
        <rect x="4" y="4" width="92" height="112" rx="1" />

        {/* Halfway Line & Center Circle */}
        <line x1="4" y1="60" x2="96" y2="60" />
        <circle cx="50" cy="60" r="11" />
        <circle cx="50" cy="60" r="0.8" className="fill-white/45 dark:fill-emerald-300/30" />

        {/* Top (Attacking) Penalty Box */}
        <rect x="22" y="4" width="56" height="18" />
        <rect x="35" y="4" width="30" height="7" />
        <path d="M 39 22 A 10 10 0 0 0 61 22" />

        {/* Bottom (Defending) Penalty Box */}
        <rect x="22" y="98" width="56" height="18" />
        <rect x="35" y="109" width="30" height="7" />
        <path d="M 39 98 A 10 10 0 0 1 61 98" />
      </svg>

      {/* Render All 11 Slots */}
      {formation.slots.map(renderSlotNode)}
    </div>
  );
};
