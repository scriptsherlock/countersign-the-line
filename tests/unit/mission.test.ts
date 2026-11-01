import { describe, expect, it } from 'vitest';
import human from '../../src/content/human-replies.json';
import model from '../../src/content/model-replies.json';
import { CLUES, QUESTIONS } from '../../src/content/questions';
import { SHIFTS } from '../../src/content/shifts';
import { INTERLUDES, LAST_TAPE, OPENING, TURING, adeyemiReply } from '../../src/content/story';
import { PERSONAS, SAMPLE_CONTENT, isHuman, replyOf, sourceOf, type VoiceId } from '../../src/content/voices';
import { newCampaign, reduce } from '../../src/engine/campaign';
import { problemsIn } from '../../src/engine/dialogue';
import { MISSION_01_CODE, carriedFrom, rankFor } from '../../src/engine/progression';
import { allComplete, clueResult, newShift, points, shift, tally, type ShiftResult } from '../../src/engine/shift';
import { switchboard } from '../../src/engine/switchboard';

const VOICES: VoiceId[] = ['h-plain', 'h-playful', 'h-formal', 'h-botlike', 'switchboard', 'plain', 'breezy', 'mimic', 'wry'];

describe('content', () => {
  it('has a reply from every voice to every question', () => {
    for (const voice of VOICES) for (const q of QUESTIONS) expect(replyOf(voice, q.id), `${voice} ${q.id}`).not.toBe('');
  });
  it('every shift has a call sign per operator and offers real questions', () => {
    for (const s of SHIFTS) {
      expect(s.signs).toHaveLength(s.voices.length);
      for (const id of s.offer) expect(QUESTIONS.some(q => q.id === id)).toBe(true);
    }
  });
  it('a follow-up is only offered with the question it follows', () => {
    for (const s of SHIFTS) for (const id of s.offer) { const after = QUESTIONS.find(q => q.id === id)!.after; if (after) expect(s.offer).toContain(after); }
  });
  it('every shift has both a human and a machine, except that the count is hidden in the last', () => {
    for (const s of SHIFTS) { expect(s.voices.some(isHuman)).toBe(true); expect(s.voices.some(v => !isHuman(v))).toBe(true); }
  });
  it('no card asks the player about themselves', () => {
    for (const q of QUESTIONS) expect(q.text).not.toMatch(/\b(your name|your school|where do you live|your age|how old)\b/i);
  });
  it('every script ends, and every line is short enough', () => {
    for (const script of [OPENING, LAST_TAPE, ...INTERLUDES]) expect(problemsIn(script)).toEqual([]);
    expect(INTERLUDES).toHaveLength(SHIFTS.length - 1);
  });
  it('exactly one end card is right', () => { expect(TURING.cards.filter(c => c.right)).toHaveLength(1); });
  it('there are 8 clue cards and none is called reliable', () => { expect(CLUES).toHaveLength(8); });
});

describe('honest provenance', () => {
  it('sample text is never presented as a real source', () => {
    expect(human.author).toBeNull();
    expect(SAMPLE_CONTENT).toBe(true);
    expect(sourceOf('h-plain').title).toBe('Human (sample)');
    expect(sourceOf('h-plain').detail).not.toMatch(/written by/i);
    expect(sourceOf('mimic').title).toBe('Machine (sample)');
  });
  it('Switchboard’s replies are its real output', () => {
    expect(replyOf('switchboard', 'bus')).toBe(switchboard(QUESTIONS.find(q => q.id === 'bus')!.text));
    expect(sourceOf('switchboard').detail).toMatch(/real replies/);
  });
  it('every language model voice shows the instructions it was given', () => {
    for (const voice of Object.keys(PERSONAS) as VoiceId[]) expect(sourceOf(voice).file?.length).toBeGreaterThan(0);
  });
});

describe('Switchboard', () => {
  it('uses rules in order, and repeats back when nothing matches', () => {
    expect(switchboard('Tell me a joke about a bus.')).toContain('joke');
    expect(switchboard('What did you have for breakfast?')).toBe('You asked: what did i have for breakfast. Please tell me more about that.');
  });
  it('remembers nothing', () => { expect(switchboard('Pick a number from 1 to 10.')).toBe(switchboard('Which number?')); });
});

describe('a shift', () => {
  const asked = (s = newShift(3, 2)) => shift(s, { type: 'ask', question: 'bus' });
  it('costs a bar per question, and goes quiet at zero', () => {
    let s = newShift(2, 2);
    s = shift(s, { type: 'ask', question: 'bus' });
    expect(s.bars).toBe(1);
    expect(shift(s, { type: 'ask', question: 'bus' }).bars).toBe(1);
    s = shift(s, { type: 'ask', question: 'view' });
    expect(s.bars).toBe(0);
    expect(s.step).toBe('judging');
    expect(shift(s, { type: 'ask', question: 'sheep' }).asked).toHaveLength(2);
  });
  it('blocks a follow-up until its first question', () => {
    const s = newShift(3, 2);
    expect(shift(s, { type: 'ask', question: 'recall', after: 'number' }).asked).toHaveLength(0);
  });
  it('can’t reveal until every operator has a verdict, a confidence and a reason', () => {
    let s = shift(asked(), { type: 'judge' });
    s = shift(s, { type: 'mark', slot: 0, mark: { verdict: 'human', confidence: 'sure', clue: 'Made typos' } });
    expect(shift(s, { type: 'reveal' }).step).toBe('judging');
    s = shift(s, { type: 'mark', slot: 1, mark: { verdict: 'machine', clue: 'Too perfect' } });
    expect(allComplete(s)).toBe(false);
    s = shift(s, { type: 'mark', slot: 1, mark: { verdict: 'unsure' } });
    expect(allComplete(s)).toBe(true);
    expect(shift(s, { type: 'reveal' }).step).toBe('revealed');
  });
  it('only finishes after a reason is revised', () => {
    let s = shift(asked(), { type: 'judge' });
    for (const slot of [0, 1]) s = shift(s, { type: 'mark', slot, mark: { verdict: 'unsure', clue: 'Just a feeling' } });
    s = shift(s, { type: 'reveal' });
    expect(shift(s, { type: 'revise', clue: 'none' }).step).toBe('revised');
  });
});

describe('scoring', () => {
  it('matches the design table and never goes negative', () => {
    expect(points('human', 'sure', true)).toBe(3);
    expect(points('human', 'unsure', true)).toBe(2);
    expect(points('unsure', null, false)).toBe(1);
    expect(points('human', 'unsure', false)).toBe(1);
    expect(points('human', 'sure', false)).toBe(0);
  });
  const result: ShiftResult = { shift: 0, revision: 'none', operators: [
    { voice: 'h-plain', human: true, verdict: 'machine', confidence: 'sure', clue: 'Too perfect', right: false, points: 0 },
    { voice: 'mimic', human: false, verdict: 'human', confidence: 'unsure', clue: 'Gave a lived detail', right: false, points: 1 },
    { voice: 'plain', human: false, verdict: 'unsure', confidence: null, clue: 'Just a feeling', right: false, points: 1 },
  ] };
  it('reports the player’s own bias', () => {
    expect(tally([result])).toMatchObject({ score: 2, best: 9, peopleAsMachines: 1, machinesAsPeople: 1, sureAndWrong: 1, unsure: 1 });
  });
  it('judges a clue for one operator only', () => {
    expect(clueResult(result.operators[0]!)).toBe('misled');
    expect(clueResult(result.operators[2]!)).toBe('unused');
  });
});

describe('the campaign', () => {
  const walk = () => {
    let s = reduce(newCampaign(), { type: 'newFile', band: 'standard', carried: 0 });
    s = reduce(s, { type: 'next' });
    return s;
  };
  it('runs through five shifts to the last tape and the file', () => {
    let s = walk();
    for (let i = 0; i < 4; i++) { s = reduce(s, { type: 'shiftDone', result: { shift: i, operators: [], revision: 'none' }, last: false }); expect(s.stage).toBe('interlude'); s = reduce(s, { type: 'next' }); expect(s.shift).toBe(i + 1); }
    s = reduce(s, { type: 'shiftDone', result: { shift: 4, operators: [], revision: 'none' }, last: true });
    expect(s.stage).toBe('lastTape');
    s = reduce(reduce(s, { type: 'next' }), { type: 'verdict', verdict: 'unknown' });
    expect(reduce(s, { type: 'endCard', card: 'imitate' }).stage).toBe('file');
  });
  it('carries rank from Mission 01 with the final field code', () => {
    expect(carriedFrom(MISSION_01_CODE.toLowerCase())).toBe(5);
    expect(carriedFrom('NOPE')).toBe(0);
    expect(rankFor(5 + 5)).toBe('Inspector');
    expect(rankFor(0 + 5)).toBe('Investigator');
  });
  it('Adeyemi answers from the player’s own record', () => {
    expect(adeyemiReply('unknown', 9)).toMatch(/most honest/);
    expect(adeyemiReply('machines', 3)).toMatch(/sure and wrong 3 times/);
  });
});

// AT-40. If one simple feature could sort the replies, players would learn the shortcut and not the lesson.
describe('balance', () => {
  const rows = [...Object.values(human.voices).flatMap(v => Object.values(v).map(text => ({ text, human: true }))), ...Object.values(model.voices).flatMap(v => Object.values(v).map(text => ({ text, human: false })))];
  const best = (feature: (text: string) => number) => {
    let top = 0;
    for (const cut of new Set(rows.map(r => feature(r.text)))) for (const side of [1, -1]) top = Math.max(top, rows.filter(r => side * feature(r.text) >= side * cut === r.human).length / rows.length);
    return top;
  };
  it('no single style feature predicts the source above 65%', () => {
    const features: Record<string, (text: string) => number> = {
      length: t => t.length,
      'lower case': t => (t === t.toLowerCase() ? 1 : 0),
      punctuation: t => (t.match(/[!?]/g) ?? []).length,
      contractions: t => (t.match(/['’]/g) ?? []).length,
      commas: t => (t.match(/,/g) ?? []).length,
    };
    for (const [name, feature] of Object.entries(features)) expect(best(feature), name).toBeLessThanOrEqual(0.65);
  });
});

