import React from 'react';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox from 'Interface/Others/StatisticBox';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const HOT_HAND = {
  INCREASE: 1.0,
  COST_REDUCTION: SPELLS.LAVA_LASH.maelstrom,
};

class HotHand extends Analyzer {

  damageGained=0;
  maelstromSaved=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HOT_HAND_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if(!this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF.id)) {
      return;
    }
    if (event.ability.guid!==SPELLS.LAVA_LASH.id){
      return;
    }
    this.damageGained += calculateEffectiveDamage(event, HOT_HAND.INCREASE);
    this.maelstromSaved += HOT_HAND.COST_REDUCTION;

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
        icon={<SpellIcon id={SPELLS.HOT_HAND_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
}

export default HotHand;
