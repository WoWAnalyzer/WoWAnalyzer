import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/core/modules/Enemies';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const MASTER_OF_THE_ELEMENTS = {
  INCREASE: 0.2,
  DURATION: 15000,
  WINDOW_DURATION: 300,
  AFFECTED_ABILITIES: [
    SPELLS.ICEFURY_TALENT.id,
    SPELLS.ICEFURY_OVERLOAD.id,
    SPELLS.LIGHTNING_BOLT.id,
    SPELLS.LIGHTNING_BOLT_OVERLOAD.id,
    SPELLS.CHAIN_LIGHTNING.id,
    SPELLS.CHAIN_LIGHTNING_OVERLOAD.id,
    SPELLS.ELEMENTAL_BLAST_TALENT.id,
    SPELLS.ELEMENTAL_BLAST_OVERLOAD.id,
    SPELLS.EARTH_SHOCK.id,
  ],
};

class MasterOfTheElements extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  moteActivationTimestamp = null;
  moteConsumptionTimestamp = null;
  damageGained = 0;
  buffsWasted = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id)) {
      return;
    }
    if (event.ability.guid === SPELLS.LAVA_BURST.id) {
      this.buffsWasted++;
      return;
    }

    const spellid = event.ability.guid;

    if (MASTER_OF_THE_ELEMENTS.AFFECTED_ABILITIES.includes(spellid)) {
      this.moteActivationTimestamp = event.timestamp;
    }
  }

  on_byPlayer_damage(event) {
    if (this.moteActivationTimestamp === null) {
      return;
    }

    if (event.timestamp > this.moteActivationTimestamp + MASTER_OF_THE_ELEMENTS.WINDOW_DURATION) {
      return;
    }
    const spellid = event.ability.guid;
    if (!MASTER_OF_THE_ELEMENTS.AFFECTED_ABILITIES.includes(spellid)) {
      return;
    }
    this.damageGained += calculateEffectiveDamage(event, MASTER_OF_THE_ELEMENTS.INCREASE);
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
        icon={<SpellIcon id={SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL;
}

export default MasterOfTheElements;
