import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import STAT from 'Parser/Core/Modules/Features/STAT';
import CoreShocklight from 'Parser/Core/Modules/NetherlightCrucibleTraits/Shocklight';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import ItemHealingDone from 'Main/ItemHealingDone';

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
          <SpellLink id={SPELLS.SHOCKLIGHT_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemHealingDone amount={healing} />
        </div>
      </div>
    );
  }
}

export default MurderousIntent;
