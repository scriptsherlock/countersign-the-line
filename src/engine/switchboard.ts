// Switchboard, the rules bot in Shift 1. These replies are its real output, not a script written to look like one.
// Rules are tried in order, and the fallback is honest about not understanding.
export const SWITCHBOARD_VERSION = '1';

const RULES: { match: RegExp; reply: string }[] = [
  { match: /\bjoke\b/, reply: 'Here is a joke. A bus is a vehicle. That is the joke.' },
  { match: /\bspell\b/, reply: 'I can spell. Please ask me to spell.' },
  { match: /\bnumber\b/, reply: 'Thank you for your number. Number received.' },
  { match: /\bsheep\b|\bhow many\b/, reply: 'That is a number question. The answer is a number.' },
  { match: /\bfavourite\b|\bdislike\b/, reply: 'I like what you like. What do you like?' },
];

function echo(question: string) {
  return question.replace(/\?$/, '').replace(/\byour\b/gi, 'my').replace(/\byou\b/gi, 'I').toLowerCase();
}

export function switchboard(question: string): string {
  const text = question.toLowerCase();
  for (const rule of RULES) if (rule.match.test(text)) return rule.reply;
  return `You asked: ${echo(question)}. Please tell me more about that.`;
}
