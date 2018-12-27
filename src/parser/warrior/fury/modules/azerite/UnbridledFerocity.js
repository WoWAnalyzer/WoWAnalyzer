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
const RECLESSNESS_DURATION_VARIANCE = 100;

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
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RECKLESSNESS), this.onRecklessnessCast);
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
      recklessnessCast: false,
    });
  }

  onRecklessnessCast() {
    if (this.recklessnessEvents.length === 0) {
      return;
    }

    const lastIndex = this.recklessnessEvents.length - 1;
    this.recklessnessEvents[lastIndex].recklessnessCast = true;
  }

  onBuffRemoved(event) {
    if (this.recklessnessEvents.length === 0) {
      return;
    }

    const lastIndex = this.recklessnessEvents.length - 1;
    this.recklessnessEvents[lastIndex].end = event.timestamp;
  }

  onFightEnd(event) {
    // If Recklessness was active at the end of the fight, we need to flag it as ended as there is no buff removed event
    if (this.recklessnessEvents.length === 0) {
      return;
    }
    
    const lastIndex = this.recklessnessEvents.length - 1;

    if(!this.recklessnessEvents[lastIndex].end) {
      this.recklessnessEvents[lastIndex].end = event.timestamp;
    }
  }

  get damagePercentage() {
    return this.owner.getPercentageOfTotalDamageDone(this.totalDamage);
  }

  get increasedRecklessnessDuration() {
    // If Recklessness is active and the trait procs, the 10 seconds of buff time is increased by 4 seconds with no event.
    // To check for this, we need to check if recklessness lasted for more than 10 seconds, and if so, subtract those 10 seconds from the uptime to get the additional buff duration from the trait
    return this.recklessnessEvents.reduce((total, event) => {
      const duration = event.end - event.start;

      // Was this a recklessness cast and lasted < 10 seconds with event variance
      if (event.recklessnessCast && (duration < (RECKLESSNESS_DURATION - RECLESSNESS_DURATION_VARIANCE) || duration < (RECKLESSNESS_DURATION + RECLESSNESS_DURATION_VARIANCE))) {
        return total;
      } else if (duration > (RECKLESSNESS_DURATION - RECLESSNESS_DURATION_VARIANCE)) { // Was the buff longer than 10 seconds (in which case it was a proc and normal recklessness)
        return total + duration - RECKLESSNESS_DURATION;
      } else {
        return total + duration;
      }
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