// One shift. A pure reducer: the mission component only dispatches events and draws the result.
export type Verdict = 'human' | 'machine' | 'unsure';
export type Confidence = 'sure' | 'unsure';
export interface Mark { verdict: Verdict | null; confidence: Confidence | null; clue: string | null }
export type Step = 'asking' | 'judging' | 'revealed' | 'revised';

export interface ShiftState { step: Step; bars: number; asked: string[]; marks: Mark[]; revision: string | null }

export type ShiftEvent =
  | { type: 'ask'; question: string; after?: string | undefined }
  | { type: 'judge' }
  | { type: 'mark'; slot: number; mark: Partial<Mark> }
  | { type: 'reveal' }
  | { type: 'revise'; clue: string };

export const newShift = (bars: number, operators: number): ShiftState => ({
  step: 'asking', bars, asked: [], revision: null,
  marks: Array.from({ length: operators }, () => ({ verdict: null, confidence: null, clue: null })),
});

export const complete = (mark: Mark) => !!mark.verdict && !!mark.clue && (mark.verdict === 'unsure' || !!mark.confidence);
export const allComplete = (state: ShiftState) => state.marks.every(complete);

export function shift(state: ShiftState, event: ShiftEvent): ShiftState {
  switch (event.type) {
    case 'ask': {
      if (state.step !== 'asking' || state.bars <= 0 || state.asked.includes(event.question)) return state;
      if (event.after && !state.asked.includes(event.after)) return state;
      const bars = state.bars - 1;
      return { ...state, bars, asked: [...state.asked, event.question], step: bars === 0 ? 'judging' : 'asking' };
    }
    case 'judge': return state.step === 'asking' && state.asked.length > 0 ? { ...state, step: 'judging' } : state;
    case 'mark': {
      if (state.step !== 'judging') return state;
      const marks = state.marks.map((mark, i) => (i === event.slot ? { ...mark, ...event.mark } : mark));
      return { ...state, marks };
    }
    case 'reveal': return state.step === 'judging' && allComplete(state) ? { ...state, step: 'revealed' } : state;
    case 'revise': return state.step === 'revealed' ? { ...state, revision: event.clue, step: 'revised' } : state;
  }
}

// Honest doubt earns something. Nobody can go below zero, and nobody can fail the mission.
export function points(verdict: Verdict, confidence: Confidence | null, right: boolean): number {
  if (verdict === 'unsure') return 1;
  if (right) return confidence === 'sure' ? 3 : 2;
  return confidence === 'sure' ? 0 : 1;
}

export function outcomeLine(verdict: Verdict, confidence: Confidence | null, right: boolean): string {
  if (verdict === 'unsure') return 'Fair. What would have settled it?';
  if (right) return confidence === 'sure' ? 'Good call.' : 'Right, and honest about it.';
  return confidence === 'sure' ? 'That one fooled you. Here’s how.' : 'Your doubt was fair.';
}

export interface OperatorResult { voice: string; human: boolean; verdict: Verdict; confidence: Confidence | null; clue: string; right: boolean; points: number }
export interface ShiftResult { shift: number; operators: OperatorResult[]; revision: string }

// Each clue is only ever judged for this one operator, so no clue can come out as reliable in general.
export const clueResult = (op: OperatorResult) => (op.verdict === 'unsure' ? 'unused' : op.right ? 'helped' : 'misled');

export function tally(results: ShiftResult[]) {
  const ops = results.flatMap(r => r.operators);
  return {
    score: ops.reduce((sum, op) => sum + op.points, 0),
    best: ops.length * 3,
    peopleAsMachines: ops.filter(op => op.human && op.verdict === 'machine').length,
    machinesAsPeople: ops.filter(op => !op.human && op.verdict === 'human').length,
    sureAndWrong: ops.filter(op => op.verdict !== 'unsure' && !op.right && op.confidence === 'sure').length,
    unsure: ops.filter(op => op.verdict === 'unsure').length,
  };
}
