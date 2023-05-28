import { RETAIL_EXPANSION } from 'game/Expansion';
import getAverageItemLevel from 'game/getAverageItemLevel';
import Combatant from 'parser/core/Combatant';
import { Item } from 'parser/core/Events';

import './PlayerInfo.scss';
import PlayerGearHeader from './PlayerGearHeader';
import PlayerInfoEnchants from './PlayerInfoEnchants';
import PlayerInfoGear from './PlayerInfoGear';
import PlayerInfoGems from './PlayerInfoGems';
import PlayerInfoTalents from './PlayerInfoTalents';

function _parseGear(gear: Item[]) {
  return gear.reduce((gearItemsBySlotId: Item[], item: Item) => gearItemsBySlotId.concat(item), []);
}

interface Props {
  combatant: Combatant;
}

const PlayerInfo = ({ combatant }: Props) => {
  const isRetail = combatant.owner.config.expansion === RETAIL_EXPANSION;
  const gear: Item[] = _parseGear(combatant._combatantInfo.gear);
  const talents = combatant._combatantInfo.talentTree;
  const averageIlvl = getAverageItemLevel(gear);
  const background =
    combatant.characterProfile && combatant.characterProfile.thumbnail
      ? `https://render-${
          combatant.characterProfile.region
        }.worldofwarcraft.com/character/${combatant.characterProfile.thumbnail.replace(
          'avatar',
          'main',
        )}`
      : '/img/fallback-character.jpg';

  return (
    <div className="player-info">
      <div className="player-background" style={{ backgroundImage: `url(${background})` }}>
        <div className="player-gear">
          <PlayerGearHeader player={combatant} averageIlvl={averageIlvl} />
          <PlayerInfoGear gear={gear} />
          <PlayerInfoGems gear={gear} />
          <PlayerInfoEnchants gear={gear} />
        </div>
      </div>
      <div className="player-details">
        {isRetail && (
          <>
            <PlayerInfoTalents talents={talents} />
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerInfo;
