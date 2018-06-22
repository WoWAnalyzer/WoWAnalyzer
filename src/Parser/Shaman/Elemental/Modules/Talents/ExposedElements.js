import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import enemy from 'Parser/Core/Entity';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS/SHAMAN';

import { EXPOSED_ELEMENTS } from 'Parser/Shaman/Elemental/Constants';

class ExposedElements extends Analyzer {
  removeDebuffTimestamp = null;
  damageGained=0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.EXPOSED_ELEMENTS_TALENT.id);
  }

  on_byPlayer_cast(event){
    if(this.removeDebuffTimestamp === null)
      return;

    if((event.ability.guid === SPELLS.LIGHTNING_BOLT.id) && (enemy.hasBuff(SPELLS.EXPOSED_ELEMENTS_TALENT.id))){
      this.removeDebuffTimestamp=event.timestamp;
      this.damageGained+=(1/EXPOSED_ELEMENTS.MULTIPLIER)*event.amount;
    }

    if((event.ability.guid === SPELLS.LIGHTNING_BOLT_OVERLOAD.id) && (event.timestamp<this.removeDebuffTimestamp+EXPOSED_ELEMENTS.WINDOW_DURATION)){
      this.damageGained+=(1/EXPOSED_ELEMENTS.MULTIPLIER)*event.amount;
    }
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
        icon={<SpellIcon id={SPELLS.EXPOSED_ELEMENTS_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL;
}
export default ExposedElements;
