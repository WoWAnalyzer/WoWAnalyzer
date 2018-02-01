import React from 'react';
import PropTypes from 'prop-types';
import Textfit from 'react-textfit';

import getBossName from 'common/getBossName';

import SkullRaidMarker from './Images/skull-raidmarker.png';

const Headers = ({ spec, playerName, boss, fight }) => (
  <header>
    <div className={`player ${spec.className.replace(' ', '')}`}>
      <img src={`/specs/${spec.className.replace(' ', '')}-${spec.specName.replace(' ', '')}.jpg`} alt="Player avatar" />{' '}
      <Textfit mode="single" max={80}>
        {playerName}
      </Textfit>
    </div>
    <div className="versus">versus</div>
    <div className="boss">
      <img src={boss ? boss.headshot : SkullRaidMarker} alt="Boss avatar" />
      <Textfit mode="single" max={80}>
        {getBossName(fight)}
      </Textfit>
    </div>
  </header>
);
Headers.propTypes = {
  spec: PropTypes.shape({
    className: PropTypes.string.isRequired,
    specName: PropTypes.string.isRequired,
  }).isRequired,
  playerName: PropTypes.string.isRequired,
  boss: PropTypes.shape({
    headshot: PropTypes.string.isRequired,
  }),
  fight: PropTypes.object.isRequired,
};

export default Headers;
