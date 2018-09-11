import React from 'react';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';


const FORCEFUL_WINDS = {
  INCREASE: 1,
};

class ForcefulWinds extends Analyzer {

  damageGained=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FORCEFUL_WINDS_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const buff = this.selectedCombatant.getBuff(SPELLS.FORCEFUL_WINDS_BUFF.id);
    if(!buff){
      return;
    }
    if(event.ability.guid!==SPELLS.WINDFURY_ATTACK.id){
      return;
    }
    const stacks = buff.stacks || 0;
    this.damageGained += calculateEffectiveDamage(event, stacks*FORCEFUL_WINDS.INCREASE);
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FORCEFUL_WINDS_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default ForcefulWinds;
