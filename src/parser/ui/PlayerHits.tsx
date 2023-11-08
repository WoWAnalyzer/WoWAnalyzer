import { CSSProperties } from 'react';
import char1Active from './images/char1-active.png';
import char1 from './images/char1.png';
import char2Active from './images/char2-active.png';
import char2 from './images/char2.png';
import char3Active from './images/char3-active.png';
import char3 from './images/char3.png';
import char4Active from './images/char4-active.png';
import char4 from './images/char4.png';
import char5Active from './images/char5-active.png';
import char5 from './images/char5.png';

import './PlayerHits.scss';

interface Props {
  performance: number;
}

function performanceStyle(
  charImageUrl: string,
  performance: number,
  performanceCutoff: number,
): CSSProperties & { '--p': number } {
  return {
    backgroundImage: `url(${charImageUrl})`,
    '--p': Math.max(0, Math.min(1, (performance - performanceCutoff) / 0.2)),
  };
}

const CharacterHitPerCast = ({ performance }: Props) => {
  return (
    <div className="characters-hit-per-cast">
      <div className="backdrop">
        <div style={{ backgroundImage: `url(${char1})` }} />
        <div style={{ backgroundImage: `url(${char2})` }} />
        <div style={{ backgroundImage: `url(${char3})` }} />
        <div style={{ backgroundImage: `url(${char4})` }} />
        <div style={{ backgroundImage: `url(${char5})` }} />
      </div>
      <div className="active">
        <div style={performanceStyle(char1Active, performance, 0)} />
        <div style={performanceStyle(char2Active, performance, 0.2)} />
        <div style={performanceStyle(char3Active, performance, 0.4)} />
        <div style={performanceStyle(char4Active, performance, 0.6)} />
        <div style={performanceStyle(char5Active, performance, 0.8)} />
      </div>
    </div>
  );
};

export default CharacterHitPerCast;
