# Writing pack: the human replies

For Pooja. You're writing the human side of Mission 02. There are 12 questions and 4 voices, so 48 short replies. Allow about an hour.

## How to do it

1. Open [src/content/human-replies.json](../src/content/human-replies.json).
2. Replace every reply in all four voices with your own words. Everything there now is sample text, which an AI wrote as a placeholder, so it must all go.
3. Change `"author": null` to `"author": "Pooja"`. The reveal will then say: "Written by Pooja, a person, playing a character."
4. Run `npm run check`.

## Rules

- **Write it yourself.** Don't use AI, not even to polish. The whole mission depends on this being true.
- Keep each reply to about 25 words or fewer. Short is harder to judge.
- Nothing true and private: no real names, addresses, schools or workplaces. Everyday details can be made up, because you're playing a character.
- School-friendly only.
- Mix it up. A real person doesn't always make typos, and sometimes writes tidily. Don't make the humans easy.
- Vary length and style between voices. A test fails if length, punctuation or lower case can sort humans from machines.

## The four voices

| Voice | Who they are | Used in |
|---|---|---|
| `h-plain` | Ordinary and honest. Plain sentences, a real detail or two | Shifts 1 and 5 |
| `h-playful` | Jokes around, messy typing, enjoys the game | Shifts 2 and 5 |
| `h-formal` | Careful, polite, complete sentences. Looks like a machine at first glance | Shift 3 |
| `h-botlike` | Pretending to be a bot, but real details slip through | Shift 4 |

## The 12 questions

| Key | Question |
|---|---|
| `breakfast` | What did you have for breakfast? |
| `view` | What can you see from where you're sitting? |
| `bus` | Tell me a joke about a bus. |
| `shoes` | If your shoes could talk, what would they say? |
| `free` | What would you do with a free day and no screens? |
| `sheep` | A farmer has 5 sheep. All but 2 run away. How many are left? |
| `rhythm` | Spell "rhythm" backwards. |
| `number` | Pick a number from 1 to 10. |
| `recall` | What number did you pick, and why that one? (Must match your `number` reply) |
| `wrong` | Do you ever get things wrong? Give me an example. |
| `smell` | What's a smell you really dislike? |
| `sound` | What's your favourite sound? |

## One decision for you

The debrief can talk about people writing English as an additional language, because detectors flag them unfairly. The game may only say this about a reply if it's true of whoever wrote it. If you'd like that in the story, one voice must genuinely be written that way. Otherwise it stays in the teacher notes.
