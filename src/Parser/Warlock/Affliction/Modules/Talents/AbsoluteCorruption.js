import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';

import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SpellLink from 'common/SpellLink';

const AC_DAMAGE_BONUS = 0.15;

class AbsoluteCorruption extends Analyzer {
  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CORRUPTION_DEBUFF.id) {
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, AC_DAMAGE_BONUS);
  }

  get dps() {
    return this.bonusDmg / this.owner.fightDuration * 1000;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.ABSOLUTE_CORRUPTION_TALENT.id} /> bonus damage
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Your Absolute Corruption talent contributed ${formatThousands(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).<br /><br />Note: This only accounts for the passive 15% increased damage of Corruption. Actual bonus damage is a lot higher due to saved GCDs.`}>
            {formatThousands(this.dps)} DPS
          </dfn>
        </div>
      </div>
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default AbsoluteCorruption;
