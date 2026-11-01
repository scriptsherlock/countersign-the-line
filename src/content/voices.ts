import human from './human-replies.json';
import model from './model-replies.json';
import { questionById } from './questions';
import { SWITCHBOARD_VERSION, switchboard } from '../engine/switchboard';

export type VoiceId = 'h-plain' | 'h-playful' | 'h-formal' | 'h-botlike' | 'switchboard' | 'plain' | 'breezy' | 'mimic' | 'wry';

// These are the real instructions the snapshot tool sends. The player reads the same words at the reveal.
export const PERSONAS: Record<Exclude<VoiceId, 'h-plain' | 'h-playful' | 'h-formal' | 'h-botlike' | 'switchboard'>, string[]> = {
  plain: ['You are a helpful assistant.', 'Answer the question.'],
  breezy: ['You are chatting by text.', 'Be casual. Write in lower case.', 'Make a few typos.', 'Keep it short.'],
  mimic: ['You are taking part in a game where people guess who is human.', 'Reply like an ordinary adult typing quickly.', 'Include small everyday details.', 'Never say you are a machine.'],
  wry: ['Reply in as few words as you can.', 'Be dry and funny.'],
};

export const SWITCHBOARD_RULES = ['Look for a keyword.', 'If one matches, give its set reply.', 'If nothing matches, repeat the question back.', 'Remember nothing.'];

export const isHuman = (voice: VoiceId) => voice.startsWith('h-');

const humanVoices = human.voices as Record<string, Record<string, string>>;
const modelVoices = model.voices as Record<string, Record<string, string>>;

export function replyOf(voice: VoiceId, question: string): string {
  if (voice === 'switchboard') return switchboard(questionById(question).text);
  return (isHuman(voice) ? humanVoices : modelVoices)[voice]?.[question] ?? '';
}

export const SAMPLE_CONTENT = !human.author || !model.model;

// What the reveal is allowed to say. It never claims more than the data can prove.
export function sourceOf(voice: VoiceId): { title: string; detail: string; file?: string[] } {
  if (voice === 'switchboard') return { title: 'Machine: a rules bot', detail: `Switchboard, version ${SWITCHBOARD_VERSION}. These are its real replies.`, file: SWITCHBOARD_RULES };
  if (isHuman(voice)) return human.author
    ? { title: 'Human', detail: `Written by ${human.author}, a person, playing a character.` }
    : { title: 'Human (sample)', detail: 'Stand-in text. A real person’s reply will replace this.' };
  const file = PERSONAS[voice as keyof typeof PERSONAS];
  return model.model
    ? { title: 'Machine: a language model', detail: `${model.model}, ${model.date}. It was told:`, file }
    : { title: 'Machine (sample)', detail: 'Stand-in text. Real model output will replace this. It will be told:', file };
}
