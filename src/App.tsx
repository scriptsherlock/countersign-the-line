import { useEffect, useReducer, useState, type FormEvent } from 'react';
import { artFor } from './assets/art';
import { DialogueBox } from './components/DialogueBox';
import { Button, SceneStage, Stamp } from './components/ui';
import { INJECTED, INTERLUDES, LAST_TAPE, OPENING, HOOK, TAPE_REPORT, TURING, VERDICTS, adeyemiReply } from './content/story';
import { SHIFTS } from './content/shifts';
import { newCampaign, reduce } from './engine/campaign';
import type { Band } from './engine/dialogue';
import { carriedFrom, rankFor } from './engine/progression';
import { clearGame, loadGame, saveGame } from './engine/save';
import { tally } from './engine/shift';
import { ShiftScreen } from './mission/ShiftScreen';

// Teachers and demos: add #unlock to the address to jump to any shift. Normal play is unchanged.
const UNLOCK_ALL = /unlock/.test(location.hash);

const STYLES: { band: Band; label: string; hint: string }[] = [
  { band: 'simple', label: 'Short and simple', hint: 'Years 4–6' },
  { band: 'standard', label: 'Standard', hint: 'Years 7–9' },
  { band: 'full', label: 'Full detail', hint: 'Years 10–13' },
];

function Title({ onNew, onContinue, onJump, saved }: { onNew: (band: Band, carried: number) => void; onContinue: () => void; onJump: (shift: number) => void; saved: boolean }) {
  const [choosing, setChoosing] = useState(false), [code, setCode] = useState(''), [carried, setCarried] = useState(0), [note, setNote] = useState('');
  const image = artFor('scene-title');
  const useCode = (e: FormEvent) => {
    e.preventDefault();
    const found = carriedFrom(code);
    setCarried(found);
    setNote(found ? 'File found. Your rank carries over.' : 'No signal on that code. Check it and try again.');
  };
  return (
    <main className="title">
      {image && <img className="title-image" src={image} alt="" />}
      <div className="title-text">
        <h1>Countersign</h1>
        <p className="title-tag">Mission 02: The Line</p>
        {choosing ? (
          <div className="styles" role="group" aria-label="Choose a briefing style">
            {STYLES.map(s => <Button key={s.band} variant={s.band === 'standard' ? 'key' : 'quiet'} autoFocus={s.band === 'standard'} onClick={() => onNew(s.band, carried)}>{s.label}<small>{s.hint}</small></Button>)}
          </div>
        ) : (
          <div className="row">
            <Button variant="key" autoFocus onClick={() => setChoosing(true)}>New file</Button>
            {saved && <Button onClick={onContinue}>Continue</Button>}
          </div>
        )}
        {UNLOCK_ALL && (
          <div className="jump" role="group" aria-label="Jump to a shift">
            <p className="jump-label">Jump to a shift</p>
            <div className="row">
              {SHIFTS.map((_, i) => <Button key={i} onClick={() => onJump(i)}>Shift {i + 1}</Button>)}
            </div>
          </div>
        )}
        <details className="codebox">
          <summary>Have a field code from Mission 01?</summary>
          <form className="row" onSubmit={useCode}>
            <input aria-label="Field code" value={code} onChange={e => setCode(e.target.value)} maxLength={14} spellCheck={false} autoComplete="off" />
            <Button type="submit">Open file</Button>
          </form>
          <p className="note" role="status">{note}</p>
        </details>
      </div>
      <p className="title-foot">A practice game inspired by the Turing Test. It isn’t a scientific test of anything.</p>
    </main>
  );
}

function TapeReveal({ band, onNext }: { band: Band; onNext: () => void }) {
  return (
    <SceneStage scene="hub">
      <div className="splice">
        <h2>The last tape</h2>
        <p className="joined"><span className="seg seg-unknown">{INJECTED}</span></p>
        <p className="splice-note">{TAPE_REPORT[band]}</p>
        <Button variant="key" autoFocus onClick={onNext}>Write the report</Button>
      </div>
    </SceneStage>
  );
}

function Report({ sureAndWrong, onDone }: { sureAndWrong: number; onDone: (verdict: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <SceneStage scene="desk">
      <div className="report">
        <h2>Your report on the Collective</h2>
        <div className="report-cards">{VERDICTS.map((v, i) => <button key={v.id} type="button" className={`evidence ${picked === v.id ? 'picked' : ''}`} autoFocus={i === 0} onClick={() => setPicked(v.id)}>{v.text}</button>)}</div>
        {picked && <div className="report-reply" role="status"><p><b>Supervisor Adeyemi:</b> {adeyemiReply(picked, sureAndWrong)}</p><Button variant="key" autoFocus onClick={() => onDone(picked)}>File it</Button></div>}
      </div>
    </SceneStage>
  );
}

function Turing({ onDone }: { onDone: (card: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null), portrait = artFor('turing-portrait');
  const card = TURING.cards.find(c => c.id === picked);
  return (
    <SceneStage scene="desk">
      <div className="turing">
        {portrait && <figure><img src={portrait} alt="Illustration of Alan Turing" /><figcaption>{TURING.title}. Illustration.</figcaption></figure>}
        <div className="turing-text">
          {TURING.lines.map(line => <p key={line}>{line}</p>)}
          <h2>{TURING.question}</h2>
          <div className="report-cards">{TURING.cards.map((c, i) => <button key={c.id} type="button" className={`evidence ${picked === c.id ? 'picked' : ''}`} autoFocus={i === 0} onClick={() => setPicked(c.id)}>{c.text}</button>)}</div>
          {card && <div className="report-reply" role="status"><p>{card.reply}</p>{card.right && <Button variant="key" autoFocus onClick={() => onDone(card.id)}>Close the file</Button>}</div>}
        </div>
      </div>
    </SceneStage>
  );
}

export function App() {
  const [state, dispatch] = useReducer(reduce, undefined, newCampaign);
  const [saved] = useState(loadGame);
  useEffect(() => { if (state.stage !== 'title') saveGame(state); }, [state]);

  const rank = rankFor(state.carried + state.results.length), record = tally(state.results);
  const next = () => dispatch({ type: 'next' });

  switch (state.stage) {
    case 'title':
      return <Title saved={!!saved} onContinue={() => saved && dispatch({ type: 'continue', saved })} onNew={(band, carried) => { clearGame(); dispatch({ type: 'newFile', band, carried }); }} onJump={shift => { clearGame(); dispatch({ type: 'jumpShift', shift }); }} />;
    case 'opening':
      return <main className="full"><SceneStage scene={OPENING.scene}><DialogueBox script={OPENING} band={state.band} onDone={next} /></SceneStage></main>;
    case 'shift':
      return <ShiftScreen key={state.shift} index={state.shift} band={state.band} rank={rank} onDone={result => dispatch({ type: 'shiftDone', result, last: state.shift + 1 >= SHIFTS.length })} />;
    case 'interlude': {
      const script = INTERLUDES[state.shift]!;
      return <main className="full"><SceneStage scene={script.scene}><DialogueBox key={state.shift} script={script} band={state.band} onDone={next} /></SceneStage></main>;
    }
    case 'lastTape':
      return <main className="full"><LastTape band={state.band} onNext={next} /></main>;
    case 'report':
      return <main className="full"><Report sureAndWrong={record.sureAndWrong} onDone={verdict => dispatch({ type: 'verdict', verdict })} /></main>;
    case 'turing':
      return <main className="full"><Turing onDone={card => dispatch({ type: 'endCard', card })} /></main>;
    case 'file':
      return (
        <main className="full">
          <SceneStage scene="skyline">
            <div className="file-card centre">
              <Stamp tone="ok" big>Case open</Stamp>
              <h2>Mission 02 complete</h2>
              <p>Rank: <strong>{rank}</strong>. Score: {record.score} of {record.best}.</p>
              <p>You marked {record.peopleAsMachines} {record.peopleAsMachines === 1 ? 'person' : 'people'} as machines and {record.machinesAsPeople} {record.machinesAsPeople === 1 ? 'machine' : 'machines'} as people. You were sure and wrong {record.sureAndWrong} {record.sureAndWrong === 1 ? 'time' : 'times'}, and said “not enough evidence” {record.unsure} {record.unsure === 1 ? 'time' : 'times'}.</p>
              <p className="dim">This score is about these replies only. It says nothing about spotting AI in real life.</p>
              <div className="static">{HOOK.map(line => <p key={line}>{line}</p>)}</div>
              <Button onClick={() => { clearGame(); dispatch({ type: 'restart' }); }}>Start a new file</Button>
            </div>
          </SceneStage>
        </main>
      );
  }
}

function LastTape({ band, onNext }: { band: Band; onNext: () => void }) {
  const [read, setRead] = useState(false);
  if (read) return <TapeReveal band={band} onNext={onNext} />;
  return <SceneStage scene={LAST_TAPE.scene}><DialogueBox script={LAST_TAPE} band={band} onDone={() => setRead(true)} /></SceneStage>;
}
