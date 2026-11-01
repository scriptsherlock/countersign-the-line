import { STAGES, newCampaign, type Campaign, type Stage } from './campaign';
import type { Band } from './dialogue';

const KEY = 'countersign.line.save.v1';
const BANDS: Band[] = ['simple', 'standard', 'full'];
let memory: string | null = null;   // used when the browser blocks storage

function read(): string | null {
  try { return localStorage.getItem(KEY) ?? memory; } catch { return memory; }
}

// Card and clue ids only. No names and no free text.
export function saveGame(state: Campaign) {
  const text = JSON.stringify({ v: 1, ...state });
  memory = text;
  try { localStorage.setItem(KEY, text); } catch { /* memory only */ }
}

export function clearGame() {
  memory = null;
  try { localStorage.removeItem(KEY); } catch { /* nothing stored */ }
}

export function loadGame(): Campaign | null {
  try {
    const d = JSON.parse(read() ?? 'null') as (Record<string, unknown> & Partial<Campaign>) | null;
    if (!d || d.v !== 1 || !STAGES.includes(d.stage as Stage) || d.stage === 'title' || !BANDS.includes(d.band as Band)) return null;
    if (!Number.isInteger(d.shift) || (d.shift as number) < 0 || (d.shift as number) > 4) return null;
    if (d.carried !== 0 && d.carried !== 5) return null;
    if (!Array.isArray(d.flags) || !Array.isArray(d.results)) return null;
    return { ...newCampaign(), stage: d.stage as Stage, shift: d.shift as number, band: d.band as Band, flags: d.flags as string[], carried: d.carried as number, results: d.results as Campaign['results'], verdict: (d.verdict as string | null) ?? null, endCard: (d.endCard as string | null) ?? null };
  } catch { return null; }
}
