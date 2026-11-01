import type { Band } from '../engine/dialogue';
import type { VoiceId } from './voices';

export interface Shift {
  name: string;
  signs: string[];
  voices: VoiceId[];
  bars: number;
  offer: string[];
  warden: string;
  debrief: Record<Band, string>;
}

export const SHIFTS: Shift[] = [
  {
    name: 'First shift', signs: ['Kestrel', 'Moth'], voices: ['h-plain', 'switchboard'], bars: 3,
    offer: ['breakfast', 'bus', 'sheep', 'number', 'recall', 'smell'],
    warden: 'My rules say a bot repeats you. My rules have been wrong before.',
    debrief: {
      simple: 'Some bots are easy to spot. They repeat you, or dodge. The next ones won’t be so easy.',
      standard: 'Rules bots repeat you and forget. That’s why this was the easy shift. It won’t last.',
      full: 'Switchboard matches keywords, like ELIZA in the 1960s. It has no memory, so a follow-up question exposes it.',
    },
  },
  {
    name: 'Second shift', signs: ['Otter', 'Finch'], voices: ['h-playful', 'plain'], bars: 3,
    offer: ['view', 'shoes', 'rhythm', 'wrong', 'free', 'sound'],
    warden: 'My rules say long, tidy answers are suspicious. People also write long, tidy answers.',
    debrief: {
      simple: 'This machine didn’t repeat you. It’s a different kind of bot, one that learned from text.',
      standard: 'A language model is a different kind of machine. It learned patterns from text, and no one wrote its replies.',
      full: 'A language model predicts likely text from training data. No rule produced those replies, so there is no rule to catch.',
    },
  },
  {
    name: 'Third shift', signs: ['Wren', 'Heron'], voices: ['h-formal', 'breezy'], bars: 3,
    offer: ['breakfast', 'view', 'bus', 'free', 'wrong', 'smell'],
    warden: 'My rules say typos mean a human. That rule has just been removed.',
    debrief: {
      simple: 'A machine can make typos if it’s told to. A person can write very neatly. Style proves nothing.',
      standard: 'Typos can be requested. Neat writing is just neat writing. Style is the easiest thing to fake.',
      full: 'Style is cheap to imitate. Detectors also flag careful or non-native writers far more often, so polish is unfair evidence.',
    },
  },
  {
    name: 'Fourth shift', signs: ['Pike', 'Lark'], voices: ['h-botlike', 'mimic'], bars: 3,
    offer: ['shoes', 'sheep', 'number', 'recall', 'sound', 'smell'],
    warden: 'My rules say a machine would never pretend to be a person. My rules are not what they were.',
    debrief: {
      simple: 'One person pretended to be a bot, and one machine was told to seem human. Sounding right proves nothing.',
      standard: 'People can imitate machines too. A machine told to seem human gets judged human far more often.',
      full: 'In a 2025 study, a model with a human persona was judged human 73% of the time, and 36% without one.',
    },
  },
  {
    name: 'Last shift', signs: ['Fox', 'Hare', 'Newt', 'Swift'], voices: ['h-plain', 'wry', 'plain', 'h-playful'], bars: 4,
    offer: ['bus', 'free', 'rhythm', 'number', 'recall', 'wrong'],
    warden: 'I have no rule for this shift. I am told that is honest.',
    debrief: {
      simple: 'You weren’t told how many were machines. No single clue could tell you. That’s what real doubt is like.',
      standard: 'With no count to lean on, no single clue was enough. Saying “not enough evidence” can be the right answer.',
      full: 'Without a known base rate, single clues mislead. A careful judge weighs evidence and says how sure they are.',
    },
  },
];
