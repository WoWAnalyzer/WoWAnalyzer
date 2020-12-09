import React from 'react';

import getAverageItemLevel from 'game/getAverageItemLevel';
import Combatant from 'parser/core/Combatant';
import { Item } from 'parser/core/Events';

import './PlayerInfo.scss';
import Enchants from './Enchants';
import Gear from './Gear';
import Gems from './Gems';
import PlayerGearHeader from './PlayerGearHeader';
import Talents from './Talents';

function _parseTalents(talents: TalentsType[]): number[] {
  return talents.reduce((talentsByRow: number[], talent: TalentsType) => talentsByRow.concat(talent.id), []);
}

function _parseGear(gear: Item[]) {
  return gear.reduce((gearItemsBySlotId: Item[], item: Item) => gearItemsBySlotId.concat(item), []);
}

interface TalentsType {
  icon: string;
  id: number;
}

interface Props {
  combatant: Combatant;
}

const PlayerInfo = ({ combatant }: Props) => {
  const gear: Item[] = _parseGear(combatant._combatantInfo.gear);
  const talents: number[] = _parseTalents(combatant._combatantInfo.talents);

  const averageIlvl = getAverageItemLevel(gear);

  const background = combatant.characterProfile && combatant.characterProfile.thumbnail ? `https://render-${combatant.characterProfile.region}.worldofwarcraft.com/character/${combatant.characterProfile.thumbnail.replace('avatar', 'main')}` : '/img/fallback-character.jpg';

  return (
    <div className="player-info">
      <div className="player-background" style={{ backgroundImage: `url(${background})` }}>
        <div className="player-gear">
          <PlayerGearHeader player={combatant} averageIlvl={averageIlvl} />
          <Gear gear={gear} />
          <Gems gear={gear} />
          <Enchants gear={gear} />
        </div>
      </div>
      <div className="player-details">
        <div className="player-details-talents">
          <Talents talents={talents} />
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
