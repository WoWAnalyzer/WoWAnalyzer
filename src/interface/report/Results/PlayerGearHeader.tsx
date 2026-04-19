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
        {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
        <br></br>
        {player.characterProfile && player.characterProfile.realm}
      </Link>
    </div>
    <div>
      {player.race && player.race.name} {player.player.type}
    </div>
    <div>
      <b>Average ilvl:</b> {Math.round(averageIlvl)}
    </div>
  </div>
);

export default PlayerGearHeader;
