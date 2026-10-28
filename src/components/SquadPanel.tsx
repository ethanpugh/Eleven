import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  Trash2,
  CheckSquare,
  Square,
  Pin,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { PitchSlot, Player } from '../types/clubs';

interface SquadPanelProps {
  players: Player[];
  pinnedBySlot: Record<string, string>;
  slots: PitchSlot[];
  onAddPlayer: (name: string) => void;
  onTogglePlayerOnline: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onUnpinPlayer: (playerId: string) => void;
  benchPlayers: Player[];
}

export const SquadPanel: React.FC<SquadPanelProps> = ({
  players,
  pinnedBySlot,
  slots,
  onAddPlayer,
  onTogglePlayerOnline,
  onRemovePlayer,
  onSelectAll,
  onDeselectAll,
  onUnpinPlayer,
  benchPlayers,
}) => {
  const [newName, setNewName] = useState('');

  const onlinePlayers = players.filter((p) => p.isOnline);
  const onlineCount = onlinePlayers.length;

  // Map playerId -> pinned slot label if pinned
  const pinnedLabelByPlayerId = new Map<string, string>();
  for (const [slotId, playerId] of Object.entries(pinnedBySlot)) {
    const slot = slots.find((s) => s.id === slotId);
    if (slot && playerId) {
      pinnedLabelByPlayerId.set(playerId, slot.label);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddPlayer(trimmed);
    setNewName('');
  };

  return (
    <aside className="bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col h-full shadow-xl transition-colors">
      {/* Header & Active Count */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight uppercase tracking-wide">
              Club Squad
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tick who is playing</p>
          </div>
        </div>

        <div
          className={`px-2.5 py-1 rounded-lg border font-display font-bold text-sm ${
            onlineCount === 0
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : onlineCount > 11
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          {onlineCount} / 11
        </div>
      </div>

      {/* Add Player Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add player name..."
          maxLength={24}
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/70 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-semibold text-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </form>

      {/* Quick Toggle Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5 px-1">
        <span>{players.length} saved in squad</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSelectAll}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer font-medium"
          >
            Select All
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Overflow Notice if > 11 */}
      {onlineCount > 11 && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>{onlineCount} players</strong> selected! 11 will be drawn onto the pitch and{' '}
            {onlineCount - 11} will be placed on the rotation bench.
          </span>
        </div>
      )}

      {/* Player List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[380px] lg:max-h-none">
        {players.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500 text-sm">
            No players in your squad yet. Add players above to get started.
          </div>
        ) : (
          players.map((player) => {
            const pinnedSlotLabel = pinnedLabelByPlayerId.get(player.id);
            return (
              <div
                key={player.id}
                className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all ${
                  player.isOnline
                    ? 'bg-slate-50 dark:bg-slate-950/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'bg-slate-100/50 dark:bg-slate-950/30 border-slate-200/60 dark:border-slate-900 text-slate-400 dark:text-slate-500'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onTogglePlayerOnline(player.id)}
                  className="flex items-center gap-2.5 flex-1 text-left cursor-pointer min-w-0"
                >
                  {player.isOnline ? (
                    <CheckSquare className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  )}
                  <span
                    className={`text-sm font-medium truncate ${
                      player.isOnline
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-400 dark:text-slate-500 line-through'
                    }`}
                  >
                    {player.name}
                  </span>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  {pinnedSlotLabel && player.isOnline && (
                    <button
                      type="button"
                      onClick={() => onUnpinPlayer(player.id)}
                      title={`Pinned to ${pinnedSlotLabel} — click to unpin`}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-[11px] font-display font-bold hover:bg-amber-500/25 transition-colors cursor-pointer"
                    >
                      <Pin className="w-3 h-3" />
                      <span>{pinnedSlotLabel}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemovePlayer(player.id)}
                    aria-label={`Remove ${player.name}`}
                    title={`Remove ${player.name} from squad`}
                    className="p-1.5 rounded-lg text-slate-400 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 opacity-70 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bench / Rotation Section if >11 players were drawn */}
      {benchPlayers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rotation Bench This Match</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {benchPlayers.map((bp) => (
              <span
                key={bp.id}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {bp.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tip Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
        <span>
          <strong className="text-slate-700 dark:text-slate-300">Tip:</strong> Click any position on
          the pitch to lock a player there.
        </span>
      </div>
    </aside>
  );
};
