import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { artFor } from '../assets/art';
import type { CharacterId, SceneId } from '../engine/dialogue';

export function Button({ variant = 'quiet', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'key' | 'quiet' }) {
  return <button type="button" {...props} className={`btn btn-${variant} ${props.className ?? ''}`} />;
}

export const Stamp = ({ children, tone, big }: { children: ReactNode; tone: 'bad' | 'ok' | 'warn' | 'off'; big?: boolean }) => <span className={`stamp st-${tone} ${big ? 'big' : ''}`}>{children}</span>;

export function SceneStage({ scene, children }: { scene: SceneId; children?: ReactNode }) {
  const image = artFor(`scene-${scene}`) ?? artFor('scene-desk');   // the Line room art hasn't arrived yet
  return (
    <div className="stage scene-enter" key={scene}>
      <div className="stage-art">{image && <img src={image} alt="" />}</div>
      {children}
    </div>
  );
}

const REST: Partial<Record<CharacterId, string>> = { adeyemi: 'neutral' };

// Static is never seen, and this mission's guards appear only as Warden, so everything here is finished art.
export function CharacterPortrait({ who, pose }: { who: CharacterId; pose?: string }) {
  const image = artFor(who === 'sparks' ? 'sparks-idle' : `${who}-${pose ?? REST[who] ?? 'idle'}`) ?? artFor(`${who}-${REST[who] ?? 'idle'}`);
  return image ? <img className="portrait-image" src={image} alt="" /> : null;
}
