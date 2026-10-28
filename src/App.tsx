import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { FORMATIONS } from './data/formations';
import { Player, SlotAssignment, ThemeMode } from './types/clubs';
import {
  assignPlayersToFormation,
  getActiveSlotIds,
} from './utils/randomizer';
import {
  buildShareableSquadUrl,
  loadFormationId,
  loadInitialSquad,
  loadThemeMode,
  saveFormationId,
  saveSquadToStorage,
  saveThemeMode,
} from './utils/storage';
import { Header } from './components/Header';
import { SquadPanel } from './components/SquadPanel';
import { PitchView } from './components/PitchView';
import { RevealControls } from './components/RevealControls';

export const App: React.FC = () => {
  const initialSquadData = useMemo(() => loadInitialSquad(), []);
  const [players, setPlayers] = useState<Player[]>(initialSquadData.players);
  const [formationId, setFormationId] = useState<string>(() =>
    loadFormationId('4-3-3-attack')
  );
  const [theme, setTheme] = useState<ThemeMode>(() => loadThemeMode());
  const [showPriorityNumbers, setShowPriorityNumbers] = useState<boolean>(false);

  // Map of slotId -> playerId for locked/pinned positions
  const [pinnedBySlot, setPinnedBySlot] = useState<Record<string, string>>({});

  // Current draw state
  const [assignments, setAssignments] = useState<Record<string, SlotAssignment>>({});
  const [benchPlayers, setBenchPlayers] = useState<Player[]>([]);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [currentlyRevealingSlotId, setCurrentlyRevealingSlotId] = useState<string | null>(null);
  const [rollingName, setRollingName] = useState<string>('');

  const timersRef = useRef<number[]>([]);

  const selectedFormation = useMemo(
    () => FORMATIONS.find((f) => f.id === formationId) || FORMATIONS[0],
    [formationId]
  );

  const onlinePlayers = useMemo(
    () => players.filter((p) => p.isOnline),
    [players]
  );

  const activeSlotIds = useMemo(
    () => getActiveSlotIds(selectedFormation, onlinePlayers, pinnedBySlot),
    [selectedFormation, onlinePlayers, pinnedBySlot]
  );

  const orderedActiveSlots = useMemo(
    () =>
      [...selectedFormation.slots]
        .sort((a, b) => a.priority - b.priority)
        .filter((s) => activeSlotIds.has(s.id)),
    [selectedFormation, activeSlotIds]
  );

  // Persist players whenever updated
  useEffect(() => {
    saveSquadToStorage(players);
  }, [players]);

  // Sync theme with document root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveThemeMode(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const clearPendingTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setIsRevealing(false);
    setCurrentlyRevealingSlotId(null);
    setRollingName('');
  };

  useEffect(() => {
    return () => clearPendingTimers();
  }, []);

  const handleSelectFormation = (newId: string) => {
    clearPendingTimers();
    setFormationId(newId);
    saveFormationId(newId);
    setPinnedBySlot({});
    setAssignments({});
    setBenchPlayers([]);
  };

  const handleAddPlayer = (name: string) => {
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      isOnline: true,
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const handleTogglePlayerOnline = (playerId: string) => {
    clearPendingTimers();
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, isOnline: !p.isOnline } : p))
    );
    // Remove pin if player went offline
    setPinnedBySlot((prev) => {
      const next = { ...prev };
      for (const [slotId, pId] of Object.entries(next)) {
        if (pId === playerId) delete next[slotId];
      }
      return next;
    });
    setAssignments({});
    setBenchPlayers([]);
  };

  const handleRemovePlayer = (playerId: string) => {
    clearPendingTimers();
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setPinnedBySlot((prev) => {
      const next = { ...prev };
      for (const [slotId, pId] of Object.entries(next)) {
        if (pId === playerId) delete next[slotId];
      }
      return next;
    });
    setAssignments({});
    setBenchPlayers([]);
  };

  const handleSelectAll = () => {
    clearPendingTimers();
    setPlayers((prev) => prev.map((p) => ({ ...p, isOnline: true })));
    setAssignments({});
    setBenchPlayers([]);
  };

  const handleDeselectAll = () => {
    clearPendingTimers();
    setPlayers((prev) => prev.map((p) => ({ ...p, isOnline: false })));
    setPinnedBySlot({});
    setAssignments({});
    setBenchPlayers([]);
  };

  const handlePinPlayerToSlot = (slotId: string, playerId: string | null) => {
    clearPendingTimers();
    setPinnedBySlot((prev) => {
      const next = { ...prev };
      if (!playerId) {
        delete next[slotId];
        return next;
      }
      // Ensure this player isn't pinned to another slot simultaneously
      for (const [existingSlot, existingPlayer] of Object.entries(next)) {
        if (existingPlayer === playerId) {
          delete next[existingSlot];
        }
      }
      next[slotId] = playerId;
      return next;
    });
  };

  const handleUnpinPlayer = (playerId: string) => {
    setPinnedBySlot((prev) => {
      const next = { ...prev };
      for (const [slotId, pId] of Object.entries(next)) {
        if (pId === playerId) delete next[slotId];
      }
      return next;
    });
  };

  const handleClearAllPins = () => {
    clearPendingTimers();
    setPinnedBySlot({});
  };

  const handleClearAssignments = () => {
    clearPendingTimers();
    setAssignments({});
    setBenchPlayers([]);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.65 },
      });
    } catch {
      // Ignore in headless environments
    }
  };

  const handleDrawPositions = () => {
    if (onlinePlayers.length === 0) return;
    clearPendingTimers();

    const result = assignPlayersToFormation(
      selectedFormation,
      onlinePlayers,
      pinnedBySlot
    );

    setAssignments(result.assignments);
    setBenchPlayers(result.benchPlayers);

    // Front-to-back reveal sequence for unpinned active slots
    const slotsToReveal = result.orderedActiveSlots.filter(
      (slot) => !result.assignments[slot.id]?.isPinned
    );

    if (slotsToReveal.length === 0) {
      triggerConfetti();
      return;
    }

    setIsRevealing(true);
    const candidateNames = onlinePlayers.map((p) => p.name);
    const STEP_DURATION_MS = 650;
    const TICK_MS = 70;

    slotsToReveal.forEach((slot, idx) => {
      const startDelay = idx * STEP_DURATION_MS;

      // Start cycling names on this slot
      const startTimer = window.setTimeout(() => {
        setCurrentlyRevealingSlotId(slot.id);
        let tickCount = 0;
        const maxTicks = Math.floor((STEP_DURATION_MS - 120) / TICK_MS);

        const interval = window.setInterval(() => {
          tickCount++;
          const randomCandidate =
            candidateNames[Math.floor(Math.random() * candidateNames.length)] || '...';
          setRollingName(randomCandidate);
          if (tickCount >= maxTicks) {
            window.clearInterval(interval);
          }
        }, TICK_MS);
        timersRef.current.push(interval as unknown as number);
      }, startDelay);
      timersRef.current.push(startTimer);

      // Lock in the actual assigned player for this slot
      const revealTimer = window.setTimeout(() => {
        setAssignments((prev) => ({
          ...prev,
          [slot.id]: {
            ...prev[slot.id],
            isRevealed: true,
          },
        }));

        if (idx === slotsToReveal.length - 1) {
          setCurrentlyRevealingSlotId(null);
          setRollingName('');
          setIsRevealing(false);
          triggerConfetti();
        }
      }, startDelay + STEP_DURATION_MS - 60);
      timersRef.current.push(revealTimer);
    });
  };

  const handleCopyShareLink = () => {
    return buildShareableSquadUrl(players, selectedFormation.id);
  };

  const handleCopySummary = () => {
    const lines = [
      `⚽ **ELEVEN — ${selectedFormation.name}**`,
      ...orderedActiveSlots.map((slot) => {
        const player = assignments[slot.id]?.player;
        const pinTag = assignments[slot.id]?.isPinned ? ' 📌' : '';
        return `• **${slot.label}**: ${player ? player.name : 'AI'}${pinTag}`;
      }),
    ];
    if (benchPlayers.length > 0) {
      lines.push(`🔄 **Rotation Bench**: ${benchPlayers.map((b) => b.name).join(', ')}`);
    }
    return lines.join('\n');
  };

  const hasAssignments = Object.keys(assignments).length > 0;
  const pinnedCount = Object.keys(pinnedBySlot).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#060b14] text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        formations={FORMATIONS}
        selectedFormation={selectedFormation}
        onSelectFormation={handleSelectFormation}
        onCopyShareLink={handleCopyShareLink}
        showPriorityNumbers={showPriorityNumbers}
        onTogglePriorityNumbers={() => setShowPriorityNumbers((prev) => !prev)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Squad Roster Sidebar */}
        <div className="lg:col-span-4 xl:col-span-4">
          <SquadPanel
            players={players}
            pinnedBySlot={pinnedBySlot}
            slots={selectedFormation.slots}
            onAddPlayer={handleAddPlayer}
            onTogglePlayerOnline={handleTogglePlayerOnline}
            onRemovePlayer={handleRemovePlayer}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onUnpinPlayer={handleUnpinPlayer}
            benchPlayers={benchPlayers}
          />
        </div>

        {/* Right Column: Action Controls + Tactical Pitch */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-4">
          <RevealControls
            onlineCount={onlinePlayers.length}
            pinnedCount={pinnedCount}
            isRevealing={isRevealing}
            hasAssignments={hasAssignments}
            onDrawPositions={handleDrawPositions}
            onClearAssignments={handleClearAssignments}
            onClearAllPins={handleClearAllPins}
            onCopySummary={handleCopySummary}
            orderedActiveSlots={orderedActiveSlots}
            assignments={assignments}
          />

          <PitchView
            formation={selectedFormation}
            onlinePlayers={onlinePlayers}
            activeSlotIds={activeSlotIds}
            assignments={assignments}
            pinnedBySlot={pinnedBySlot}
            currentlyRevealingSlotId={currentlyRevealingSlotId}
            rollingName={rollingName}
            showPriorityNumbers={showPriorityNumbers}
            onPinPlayerToSlot={handlePinPlayerToSlot}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
