import React from 'react';
import PropTypes from 'prop-types';
import Link from 'react-router-dom/es/Link';

const ArmoryLink = function (player) {
  const profile = player.characterProfile;
  let battleNetUrl = `https://worldofwarcraft.com/en-${profile.region}/character/${profile.realm}/${player.name}`;
  if (profile.region === 'CN') {
    battleNetUrl = `https://www.wowchina.com/zh-cn/character/${profile.realm}/${player.name}`;
  }
  return battleNetUrl;
};

const WoWALink = function (player) {
  const profile = player.characterProfile;
  return `/character/${profile.region}/${profile.realm}/${player.name}`;
};

const PlayerGearHeader = ({ player, averageIlvl }) => (
  <div className="player-gear-header">
    <span className={`${player.spec.className.replace(' ', '')} player-name`}>
      <b>
        {/*<a
          href={ArmoryLink(player)}
          href=Link
          target="_blank"
          rel="noopener noreferrer"
          >*/}
        <Link to={WoWALink(player)}>{player.name}</Link></b>
    </span>
    <span className="">
      <b>
        {player.characterProfile.realm}
      </b>
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
