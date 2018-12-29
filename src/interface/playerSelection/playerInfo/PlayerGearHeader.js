import React from 'react';
import PropTypes from 'prop-types';

const PlayerGearHeader = ({ player, averageIlvl }) => {


  return (
    <div className="player-gear-header">
      <span className={`${player.spec.className.replace(' ', '')} player-name`}>
        <b>{player.name}</b>
      </span>
      <span>
        <b>Item Level:</b> {averageIlvl.toFixed(1)}
      </span>
    </div>
  );
};
PlayerGearHeader.propTypes = {
  player: PropTypes.object.isRequired,
  averageIlvl: PropTypes.number.isRequired,
};

export default PlayerGearHeader;
