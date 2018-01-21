import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import CoreLightSpeed from 'Parser/Core/Modules/NetherlightCrucibleTraits/LightSpeed';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import STAT from 'Parser/Core/Modules/Features/STAT';
import ItemHealingDone from 'Main/ItemHealingDone';

import StatWeights from '../Features/StatWeights';

const HASTE_AMOUNT = 500;

/**
 * Light speed
 * Haste increased by 500, movement speed increased by 650.
 * Only the haste part is handled here.
 */
class LightSpeed extends CoreLightSpeed {
  static dependencies = {
    ...CoreLightSpeed.dependencies,
    healingDone: HealingDone,
    statWeights: StatWeights,
  };

  subStatistic() {
    const hasteGained = HASTE_AMOUNT * this.traitLevel;
    const healing = this.statWeights._getGain(STAT.HASTE_HPM) * hasteGained;

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.LIGHT_SPEED_TRAIT.id}>
            <SpellIcon id={SPELLS.LIGHT_SPEED_TRAIT.id} noLink /> Light Speed
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemHealingDone amount={healing} />
        </div>
      </div>
    );
  }
}

export default LightSpeed;
