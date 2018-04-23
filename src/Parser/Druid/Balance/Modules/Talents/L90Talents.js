import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber , formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import AstralPowerTracker from '../ResourceTracker/AstralPowerTracker';

const SHOOTING_STARS_MULTIPLIER = 4 / 10;
const ASTRAL_COMMUNION_VALUE = 75;
const ASTRAL_COMMUNION_COOLDOWN = 80;
const BLESSING_OF_ELUNE_MULTIPLIER = 0.25;
const BLESSING_OF_ANSHE_VALUE = 2;
const BLESSING_OF_ANSHE_COOLDOWN = 3;

class L90Talents extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    astralPowerTracker: AstralPowerTracker,
  };

  getAbility = spellId => this.abilityTracker.getAbility(spellId);
  activeTalent;
  dotTicks = 0;
  totalHaste = 0;
  lastHasteChangedTimestamp = 0;
  blessingOfElunePotential = 0;

  on_initialized() {
    if (this.combatants.selected.hasTalent(SPELLS.SHOOTING_STARS_TALENT.id)) {
      this.activeTalent = SPELLS.SHOOTING_STARS_TALENT;
    }
    else if (this.combatants.selected.hasTalent(SPELLS.ASTRAL_COMMUNION_TALENT.id)) {
      this.activeTalent = SPELLS.ASTRAL_COMMUNION_TALENT;
    }
    else if (this.combatants.selected.hasTalent(SPELLS.BLESSING_OF_THE_ANCIENTS_TALENT.id)) {
      this.activeTalent = SPELLS.BLESSING_OF_THE_ANCIENTS_TALENT;
    }
    else {
      this.active = false;
    }
  }

  on_byPlayer_damage(event) {
    if ((event.ability.guid === SPELLS.MOONFIRE_BEAR.id || event.ability.guid === SPELLS.SUNFIRE.id) && event.tick === true) {
      this.dotTicks++;
    }
  }
  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LUNAR_STRIKE.id && spellId !== SPELLS.SOLAR_WRATH_MOONKIN.id) {
      return;
    }
    if (!this.combatants.selected.hasBuff(SPELLS.BLESSING_OF_ELUNE.id)) {
      this.blessingOfElunePotential += this.getBonus(event.resourceChange, BLESSING_OF_ELUNE_MULTIPLIER, false);
    }
  }
  on_changehaste(event) {
    if (this.lastHasteChangedTimestamp !== 0) {
      this.totalHaste += (event.timestamp - this.lastHasteChangedTimestamp) * event.oldHaste;
    }
    this.lastHasteChangedTimestamp = event.timestamp;
  }

  get averageHaste() {
    return this.totalHaste / this.owner.fightDuration;
  }

  getGenerated(spellId) {
    const generator = this.astralPowerTracker.buildersObj[spellId] || 0;
    if (generator) {
      return generator.generated;
    }
    return 0;
  }

  getBonus(value, increase, eluneActive) {
    if (eluneActive) {
      return value - (value / (1 + increase));
    }
    return value * increase;
  }

  perMinute(value) {
    return value / this.owner.fightDuration * 1000 * 60 || 0;
  }

  get shootingStarsValue() { 
    return this.dotTicks * SHOOTING_STARS_MULTIPLIER;
  }

  get astralCommunionValue() {
    return (1 + Math.floor(this.owner.fightDuration / 1000 / ASTRAL_COMMUNION_COOLDOWN)) * ASTRAL_COMMUNION_VALUE;
  }

  get BlessingOfAnsheValue() {
    return (1 + Math.floor(this.owner.fightDuration / 1000 / (BLESSING_OF_ANSHE_COOLDOWN / (1 + this.averageHaste)))) * BLESSING_OF_ANSHE_VALUE;
  }

  get BlessingOfEluneValue() {
    return this.blessingOfElunePotential + this.getGenerated(SPELLS.BLESSING_OF_ELUNE.id);
  }

  get actualValue() {
    if (this.activeTalent.id === SPELLS.SHOOTING_STARS_TALENT.id) {
      return this.getGenerated(SPELLS.SHOOTING_STARS.id);
    }
    else if (this.activeTalent.id === SPELLS.ASTRAL_COMMUNION_TALENT.id) {
      return this.getGenerated(SPELLS.ASTRAL_COMMUNION_TALENT.id);
    }
    else if (this.activeTalent.id === SPELLS.BLESSING_OF_THE_ANCIENTS_TALENT.id) {
      return this.getGenerated(SPELLS.BLESSING_OF_ANSHE.id) + this.getGenerated(SPELLS.BLESSING_OF_ELUNE.id);
    }
  }

  get percentOfPotential() {
    const maxPotential = Math.max(this.shootingStarsValue, this.astralCommunionValue, this.BlessingOfAnsheValue, this.BlessingOfEluneValue);
    if (this.activeTalent.id === SPELLS.SHOOTING_STARS_TALENT.id) {
      return this.shootingStarsValue / maxPotential;
    }
    else if (this.activeTalent.id === SPELLS.ASTRAL_COMMUNION_TALENT.id) {
      return this.astralCommunionValue / maxPotential;
    }
    else if (this.activeTalent.id === SPELLS.BLESSING_OF_THE_ANCIENTS_TALENT.id) {
      return Math.max(this.actualValue, this.BlessingOfEluneValue, this.BlessingOfAnsheValue) / maxPotential;
    }
  }

  get percentOfPotentialBotA() {
    return this.actualValue / Math.max(this.actualValue, this.BlessingOfEluneValue, this.BlessingOfAnsheValue);
  }

  get suggestionThresholds() {
    return {
      actual: this.percentOfPotential,
      isLessThan: {
        minor: 0.9,
        average: 0.75,
        major: 0.5,
      },
      style: 'percentage',
    };
  }
  get suggestionThresholdsBotA() {
    return {
      actual: this.percentOfPotentialBotA,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment><SpellLink id={this.activeTalent.id} /> only generated {formatPercentage(actual)}% of the Astral Power that another talent in the row would have generated. Consider using one of the other available choices. See the statistic box below for more information.</React.Fragment>)
        .icon(this.activeTalent.icon)
        .actual(`${formatPercentage(actual)}% of another talent's generation.`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
    if (this.activeTalent.id === SPELLS.BLESSING_OF_THE_ANCIENTS_TALENT.id){
      when(this.suggestionThresholdsBotA).addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment><SpellLink id={this.activeTalent.id} /> only generated {formatPercentage(actual)}% of the Astral Power that it could have. Make sure you are using the correct blessing. See the statistic box below for more information.</React.Fragment>)
          .icon(this.activeTalent.icon)
          .actual(`${formatPercentage(actual)}% of the potantial generation.`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
    } 
  }

  statistic() {
    return (
      <StatisticBox
        alignIcon='flex-start'
        icon={<SpellIcon id={this.activeTalent.id} />}
        value={`${formatNumber(this.perMinute(this.actualValue))}`}
        label="L90 talent Astral Power per minute"
        tooltip={`
          Total Astral Power gained: ${formatNumber(this.actualValue)} <br />
          Expected Astral Power generated by level 90 talents per minute (total):
          <ul>
            <li>Shooting Stars:     <b>${formatNumber(this.perMinute(this.shootingStarsValue))}</b>   &ensp;(${formatNumber(this.shootingStarsValue)})</li>
            <li>Astral Communion:   <b>${formatNumber(this.perMinute(this.astralCommunionValue))}</b> &ensp;(${formatNumber(this.astralCommunionValue)})</li>
            <li>Blessing of An'she: <b>${formatNumber(this.perMinute(this.BlessingOfAnsheValue))}</b> &ensp;(${formatNumber(this.BlessingOfAnsheValue)})</li>
            <li>Blessing of Elune:  <b>${formatNumber(this.perMinute(this.BlessingOfEluneValue))}</b> &ensp;(${formatNumber(this.BlessingOfEluneValue)})</li> 
          </ul>
          Keep in mind that these values does not translate directly to effective dps from the talents as Shooting Stars has a minor damage component and Astral Communion loses some value due to overcapping resources on pull.
          <br /><br />
          How the expected Astral Power generated is calculated: <br />
          <ul>
          <li>Shooting Stars is the number of dot ticks you had during the encounter times the proc chance and Astral Power it generates.</li>
          <li>Astral Communion is based on the number of possible casts over the duration of the encounter.</li>
          <li>Blessing of An'she assumes that you had Blessing of An'she active for the whole encounter.</li>
          <li>Blessing of Elune assumes that you had Blessing of Elune active for the whole encounter.</li>
          </ul>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(75);
}

export default L90Talents;
