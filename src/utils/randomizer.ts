import { Formation, PitchSlot, Player, SlotAssignment } from '../types/clubs';

/**
 * Unbiased Fisher-Yates array shuffle.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Computes which pitch slots are active (human-controlled vs AI) given the
 * current formation, number of online players, and any pinned slot->player locks.
 *
 * Rules:
 * 1. Any slot with an active pinned online player is always active.
 * 2. Remaining active slots are selected strictly in front-to-back priority order
 *    (lowest `priority` number first: FWD -> MID -> DEF -> GK) until total active
 *    slots equals `Math.min(11, onlinePlayers.length)`.
 */
export function getActiveSlotIds(
  formation: Formation,
  onlinePlayers: Player[],
  pinnedBySlot: Record<string, string>
): Set<string> {
  const onlineIds = new Set(onlinePlayers.map((p) => p.id));
  const targetCount = Math.min(11, onlinePlayers.length);
  const activeSlotIds = new Set<string>();

  // 1. Add valid pinned slots first
  const sortedSlots = [...formation.slots].sort((a, b) => a.priority - b.priority);
  for (const slot of sortedSlots) {
    const pinnedPlayerId = pinnedBySlot[slot.id];
    if (pinnedPlayerId && onlineIds.has(pinnedPlayerId) && activeSlotIds.size < targetCount) {
      activeSlotIds.add(slot.id);
    }
  }

  // 2. Fill remaining needed slots strictly by front-to-back priority
  for (const slot of sortedSlots) {
    if (activeSlotIds.size >= targetCount) break;
    if (!activeSlotIds.has(slot.id)) {
      activeSlotIds.add(slot.id);
    }
  }

  return activeSlotIds;
}

export interface RandomizeResult {
  assignments: Record<string, SlotAssignment>;
  orderedActiveSlots: PitchSlot[];
  benchPlayers: Player[];
}

/**
 * Randomly distributes online players into the active front-to-back formation slots,
 * respecting any pinned player-to-slot locks.
 */
export function assignPlayersToFormation(
  formation: Formation,
  onlinePlayers: Player[],
  pinnedBySlot: Record<string, string>
): RandomizeResult {
  const onlineMap = new Map(onlinePlayers.map((p) => [p.id, p]));
  const activeSlotIds = getActiveSlotIds(formation, onlinePlayers, pinnedBySlot);

  // Sort slots strictly front-to-back by priority
  const sortedSlots = [...formation.slots].sort((a, b) => a.priority - b.priority);
  const orderedActiveSlots = sortedSlots.filter((s) => activeSlotIds.has(s.id));

  // Track which players are already locked to a pinned active slot
  const usedPlayerIds = new Set<string>();
  const pinnedSlotMap = new Map<string, Player>();

  for (const slot of orderedActiveSlots) {
    const pinnedPlayerId = pinnedBySlot[slot.id];
    const player = pinnedPlayerId ? onlineMap.get(pinnedPlayerId) : undefined;
    if (player && !usedPlayerIds.has(player.id)) {
      pinnedSlotMap.set(slot.id, player);
      usedPlayerIds.add(player.id);
    }
  }

  // Shuffle remaining online players
  const unpinnedOnlinePlayers = onlinePlayers.filter((p) => !usedPlayerIds.has(p.id));
  const shuffledPool = shuffleArray(unpinnedOnlinePlayers);

  const assignments: Record<string, SlotAssignment> = {};
  let poolIndex = 0;

  for (const slot of sortedSlots) {
    if (!activeSlotIds.has(slot.id)) {
      assignments[slot.id] = {
        slotId: slot.id,
        player: null,
        isPinned: false,
        isRevealed: true,
      };
      continue;
    }

    const pinnedPlayer = pinnedSlotMap.get(slot.id);
    if (pinnedPlayer) {
      assignments[slot.id] = {
        slotId: slot.id,
        player: pinnedPlayer,
        isPinned: true,
        isRevealed: true, // Pinned players are already known
      };
    } else {
      const assignedPlayer = shuffledPool[poolIndex++] ?? null;
      assignments[slot.id] = {
        slotId: slot.id,
        player: assignedPlayer,
        isPinned: false,
        isRevealed: false,
      };
    }
  }

  const benchPlayers = shuffledPool.slice(poolIndex);

  return {
    assignments,
    orderedActiveSlots,
    benchPlayers,
  };
}
