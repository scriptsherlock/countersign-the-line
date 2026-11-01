import type { Band } from './dialogue';
import type { ShiftResult } from './shift';

export const STAGES = ['title', 'opening', 'shift', 'interlude', 'lastTape', 'report', 'turing', 'file'] as const;
export type Stage = (typeof STAGES)[number];

export interface Campaign {
  stage: Stage;
  shift: number;
  band: Band;
  flags: string[];
  /** 5 if the player brought Mission 01's final field code, otherwise 0. */
  carried: number;
  results: ShiftResult[];
  verdict: string | null;
  endCard: string | null;
}

export type CampaignEvent =
  | { type: 'newFile'; band: Band; carried: number }
  | { type: 'continue'; saved: Campaign }
  | { type: 'next' }
  | { type: 'shiftDone'; result: ShiftResult; last: boolean }
  | { type: 'verdict'; verdict: string }
  | { type: 'endCard'; card: string }
  | { type: 'restart' };

export const newCampaign = (): Campaign => ({ stage: 'title', shift: 0, band: 'standard', flags: [], carried: 0, results: [], verdict: null, endCard: null });

export function reduce(state: Campaign, event: CampaignEvent): Campaign {
  switch (event.type) {
    case 'newFile': return { ...newCampaign(), band: event.band, carried: event.carried, stage: 'opening' };
    case 'continue': return event.saved;
    case 'shiftDone': return { ...state, results: [...state.results.filter(r => r.shift !== event.result.shift), event.result], stage: event.last ? 'lastTape' : 'interlude' };
    case 'verdict': return { ...state, verdict: event.verdict, stage: 'turing' };
    case 'endCard': return { ...state, endCard: event.card, stage: 'file' };
    case 'restart': return newCampaign();
    case 'next':
      switch (state.stage) {
        case 'opening': return { ...state, stage: 'shift' };
        case 'interlude': return { ...state, shift: state.shift + 1, stage: 'shift' };
        case 'lastTape': return { ...state, stage: 'report' };
        default: return state;
      }
  }
}
