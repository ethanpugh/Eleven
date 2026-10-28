import { Player, ThemeMode } from '../types/clubs';

const STORAGE_KEYS = {
  SQUAD: 'eleven_squad_v2',
  LEGACY_SQUAD: 'eleven_squad_v1',
  FORMATION: 'eleven_formation_v1',
  THEME: 'eleven_theme_v1',
};

const DEFAULT_SQUAD: Player[] = [];

/**
 * Checks URL query string (?squad=Name1,Name2,...) first so shared links
 * automatically populate the squad on any browser.
 */
export function loadInitialSquad(): { players: Player[]; importedFromUrl: boolean } {
  try {
    localStorage.removeItem(STORAGE_KEYS.LEGACY_SQUAD);

    const params = new URLSearchParams(window.location.search);
    const squadParam = params.get('squad');
    if (squadParam && squadParam.trim().length > 0) {
      const names = squadParam
        .split(',')
        .map((n) => decodeURIComponent(n.trim()))
        .filter(Boolean);

      if (names.length > 0) {
        const players: Player[] = names.map((name, idx) => ({
          id: `url-${idx}-${Date.now()}`,
          name,
          isOnline: idx < 11,
        }));
        saveSquadToStorage(players);
        return { players, importedFromUrl: true };
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.SQUAD);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return { players: parsed, importedFromUrl: false };
      }
    }
  } catch {
    // Ignore storage or URL parse errors
  }

  return { players: DEFAULT_SQUAD, importedFromUrl: false };
}

export function saveSquadToStorage(players: Player[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SQUAD, JSON.stringify(players));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadFormationId(defaultId: string): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlFormation = params.get('formation');
    if (urlFormation) return urlFormation;
    return localStorage.getItem(STORAGE_KEYS.FORMATION) || defaultId;
  } catch {
    return defaultId;
  }
}

export function saveFormationId(formationId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FORMATION, formationId);
  } catch {
    // Ignore
  }
}

export function loadThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveThemeMode(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // Ignore
  }
}

/**
 * Generates a shareable URL containing the current squad names and formation
 * so any friend can open the link on GitHub Pages with the whole squad preloaded.
 */
export function buildShareableSquadUrl(players: Player[], formationId: string): string {
  const url = new URL(window.location.href);
  url.search = '';
  const names = players.map((p) => p.name.trim()).filter(Boolean);
  if (names.length > 0) {
    url.searchParams.set('squad', names.join(','));
  }
  url.searchParams.set('formation', formationId);
  return url.toString();
}
