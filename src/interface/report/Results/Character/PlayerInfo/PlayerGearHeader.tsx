import React from 'react';
import { Link } from 'react-router-dom';

import { makeCharacterUrl } from 'interface/common/makeAnalyzerUrl';
import Combatant from 'parser/core/Combatant';

interface Props {
  player: Combatant;
  averageIlvl: number;
}

const PlayerGearHeader = ({ player, averageIlvl }: Props) => (
  <div className="player-gear-header">
    <div className={`${player.spec.className.replace(' ', '')} player-name`}>
      <Link to={makeCharacterUrl(player)}>
        {player.name}
        <br></br>
        {player.characterProfile && player.characterProfile.realm}</Link>
    </div>
    <div>
      {player.race && player.race.name} {player.spec.className}
    </div>
    <div>
      <b>Average ilvl:</b> {Math.round(averageIlvl)}
    </div>
  </div>
);

export default PlayerGearHeader;
