import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber, formatPercentage } from 'common/format';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import STAT from "Parser/Core/Modules/Features/STAT";
import StatWeights from '../Features/StatWeights';

/**
 * Mastery of Shadow
 * Mastery increased by 500, avoidance increased by 100.
 * Only the Mastery part is handled here.
 */

const MASTERY_AMOUNT = 500;

class MasterOfShadows extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
    statWeights: StatWeights,
  };

  on_initialized() {
    this.traitLevel = this.combatants.selected.traitsBySpellId[SPELLS.MASTER_OF_SHADOWS.id];
    this.active = this.traitLevel > 0;
  }

  subStatistic() {
    const masteryGained = MASTERY_AMOUNT * this.traitLevel;
    const healing = this.statWeights._getGain(STAT.MASTERY) * masteryGained;

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.MASTER_OF_SHADOWS.id}>
            <SpellIcon id={SPELLS.MASTER_OF_SHADOWS.id} noLink /> Master of Shadows
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(healing / this.healingDone.total.effective)} % / {formatNumber(healing / this.owner.fightDuration * 1000)} HPS
        </div>
      </div>
    );
  }
}

export default MasterOfShadows;
