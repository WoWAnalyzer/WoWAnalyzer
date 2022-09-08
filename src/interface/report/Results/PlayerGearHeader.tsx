import { RETAIL_EXPANSION } from 'game/Expansion';
import { makeCharacterUrl } from 'interface/makeAnalyzerUrl';
import Combatant from 'parser/core/Combatant';
import { Link } from 'react-router-dom';

interface Props {
  player: Combatant;
  averageIlvl: number;
}

const PlayerGearHeader = ({ player, averageIlvl }: Props) => (
  <div className="player-gear-header">
    <div className={`${player.player.type.replace(' ', '')} player-name`}>
      <Link to={makeCharacterUrl(player)}>
        {player.name}
        <br></br>
        {player.characterProfile && player.characterProfile.realm}
      </Link>
    </div>
    <div>
      {player.race && player.race.name} {player.player.type}{' '}
      {player.owner.config.expansion !== RETAIL_EXPANSION && `(${player.talentPoints.join('/')})`}
    </div>
    <div>
      <b>Average ilvl:</b> {Math.round(averageIlvl)}
    </div>
  </div>
);

export default PlayerGearHeader;
