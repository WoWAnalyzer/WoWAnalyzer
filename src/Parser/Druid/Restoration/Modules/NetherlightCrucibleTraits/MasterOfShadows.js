import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import CoreMasterOfShadows from 'Parser/Core/Modules/NetherlightCrucibleTraits/MasterOfShadows';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import STAT from 'Parser/Core/Modules/Features/STAT';
import ItemHealingDone from 'Main/ItemHealingDone';

import StatWeights from '../Features/StatWeights';

const MASTERY_AMOUNT = 500;

/**
 * Mastery of Shadow
 * Mastery increased by 500, avoidance increased by 100.
 * Only the Mastery part is handled here.
 */
class MasterOfShadows extends CoreMasterOfShadows {
  static dependencies = {
    ...CoreMasterOfShadows.dependencies,
    healingDone: HealingDone,
    statWeights: StatWeights,
  };

  subStatistic() {
    const masteryGained = MASTERY_AMOUNT * this.traitLevel;
    const healing = this.statWeights._getGain(STAT.MASTERY) * masteryGained;

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.MASTER_OF_SHADOWS_TRAIT.id}>
            <SpellIcon id={SPELLS.MASTER_OF_SHADOWS_TRAIT.id} noLink /> Master of Shadows
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemHealingDone amount={healing} />
        </div>
      </div>
    );
  }
}

export default MasterOfShadows;
