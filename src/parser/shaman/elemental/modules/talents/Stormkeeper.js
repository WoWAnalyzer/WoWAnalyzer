import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';

const AFFECTED_ABILITIES = [SPELLS.LIGHTNING_BOLT_OVERLOAD.id,
                           SPELLS.LIGHTNING_BOLT.id,
                           SPELLS.CHAIN_LIGHTNING_OVERLOAD.id,
                           SPELLS.CHAIN_LIGHTNING.id];

class Stormkeeper extends Analyzer {
  damageDoneByBuffedCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STORMKEEPER_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMKEEPER_TALENT.id)){
      return;
    }

    if (!AFFECTED_ABILITIES.includes(event.ability.guid)) {
      return;
    }
    this.damageDoneByBuffedCasts+=event.amount;
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageDoneByBuffedCasts);
  }

  get damagePerSecond() {
    return this.damageDoneByBuffedCasts / (this.owner.fightDuration / 1000);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.STORMKEEPER_TALENT.id} />}
        value={`${formatNumber(this.damageDoneByBuffedCasts)} damage`}
        label="Damage Done by Buffed Casts"
        tooltip={`Buffed casts contributed ${formatNumber(this.damagePerSecond)} DPS (${formatPercentage(this.damagePercent)} of your damage)`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Stormkeeper;
