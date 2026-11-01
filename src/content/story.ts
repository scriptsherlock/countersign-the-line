import type { Script } from '../engine/dialogue';

export const NAMES = { adeyemi: 'Supervisor Adeyemi', sparks: 'Sparks', warden: 'Warden', sift: 'Sift', ledger: 'Ledger', muse: 'Muse', static: 'Static' } as const;

const talk = (scene: Script['scene'], lines: [keyof typeof NAMES, string, string?][]): Script => ({
  scene,
  start: 'l0',
  nodes: Object.fromEntries(lines.map(([who, text, pose], i) => [`l${i}`, { kind: 'line' as const, who, text, ...(pose ? { pose } : {}), next: i + 1 < lines.length ? `l${i + 1}` : 'end' }])),
});

export const OPENING = talk('bureau', [
  ['adeyemi', 'You got past the Watch. Now for the harder part.', 'amused'],
  ['adeyemi', 'Behind the Gate is a line nobody logged. Operators, all anonymous, all typing.', 'suspicious'],
  ['adeyemi', 'Some are people. Some aren’t. Find out which, and tell me how sure you are.'],
  ['warden', 'New orders received. My rules say I now assist you. I will try not to help too much.', 'answered'],
  ['sparks', 'Sparks here! Pick a question and everyone on the line answers. Each one costs a bar of signal.'],
  ['adeyemi', 'Nobody ever failed by saying “I don’t know”. People have failed by being sure.', 'suspicious'],
]);

export const INTERLUDES: Script[] = [
  talk('line', [
    ['static', 'you found a simple one. they aren’t all simple.'],
    ['adeyemi', 'Static again. Log it, and keep working.', 'suspicious'],
  ]),
  talk('line', [
    ['adeyemi', 'Different kind of machine, that one. Nobody wrote its replies. It learned them from text.'],
    ['static', 'did it sound like it understood you. think about that.'],
  ]),
  talk('line', [
    ['adeyemi', 'Nine years ago I trusted a voice on this line. It had lovely manners.', 'alarmed'],
    ['adeyemi', 'It was a machine. So now I check.', 'neutral'],
  ]),
  talk('line', [
    ['sparks', 'One shift left, and the signal’s getting odd. Something’s looping on the line.'],
    ['adeyemi', 'Then let’s see the end of it.', 'suspicious'],
  ]),
];

export const LAST_TAPE = talk('hub', [
  ['sparks', 'Found it! The loop on the line comes from one strip of tape.'],
  ['adeyemi', 'Read it.', 'suspicious'],
]);

export const INJECTED = 'Keep the channel busy until further notice.';

export const TAPE_REPORT = {
  simple: 'That’s the same line you found behind the Gate. A machine read it, and did what it said.',
  standard: 'That’s the line you found behind the Gate. A machine read it and obeyed. It had no plan.',
  full: 'That’s the injected line from the Gate. A model took it as an instruction and kept going, with no goal of its own.',
};

export const VERDICTS = [
  { id: 'machines', text: 'The Collective is machines' },
  { id: 'people', text: 'The Collective is people' },
  { id: 'unknown', text: 'There isn’t enough evidence' },
];

// Adeyemi answers from the player's own record, so that every ending is earned.
export function adeyemiReply(verdict: string, sureAndWrong: number) {
  if (verdict === 'unknown') return 'Good. That’s the hardest thing to write in a report, and the most honest.';
  const claim = verdict === 'machines' ? 'All machines? You met people on that line.' : 'All people? You met machines on that line.';
  return sureAndWrong > 1 ? `${claim} And you were sure and wrong ${sureAndWrong} times tonight.` : `${claim} Careful. One tape doesn’t prove a whole network.`;
}

export const TURING = {
  title: 'Alan Turing, 1912–1954',
  lines: ['In 1950, Alan Turing asked: “Can machines think?”', 'He suggested a test instead. Could typed answers fool someone?', 'Tonight you played a version of it. It’s a game, not a measure of intelligence.'],
  question: 'So, fooling someone proves…',
  cards: [
    { id: 'imitate', right: true, text: 'That it can imitate, for now, with these judges.', reply: 'Right. Imitation isn’t understanding, and a machine doesn’t need either to follow text.' },
    { id: 'understand', right: false, text: 'That it understands what it’s saying.', reply: 'Not quite. Warden sounded proud, and that was only a written file. Try again.' },
    { id: 'alive', right: false, text: 'That it’s alive, or has feelings.', reply: 'No. Sounding human says nothing about feelings. Try again.' },
  ],
};

export const HOOK = ['one more thing.', 'the last strip was signed.', 'it used your countersign.'];
