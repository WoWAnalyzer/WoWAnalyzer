import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const AC_DAMAGE_BONUS = 0.25;

class AbsoluteCorruption extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CORRUPTION_DEBUFF.id) {
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, AC_DAMAGE_BONUS);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ABSOLUTE_CORRUPTION_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`Your Absolute Corruption talent contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).<br /><br />Note: This only accounts for the passive 25% increased damage. Actual bonus damage is a lot higher due to saved GCDs.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default AbsoluteCorruption;
