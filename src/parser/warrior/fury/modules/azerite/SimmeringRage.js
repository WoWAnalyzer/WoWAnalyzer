import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import RAMPAGE_COEFFICIENTS from '../spells/RAMPAGE_COEFFICIENTS.js';

const RAMPAGE = [SPELLS.RAMPAGE_1, SPELLS.RAMPAGE_2, SPELLS.RAMPAGE_3, SPELLS.RAMPAGE_4];

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
      <TraitStatisticBox
        trait={SPELLS.SIMMERING_RAGE.id}
        value={`${this.rageGen} rage generated`}
        tooltip={`Simmering Rage did <b>${formatThousands(this.totalSimmeringDamage)}</b> damage, contributing to <b>${formatNumber(this.dps)} (${formatPercentage(this.dpsPercentage)}%)</b> of your DPS.`}
      />
    );
  }
}

export default SimmeringRage;