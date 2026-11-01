// Operators answer these. No card ever asks the player for anything personal.
export interface Question { id: string; category: string; text: string; after?: string }

export const QUESTIONS: Question[] = [
  { id: 'breakfast', category: 'Everyday life', text: 'What did you have for breakfast?' },
  { id: 'view', category: 'Everyday life', text: 'What can you see from where you’re sitting?' },
  { id: 'bus', category: 'Humour', text: 'Tell me a joke about a bus.' },
  { id: 'shoes', category: 'What if', text: 'If your shoes could talk, what would they say?' },
  { id: 'free', category: 'What if', text: 'What would you do with a free day and no screens?' },
  { id: 'sheep', category: 'Reasoning', text: 'A farmer has 5 sheep. All but 2 run away. How many are left?' },
  { id: 'rhythm', category: 'Reasoning', text: 'Spell “rhythm” backwards.' },
  { id: 'number', category: 'Follow-up', text: 'Pick a number from 1 to 10.' },
  { id: 'recall', category: 'Follow-up', text: 'What number did you pick, and why that one?', after: 'number' },
  { id: 'wrong', category: 'Contradiction', text: 'Do you ever get things wrong? Give me an example.' },
  { id: 'smell', category: 'Preferences', text: 'What’s a smell you really dislike?' },
  { id: 'sound', category: 'Preferences', text: 'What’s your favourite sound?' },
];

export const questionById = (id: string) => QUESTIONS.find(q => q.id === id)!;

export const CLUES = ['Repeated me', 'Forgot what I said', 'Gave a lived detail', 'Made typos', 'Too perfect', 'Dodged the question', 'Solved the puzzle', 'Just a feeling'];
