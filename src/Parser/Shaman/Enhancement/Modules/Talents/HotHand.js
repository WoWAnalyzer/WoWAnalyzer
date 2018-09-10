import React from 'react';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const HOT_HANDS = {
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
    if(!this.selectedCombatant.hasBuff(SPELLS.HOT_HAND.id)) {
      return;
    }
    if (event.ability.guid!==SPELLS.LAVA_LASH){
      return;
    }
    this.damageGained += calculateEffectiveDamage(event, HOT_HANDS.INCREASE);
    this.maelstromSaved += HOT_HANDS.COST_REDUCTION;

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
        icon={<SpellIcon id={SPELLS.LANDSLIDE_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default HotHand;
