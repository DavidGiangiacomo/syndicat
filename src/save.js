import { SAVE_VERSION } from './constants.js';
import { createState } from './engine.js';

export const SAVE_KEY = 'syndicat.save.v1';

export function save(state, storage = globalThis.localStorage) {
  if (!storage) return false;
  try {
    state.savedAt = Date.now();
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// Retourne { state, elapsed } ; elapsed = secondes écoulées depuis la sauvegarde (0 si nouvelle partie).
export function load(storage = globalThis.localStorage) {
  if (!storage) return { state: createState(), elapsed: 0 };
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return { state: createState(), elapsed: 0 };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== SAVE_VERSION) return { state: createState(), elapsed: 0 };
    const fresh = createState(parsed.seed);
    const state = {
      ...fresh,
      ...parsed,
      // les sous-objets gagnent leurs nouveaux champs d'une version à l'autre
      metrics: { ...fresh.metrics, ...(parsed.metrics ?? {}) },
      claims: { ...fresh.claims, ...(parsed.claims ?? {}) },
    };
    const elapsed = parsed.savedAt ? Math.max(0, (Date.now() - parsed.savedAt) / 1000) : 0;
    return { state, elapsed };
  } catch {
    return { state: createState(), elapsed: 0 };
  }
}

export function reset(storage = globalThis.localStorage) {
  try { storage?.removeItem(SAVE_KEY); } catch { /* ignore */ }
  return createState();
}
