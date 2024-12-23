import getAverageItemLevel from 'game/getAverageItemLevel';
import Combatant from 'parser/core/Combatant';
import { Item } from 'parser/core/Events';

import './PlayerInfo.scss';
import PlayerGearHeader from './PlayerGearHeader';
import PlayerInfoEnchants from './PlayerInfoEnchants';
import PlayerInfoGear from './PlayerInfoGear';
import PlayerInfoGems from './PlayerInfoGems';
import PlayerInfoTalents from './PlayerInfoTalents';
import GameBranch from 'game/GameBranch';
import { CLASS_NAMES } from 'game/CLASSES';

function _parseGear(gear: Item[]) {
  return gear.reduce((gearItemsBySlotId: Item[], item: Item) => gearItemsBySlotId.concat(item), []);
}

interface Props {
  combatant: Combatant;
}

export const characterBackgroundImage = (thumbnail?: string, region?: string): string => {
  if (thumbnail?.startsWith('https')) {
    return thumbnail.replace('avatar.jpg', 'main-raw.png');
  } else if (thumbnail && region) {
    return `https://render-${region}.worldofwarcraft.com/character/${thumbnail.replace(
      'avatar.jpg',
      'main-raw.png',
    )}`;
  } else {
    return '/img/fallback-character.jpg';
  }
};
export const classBackgroundImage = (className?: string, region?: string): string | null => {
  if (className && region) {
    return `https://render.worldofwarcraft.com/${region}/profile-backgrounds/v2/armory_bg_class_${className.toLowerCase().replaceAll(' ', '_')}.jpg`;
  }

  return null;
};

const PlayerInfo = ({ combatant }: Props) => {
  const isRetail = combatant.owner.config.branch === GameBranch.Retail;
  const gear: Item[] = _parseGear(combatant._combatantInfo.gear);
  const talents = combatant._combatantInfo.talentTree;
  const averageIlvl = getAverageItemLevel(gear);
  console.log(combatant.characterProfile);
  const classBackground = combatant.characterProfile?.class
    ? classBackgroundImage(
        CLASS_NAMES[combatant.characterProfile?.class].name,
        combatant.characterProfile?.region,
      )
    : undefined;
  const characterBackground = characterBackgroundImage(
    combatant.characterProfile?.thumbnail,
    combatant.characterProfile?.region,
  );
  return (
    <div className="player-info">
      <div className="class-background" style={{ backgroundImage: `url(${classBackground})` }}>
        <div
          className="player-gear player-background"
          style={{ backgroundImage: `url(${characterBackground})` }}
        >
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
