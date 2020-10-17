import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

import RAMPAGE_COEFFICIENTS from '../spells/RAMPAGE_COEFFICIENTS';

const RAMPAGE = [SPELLS.RAMPAGE_1, SPELLS.RAMPAGE_2, SPELLS.RAMPAGE_3, SPELLS.RAMPAGE_4];

//Test Log: /report/ABH7D8W1Qaqv96mt/2-Mythic+Taloc+-+Kill+(4:12)/Ghaz/statistics

class SimmeringRage extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  totalSimmeringDamage = 0;
  rageGen = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTrait(SPELLS.SIMMERING_RAGE.id);

    if(!this.active) {
      return;
    }
    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.SIMMERING_RAGE.id].reduce((total, rank) => {
      const [ damage ] = calculateAzeriteEffects(SPELLS.SIMMERING_RAGE.id, rank);
      return total + damage;
    }, 0);

    this.addEventListener(Events.energize.by(SELECTED_PLAYER).to(SELECTED_PLAYER).spell(SPELLS.SIMMERING_RAGE_ENERGISE), this.onSimmeringRageEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(RAMPAGE), this.onRampageDamage);
  }

  onSimmeringRageEnergize(event) {
    this.rageGen += event.resourceChange;
  }

  onRampageDamage(event) {
    const coefficient = RAMPAGE_COEFFICIENTS.find(r => r.id === event.ability.guid).coefficient;
    const [ bonusDamage ] = calculateBonusAzeriteDamage(event, [this.traitBonus], coefficient, this.statTracker.currentStrengthRating);
    this.totalSimmeringDamage += bonusDamage;
  }

  get dps() {
    return this.totalSimmeringDamage / (this.owner.fightDuration / 1000);
  }

  get dpsPercentage() {
    return this.owner.getPercentageOfTotalDamageDone(this.totalSimmeringDamage);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={<>Simmering Rage did <strong>{formatThousands(this.totalSimmeringDamage)}</strong> damage, contributing to <strong>{formatNumber(this.dps)} ({formatPercentage(this.dpsPercentage)}%)</strong> of your DPS.</>}
      >
        <BoringSpellValueText spell={SPELLS.SIMMERING_RAGE}>
          {this.rageGen} <small>rage generated</small>
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default SimmeringRage;
