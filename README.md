# Countersign: The Line

**[Play in your browser](https://scriptsherlock.github.io/countersign-the-line/)**

Mission 02 of [Countersign](https://github.com/scriptsherlock/countersign). Question anonymous operators over a teleprinter and work out who is a machine, and say how sure you are. It teaches the Turing Test, judging evidence, honest doubt and human bias.

**Status: not ready for pupils.** Apart from the rules bot, the replies are sample text until real human and model replies are in. The game says so on screen, and never presents them as real.

It's one offline HTML file, with no accounts, tracking or network calls. It's inspired by the Turing Test, and it isn't a scientific test of anything.

## Develop

Node 22 or later.

```sh
npm ci
npm run dev
npm run build          # one file in dist/
npm run check          # delivery checks and unit tests
npm run check:release  # fails while replies are still sample text
npm run test:e2e
```

Writing the human replies: [docs/WRITING_PACK.md](docs/WRITING_PACK.md). Art was generated with Codex for this project: see `src/assets/licences.json`.
