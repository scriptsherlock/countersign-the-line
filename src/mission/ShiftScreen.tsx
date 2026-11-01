import { useMemo, useReducer, useState } from 'react';
import { artFor } from '../assets/art';
import { CharacterPortrait, Button, Stamp } from '../components/ui';
import { CLUES, QUESTIONS, questionById } from '../content/questions';
import { SHIFTS } from '../content/shifts';
import { isHuman, replyOf, sourceOf, type VoiceId } from '../content/voices';
import type { Band } from '../engine/dialogue';
import { allComplete, clueResult, newShift, outcomeLine, points, shift as reducer, type Mark, type OperatorResult, type ShiftResult, type Verdict } from '../engine/shift';

const VERDICTS: { id: Verdict; label: string }[] = [{ id: 'human', label: 'Human' }, { id: 'machine', label: 'Machine' }, { id: 'unsure', label: 'Not enough evidence' }];
const LABEL = { human: 'Human', machine: 'Machine', unsure: 'Not enough evidence' };

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j]!, out[i]!]; }
  return out;
}

function resultFor(voice: VoiceId, mark: Mark): OperatorResult {
  const verdict = mark.verdict!, human = isHuman(voice);
  const right = verdict === 'unsure' ? false : (verdict === 'human') === human;
  return { voice, human, verdict, confidence: verdict === 'unsure' ? null : mark.confidence, clue: mark.clue!, right, points: points(verdict, mark.confidence, right) };
}

function Toggle({ label, value, options, onPick }: { label: string; value: string | null; options: { id: string; label: string }[]; onPick: (id: string) => void }) {
  return (
    <div className="toggle" role="group" aria-label={label}>
      {options.map(o => <button key={o.id} type="button" aria-pressed={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onPick(o.id)}>{o.label}</button>)}
    </div>
  );
}

function Operator({ sign, voice, asked, mark, step, onMark }: { sign: string; voice: VoiceId; asked: string[]; mark: Mark; step: string; onMark: (mark: Partial<Mark>) => void }) {
  const open = step === 'revealed' || step === 'revised', result = open ? resultFor(voice, mark) : null, source = sourceOf(voice);
  return (
    <article className="operator panel" aria-label={`Operator ${sign}`}>
      <header>{artFor('operator') && <img className="operator-mark" src={artFor('operator')} alt="" />}<h3>{sign}</h3>{result && <Stamp tone={result.human ? 'ok' : 'warn'}>{result.human ? 'Human' : 'Machine'}</Stamp>}</header>
      <ol className="replies" aria-live="polite">
        {asked.map(id => <li key={id} className="reply"><span className="reply-q">{questionById(id).text}</span><span className="reply-a">{replyOf(voice, id)}</span></li>)}
        {!asked.length && <li className="dim">Waiting on the line.</li>}
      </ol>
      {step === 'judging' && (
        <div className="judge">
          <Toggle label={`Verdict for ${sign}`} value={mark.verdict} options={VERDICTS} onPick={id => onMark({ verdict: id as Verdict })} />
          {mark.verdict && mark.verdict !== 'unsure' && <Toggle label={`How sure about ${sign}`} value={mark.confidence} options={[{ id: 'sure', label: 'Sure' }, { id: 'unsure', label: 'Unsure' }]} onPick={id => onMark({ confidence: id as Mark['confidence'] })} />}
          <label>Your reason
            <select value={mark.clue ?? ''} onChange={e => onMark({ clue: e.target.value })} aria-label={`Reason for ${sign}`}>
              <option value="" disabled>Pin a clue</option>
              {CLUES.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
      )}
      {result && (
        <div className="reveal">
          <p className="reveal-title">{source.title}</p>
          <p className="dim">{source.detail}</p>
          {source.file && <pre className="persona">{source.file.join('\n')}</pre>}
          <p><b>You said:</b> {LABEL[result.verdict]}{result.confidence ? `, ${result.confidence}` : ''}.</p>
          <p>{outcomeLine(result.verdict, result.confidence, result.right)}</p>
          <p className="dim">“{result.clue}” {{ helped: 'helped here.', misled: 'misled you here.', unused: 'wasn’t tested here.' }[clueResult(result)]}</p>
        </div>
      )}
    </article>
  );
}

export function ShiftScreen({ index, band, rank, onDone }: { index: number; band: Band; rank: string; onDone: (result: ShiftResult) => void }) {
  const info = SHIFTS[index]!;
  // Order is shuffled per play, so that the left seat never means the same thing twice.
  const voices = useMemo(() => shuffled(info.voices), [info]);
  const [state, dispatch] = useReducer(reducer, undefined, () => newShift(info.bars, voices.length));
  const [revision, setRevision] = useState('');
  const asking = state.step === 'asking', judging = state.step === 'judging', open = state.step === 'revealed' || state.step === 'revised';
  const used = [...new Set(state.marks.map(m => m.clue).filter((c): c is string => !!c))];

  const finish = () => onDone({ shift: index, operators: voices.map((voice, i) => resultFor(voice, state.marks[i]!)), revision: state.revision ?? 'none' });

  return (
    <div className="app">
      <header className="top">
        <div className="brand"><h1>The Line</h1><p>{info.name}: shift {index + 1} of {SHIFTS.length}</p></div>
        <div className="bars" role="img" aria-label={`Signal: ${state.bars} of ${info.bars} bars left`}>{Array.from({ length: info.bars }, (_, i) => <span key={i} className={i < state.bars ? 'on' : ''} style={{ height: `${10 + i * 7}px` }} />)}</div>
        <div className="rank"><div><strong>{rank}</strong><span>Mission 02</span></div></div>
      </header>
      <main className="room" style={{ '--ops': voices.length } as React.CSSProperties}>
        <section className="operators" aria-label="Operators">
          {voices.map((voice, i) => <Operator key={voice} sign={info.signs[i]!} voice={voice} asked={state.asked} mark={state.marks[i]!} step={state.step} onMark={mark => dispatch({ type: 'mark', slot: i, mark })} />)}
        </section>
        <aside className="desk panel">
          <div className="assistant"><div className="assistant-art"><CharacterPortrait who="warden" pose={judging ? 'matched' : 'idle'} /></div><p><b>Warden:</b> {info.warden}</p></div>
          {asking && (
            <div className="cards">
              <h2>Ask the line</h2>
              {info.offer.map(id => {
                const q = QUESTIONS.find(x => x.id === id)!, spent = state.asked.includes(id), locked = !!q.after && !state.asked.includes(q.after);
                return <button key={id} type="button" className="question" disabled={spent || locked} onClick={() => dispatch({ type: 'ask', question: id, after: q.after })}><small>{q.category}</small>{locked ? 'Ask for a number first' : q.text}</button>;
              })}
              {state.asked.length > 0 && <Button onClick={() => dispatch({ type: 'judge' })}>I’ve heard enough</Button>}
            </div>
          )}
          {judging && (
            <div className="cards">
              <h2>{state.bars ? 'Your verdict' : 'The line’s gone quiet'}</h2>
              <p className="dim">Mark every operator, and pin a reason. You can say there isn’t enough evidence.</p>
              <Button variant="key" disabled={!allComplete(state)} onClick={() => dispatch({ type: 'reveal' })}>Print the source</Button>
            </div>
          )}
          {state.step === 'revealed' && (
            <div className="cards">
              <h2>Check your reasons</h2>
              <p className="dim">Which clue would you trust less next time?</p>
              <select aria-label="Clue to trust less" value={revision} onChange={e => setRevision(e.target.value)}>
                <option value="" disabled>Choose one</option>
                {used.map(c => <option key={c}>{c}</option>)}
                <option value="none">None of them</option>
              </select>
              <Button variant="key" disabled={!revision} onClick={() => dispatch({ type: 'revise', clue: revision })}>Log it</Button>
            </div>
          )}
          {state.step === 'revised' && (
            <div className="cards">
              <h2>Debrief</h2>
              <p>{info.debrief[band]}</p>
              <Button variant="key" autoFocus onClick={finish}>{index + 1 < SHIFTS.length ? 'Next' : 'Follow the signal'}</Button>
            </div>
          )}
          {open && <p className="dim note-speed">Reply speed was never a clue here: every operator was shown the same way.</p>}
        </aside>
      </main>
      <footer className="foot">A practice game inspired by the Turing Test. Your score here isn’t a test of real-world detection. Nothing leaves your device.</footer>
    </div>
  );
}
