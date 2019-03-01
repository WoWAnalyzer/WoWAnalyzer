import React from 'react';
import PropTypes from 'prop-types';

const ArmoryLink = function (player) {
  const profile = player.characterProfile;
  let battleNetUrl = `https://worldofwarcraft.com/en-${profile.region}/character/${profile.realm}/${player.name}`;
  if (profile.region === 'CN') {
    battleNetUrl = `https://www.wowchina.com/zh-cn/character/${profile.realm}/${player.name}`;
  }
  return battleNetUrl;
};

const PlayerGearHeader = ({ player, averageIlvl }) => (
  <div className="player-gear-header">
    <span className={`${player.spec.className.replace(' ', '')} player-name`}>
      <b>
        <a
          href={ArmoryLink(player)}
          target="_blank"
          rel="noopener noreferrer"
          >{player.name}-{player.characterProfile.realm}</a></b>
    </span>
    <span>
      {player.race.name} {player.spec.className}
    </span>
    <span>
      <b>Item Level:</b> {averageIlvl.toFixed(1)}
    </span>
  </div>
);

PlayerGearHeader.propTypes = {
  player: PropTypes.object.isRequired,
  averageIlvl: PropTypes.number.isRequired,
};

export default PlayerGearHeader;
