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
const RECKLESSNESS_DURATION = 10000;

class UnbridledFerocity extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  totalDamage = 0;
  recklessnessEvents = [];

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTrait(SPELLS.UNBRIDLED_FEROCITY.id);
    
    if(!this.active) {
      return;
    }

    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.UNBRIDLED_FEROCITY.id].reduce((total, rank) => {
      const [ damage ] = calculateAzeriteEffects(SPELLS.UNBRIDLED_FEROCITY.id, rank);
      return total + damage;
    }, 0);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(RAMPAGE), this.onTraitDamage);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.RECKLESSNESS), this.onBuffApply);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.RECKLESSNESS), this.onBuffRemoved);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onTraitDamage(event) {
    const coefficient = RAMPAGE_COEFFICIENTS.find(r => r.id === event.ability.guid).coefficient;
    const [ bonusDamage ] = calculateBonusAzeriteDamage(event, [this.traitBonus], coefficient, this.statTracker.currentStrengthRating);
    this.totalDamage += bonusDamage;
  }

  onBuffApply(event) {
    this.recklessnessEvents.push({
      start: event.timestamp,
      end: null,
    });
  }

  onBuffRemoved(event) {
    const latestRecklessness = this.recklessnessEvents.pop();
    latestRecklessness.end = event.timestamp;
    this.recklessnessEvents.push(latestRecklessness);
  }

  onFightEnd(event) {
    const latestRecklessness = this.recklessnessEvents.pop();
    if(!latestRecklessness.end) {
      latestRecklessness.end = event.timestamp;
    }
    this.recklessnessEvents.push(latestRecklessness);
  }

  get damagePercentage() {
    return this.owner.getPercentageOfTotalDamageDone(this.totalDamage);
  }

  get increasedRecklessnessDuration() {
    return this.recklessnessEvents.reduce((total, event) => {
      const duration = event.end - event.start;
      return total + (duration > RECKLESSNESS_DURATION ? duration - RECKLESSNESS_DURATION : duration);
    }, 0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.UNBRIDLED_FEROCITY.id}
        value={`${formatNumber(this.increasedRecklessnessDuration / 1000)}s Recklessness`}
        tooltip={`Unbridled Ferocity did <b>${formatThousands(this.totalDamage)} (${formatPercentage(this.damagePercentage)}%)</b> damage.`}
      />
    );
  }
}

export default UnbridledFerocity;