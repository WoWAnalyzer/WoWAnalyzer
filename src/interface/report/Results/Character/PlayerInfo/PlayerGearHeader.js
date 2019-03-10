import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { makeCharacterUrl } from 'interface/common/makeAnalyzerUrl';

const PlayerGearHeader = ({ player, averageIlvl }) => (
  <div className="player-gear-header">
    <div className={`${player.spec.className.replace(' ', '')} player-name`}>
      <Link to={makeCharacterUrl(player)}>{player.name}{player.characterProfile && <> - {player.characterProfile.realm}</>}</Link>
    </div>
    <div>
      {player.race.name} {player.spec.className}
    </div>
    <div>
      <b>Average ilvl:</b> {Math.round(averageIlvl)}
    </div>
  </div>
);

PlayerGearHeader.propTypes = {
  player: PropTypes.object.isRequired,
  averageIlvl: PropTypes.number.isRequired,
};

export default PlayerGearHeader;
