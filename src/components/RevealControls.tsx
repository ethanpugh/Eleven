import React from 'react';
import { Dices, RotateCcw, Unlock, Sparkles, Copy, Check } from 'lucide-react';
import { PitchSlot, SlotAssignment } from '../types/clubs';

interface RevealControlsProps {
  onlineCount: number;
  pinnedCount: number;
  isRevealing: boolean;
  hasAssignments: boolean;
  onDrawPositions: () => void;
  onClearAssignments: () => void;
  onClearAllPins: () => void;
  onCopySummary: () => string;
  orderedActiveSlots: PitchSlot[];
  assignments: Record<string, SlotAssignment>;
}

export const RevealControls: React.FC<RevealControlsProps> = ({
  onlineCount,
  pinnedCount,
  isRevealing,
  hasAssignments,
  onDrawPositions,
  onClearAssignments,
  onClearAllPins,
  onCopySummary,
  orderedActiveSlots,
  assignments,
}) => {
  const [copiedSummary, setCopiedSummary] = React.useState(false);

  const handleCopySummaryClick = () => {
    const text = onCopySummary();
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Breakdown counts by line for active slots
  const fwdCount = orderedActiveSlots.filter((s) => s.line === 'FWD').length;
  const midCount = orderedActiveSlots.filter((s) => s.line === 'MID').length;
  const defCount = orderedActiveSlots.filter((s) => s.line === 'DEF').length;
  const gkCount = orderedActiveSlots.filter((s) => s.line === 'GK').length;

  const allRevealed =
    hasAssignments &&
    orderedActiveSlots.every((s) => assignments[s.id]?.isRevealed);

  return (
    <div className="bg-white/90 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl transition-colors">
      {/* Left: Front-to-Back Distribution Summary */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium mr-1">Active Lineup:</span>
        <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 font-display font-bold">
          {fwdCount} FWD
        </span>
        <span className="text-slate-400 dark:text-slate-600">→</span>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-display font-bold">
          {midCount} MID
        </span>
        <span className="text-slate-400 dark:text-slate-600">→</span>
        <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-700 dark:text-sky-300 font-display font-bold">
          {defCount} DEF
        </span>
        <span className="text-slate-400 dark:text-slate-600">→</span>
        <span className="px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-700 dark:text-amber-300 font-display font-bold">
          {gkCount} GK
        </span>
        {11 - orderedActiveSlots.length > 0 && (
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
            +{11 - orderedActiveSlots.length} AI
          </span>
        )}
      </div>

      {/* Right: Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
        {pinnedCount > 0 && (
          <button
            type="button"
            onClick={onClearAllPins}
            disabled={isRevealing}
            className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            title="Unlock all pinned positions"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Unpin All ({pinnedCount})</span>
          </button>
        )}

        {hasAssignments && !isRevealing && (
          <>
            {allRevealed && (
              <button
                type="button"
                onClick={handleCopySummaryClick}
                className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Copy formatted lineup to clipboard"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Lineup Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Copy Lineup</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClearAssignments}
              className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset current pitch assignments"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onDrawPositions}
          disabled={onlineCount === 0 || isRevealing}
          className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 disabled:opacity-40 text-slate-950 font-display font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          {isRevealing ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Drawing XI...</span>
            </>
          ) : (
            <>
              <Dices className="w-4 h-4" />
              <span>{hasAssignments ? 'Re-Roll Positions' : 'Draw Positions'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
