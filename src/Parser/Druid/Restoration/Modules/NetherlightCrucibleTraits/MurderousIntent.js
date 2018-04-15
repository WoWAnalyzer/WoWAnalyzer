import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreMurderousIntent from 'Parser/Core/Modules//NetherlightCrucibleTraits/MurderousIntent';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import STAT from 'Parser/Core/Modules/Features/STAT';
import ItemHealingDone from 'Main/ItemHealingDone';

import StatWeights from '../Features/StatWeights';

const VERSATILITY_AMOUNT = 1500;

class MurderousIntent extends CoreMurderousIntent {
  static dependencies = {
    ...CoreMurderousIntent.dependencies,
    healingDone: HealingDone,
    statWeights: StatWeights,
  };

  subStatistic() {
    const murderousIntentUptime = this.combatants.selected.getBuffUptime(SPELLS.MURDEROUS_INTENT_BUFF.id) / this.owner.fightDuration;
    const averageVersatilityGained = murderousIntentUptime * VERSATILITY_AMOUNT * this.traitLevel;
    const healing = this.statWeights._getGain(STAT.VERSATILITY) * averageVersatilityGained;

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.MURDEROUS_INTENT_BUFF.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemHealingDone amount={healing} />
        </div>
      </div>
    );
  }
}

export default MurderousIntent;
