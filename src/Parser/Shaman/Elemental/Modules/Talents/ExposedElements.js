import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const EXPOSED_ELEMENTS = {
  INCREASE: 1,
  WINDOW_DURATION: 300,
};

class ExposedElements extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  removeDebuffTimestamp = null;
  damageGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.EXPOSED_ELEMENTS_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.LIGHTNING_BOLT.id) {
      return;
    }

    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.EXPOSED_ELEMENTS_DEBUFF.id)) {
      this.removeDebuffTimestamp = event.timestamp;
    }
  }

  on_byPlayer_damage(event) {
    if (this.removeDebuffTimestamp === null) {
      return;
    }

    if (event.timestamp > this.removeDebuffTimestamp + EXPOSED_ELEMENTS.WINDOW_DURATION) {
      return;
    }

    if ((event.ability.guid !== SPELLS.LIGHTNING_BOLT_OVERLOAD.id) && (event.ability.guid !== SPELLS.LIGHTNING_BOLT.id)) {
      return;
    }
    this.damageGained += calculateEffectiveDamage(event, EXPOSED_ELEMENTS.INCREASE);
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
