import React from 'react';
import PropTypes from 'prop-types';

import char1 from './images/char1.png';
import char2 from './images/char2.png';
import char3 from './images/char3.png';
import char4 from './images/char4.png';
import char5 from './images/char5.png';
import char1Active from './images/char1-active.png';
import char2Active from './images/char2-active.png';
import char3Active from './images/char3-active.png';
import char4Active from './images/char4-active.png';
import char5Active from './images/char5-active.png';

import './PlayerHits.scss';

const CharacterHitPerCast = props => {
  const { performance } = props;

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
        <div
          style={{
            backgroundImage: `url(${char1Active})`,
            '--p': Math.max(0, Math.min(1, performance / 0.2)),
          }}
        />
        <div
          style={{
            backgroundImage: `url(${char2Active})`,
            '--p': Math.max(0, Math.min(1, (performance - 0.2) / 0.2)),
          }}
        />
        <div
          style={{
            backgroundImage: `url(${char3Active})`,
            '--p': Math.max(0, Math.min(1, (performance - 0.4) / 0.2)),
          }}
        />
        <div
          style={{
            backgroundImage: `url(${char4Active})`,
            '--p': Math.max(0, Math.min(1, (performance - 0.6) / 0.2)),
          }}
        />
        <div
          style={{
            backgroundImage: `url(${char5Active})`,
            '--p': Math.max(0, Math.min(1, (performance - 0.8) / 0.2)),
          }}
        />
      </div>
    </div>
  );
};

CharacterHitPerCast.propTypes = {
  performance: PropTypes.number.isRequired,
};

export default CharacterHitPerCast;
