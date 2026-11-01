// Developer tool. Generates the machine operators' replies with the Claude Message Batches API and writes them
// for a person to review. It is never bundled into the game, and the key stays in the environment.
// Not yet run: it needs an API key. Check the current API docs before the first real run.
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const MODEL = process.env.SNAPSHOT_MODEL ?? 'claude-opus-5-5';
const source = readFileSync(resolve(ROOT, 'src/content/voices.ts'), 'utf8');
const questionsSource = readFileSync(resolve(ROOT, 'src/content/questions.ts'), 'utf8');

// Read from the game's own files, so that the prompt sent is exactly the prompt shown to pupils.
const personas = Object.fromEntries([...source.matchAll(/^  (plain|breezy|mimic|wry): \[(.*)\],$/gm)].map(([, id, list]) => [id, [...list.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m => m[1]).join('\n')]));
const questions = [...questionsSource.matchAll(/\{ id: '(\w+)', category: '[^']*', text: '([^']*)'(?:, after: '(\w+)')? \}/g)].map(([, id, text, after]) => ({ id, text, after }));
if (Object.keys(personas).length !== 4 || questions.length !== 12) throw new Error('Could not read the personas and questions.');

const byId = Object.fromEntries(questions.map(q => [q.id, q]));
const requests = Object.entries(personas).flatMap(([voice, system]) => questions.filter(q => !q.after).map(q => ({
  custom_id: `${voice}__${q.id}`,
  params: { model: MODEL, max_tokens: 300, system: `${system}\nKeep your reply under 25 words.`, messages: [{ role: 'user', content: q.text }] },
})));

const client = new Anthropic();
const batch = await client.messages.batches.create({ requests });
console.log(`Batch ${batch.id} started with ${requests.length} requests.`);

let status = batch;
while (status.processing_status !== 'ended') {
  await new Promise(done => setTimeout(done, 15000));
  status = await client.messages.batches.retrieve(batch.id);
}

const textOf = message => message.content.filter(block => block.type === 'text').map(block => block.text).join('').trim();
const voices = Object.fromEntries(Object.keys(personas).map(id => [id, {}]));
const failed = [];
for await (const entry of await client.messages.batches.results(batch.id)) {
  const [voice, question] = entry.custom_id.split('__');
  // A refusal has a stop reason of its own, so it must never be stored as if it were a reply.
  if (entry.result.type === 'succeeded' && entry.result.message.stop_reason !== 'refusal') voices[voice][question] = textOf(entry.result.message);
  else failed.push(entry.custom_id);
}

// The follow-up needs its first answer in the conversation, so it runs afterwards, one at a time.
for (const [voice, system] of Object.entries(personas)) for (const q of questions.filter(x => x.after)) {
  const first = voices[voice][q.after];
  if (!first) { failed.push(`${voice}__${q.id}`); continue; }
  const message = await client.messages.create({ model: MODEL, max_tokens: 300, system: `${system}\nKeep your reply under 25 words.`, messages: [{ role: 'user', content: byId[q.after].text }, { role: 'assistant', content: first }, { role: 'user', content: q.text }] });
  if (message.stop_reason === 'refusal') failed.push(`${voice}__${q.id}`); else voices[voice][q.id] = textOf(message);
}

const out = resolve(ROOT, 'src/content/model-replies.pending.json');
writeFileSync(out, `${JSON.stringify({ _read_me: 'Review every reply. Then copy this over model-replies.json and set reviewedBy.', model: MODEL, date: new Date().toISOString().slice(0, 10), reviewedBy: null, voices }, null, 2)}\n`);
console.log(`Wrote ${out}.`, failed.length ? `Failed: ${failed.join(', ')}` : 'All replies generated.');
