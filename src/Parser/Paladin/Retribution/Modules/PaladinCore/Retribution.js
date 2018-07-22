import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../Constants';

const RETRIBUTION_DAMAGE_BONUS = 0.2;

class Retribution extends Analyzer {
  bonusDmg = 0;

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.RETRIBUTION_BUFF.id) || !ABILITIES_AFFECTED_BY_DAMAGE_INCREASES.includes(spellId)) {
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, RETRIBUTION_DAMAGE_BONUS);
  }

  on_finished() {
    this.active = this.bonusDmg > 0;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RETRIBUTION_BUFF.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`Retribution contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.UNIMPORTANT();
}

export default Retribution;
