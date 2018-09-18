import React from 'react';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox from 'Interface/Others/StatisticBox';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import MAGIC_SCHOOLS from 'common/MAGIC_SCHOOLS';
import Enemies from 'Parser/Core/Modules/Enemies';


const EARTHEN_SPIKE = {
  INCREASE: 0.2,
};

class EarthenSpike extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damageGained=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.EARTHEN_SPIKE_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid===SPELLS.EARTHEN_SPIKE_TALENT.id) {
      this.damageGained += event.amount;
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if(enemy && (enemy.hasBuff(SPELLS.EARTHEN_SPIKE_TALENT.id)) &&
      ((event.ability.type === MAGIC_SCHOOLS.ids.NATURE) || (event.ability.type === MAGIC_SCHOOLS.ids.NATURE))){
      this.damageGained += calculateEffectiveDamage(event, EARTHEN_SPIKE.INCREASE);
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
        icon={<SpellIcon id={SPELLS.EARTHEN_SPIKE_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
}

export default EarthenSpike;
