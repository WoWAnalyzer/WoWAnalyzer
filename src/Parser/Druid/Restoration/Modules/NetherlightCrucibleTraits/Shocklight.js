import React from 'react';

import STAT from "Parser/Core/Modules/Features/STAT";
import CoreShocklight from "Parser/Core/Modules//NetherlightCrucibleTraits/Shocklight";
import HealingDone from 'Parser/Core/Modules/HealingDone';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import StatWeights from '../Features/StatWeights';

const CRIT_AMOUNT = 1500;

class MurderousIntent extends CoreShocklight {
  static dependencies = {
    ...CoreShocklight.dependencies,
    healingDone: HealingDone,
    statWeights: StatWeights,
  };

  subStatistic() {
    const shockLightUptime = this.combatants.selected.getBuffUptime(SPELLS.SHOCKLIGHT_BUFF.id) / this.owner.fightDuration;
    const averageCritGained = shockLightUptime * CRIT_AMOUNT * this.traitLevel;
    const healing = this.statWeights._getGain(STAT.CRITICAL_STRIKE) * averageCritGained;

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SHOCKLIGHT_TRAIT.id}>
            <SpellIcon id={SPELLS.SHOCKLIGHT_TRAIT.id} noLink /> Shocklight
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(healing / this.healingDone.total.effective)} % / {formatNumber(healing / this.owner.fightDuration * 1000)} HPS
        </div>
      </div>
    );
  }
}

export default MurderousIntent;
