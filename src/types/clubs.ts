export type PitchLine = 'FWD' | 'MID' | 'DEF' | 'GK';

export interface Player {
  id: string;
  name: string;
  isOnline: boolean;
}

export interface PitchSlot {
  /** Unique slot identifier within the formation (e.g., 'st', 'lw', 'lcm') */
  id: string;
  /** Tactical position badge shown on the pitch (e.g., 'ST', 'LW', 'CAM', 'GK') */
  label: string;
  /** Full role name for tooltips/accessibility */
  fullName: string;
  /** Line grouping for color-coding and summary breakdown */
  line: PitchLine;
  /**
   * Strict front-to-back attacking fill priority (1 = filled first, 11 = filled last / GK).
   * Lower numbers are filled before higher numbers when fewer than 11 players are online.
   */
  priority: number;
  /** Horizontal position on the pitch (0 = left touchline, 100 = right touchline) */
  x: number;
  /** Vertical position on the pitch (0 = opponent goal line / top, 100 = own goal line / bottom) */
  y: number;
}

export interface Formation {
  id: string;
  name: string;
  subtitle: string;
  slots: PitchSlot[];
}

export interface SlotAssignment {
  slotId: string;
  player: Player | null;
  isPinned: boolean;
  isRevealed: boolean;
}

export type ThemeMode = 'dark' | 'light';
