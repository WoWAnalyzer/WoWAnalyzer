import React from 'react';
import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import StatisticBox from 'interface/others/StatisticBox';
import Analyzer from 'parser/core/Analyzer';

// Abstract class used for lunar & solar empowerments.
class Empowerment extends Analyzer {
  empowermentBuff = null;
  empoweredSpell = null;
  empowermentPrefix = null;
  spellGenerateAmount = 0;
  icon = null;
  resource = RESOURCE_TYPES.ASTRAL_POWER;
  wasted = 0;
  generated = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STARSURGE_MOONKIN.id){
      return; 
    }
    const buff = this.selectedCombatant.getBuff(this.empowermentBuff.id);
    if (!buff) {
      return;
    }
    if (buff.stacks < 3) { // Did not overcap
      return;
    }
    this.wasted += 1;
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== this.empowermentBuff.id){
      return;
    }
    this.generated += 1;
  }

  on_toPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== this.empowermentBuff.id){
      return;
    }
    this.generated += 1;
  }

  get wastedPercentage() {
    return this.wasted / this.generated;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercentage,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.9,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsInverted() {
    return {
      actual: this.wastedPercentage,
      isGreaterThan: {
        minor: 0.02,
        average: 0.05,
        major: 0.1,
      },
      style: 'percentage',
    };
  }
  
  suggestions(when) {
    when(this.suggestionThresholdsInverted).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>You overcapped {this.wasted} {this.empowermentPrefix} Empowerments by casting <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> while already at 3 stacks. Try to always spend your empowerments before casting <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> if you are not going to overcap Astral Power.</React.Fragment>)
        .icon(this.icon)
        .actual(`${formatPercentage(actual)}% overcapped ${this.empowermentPrefix} Empowerments`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon={this.icon} />}
        value={`${formatPercentage(this.wastedPercentage)} %`}
        label={`Overcapped ${this.empowermentPrefix} Empowerments`}
        tooltip={`${this.wasted} out of ${this.generated} ${this.empowermentPrefix} Empowerments wasted. ${this.empowermentPrefix} Empowerment overcapping should never occur when it is possible to cast a ${this.empoweredSpell.name} without overcapping Astral Power.`}
      />
    );
  }
}

export default Empowerment;
