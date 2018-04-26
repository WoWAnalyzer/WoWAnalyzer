import React from 'react';
import Icon from 'common/Icon';
import StatisticBox from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';

const PERCENT_OVERCAP_ALLOWED = 0.1;

//abstract class used for lunar & solar empowerments.
class Empowerment extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  empoweredSpell;
  empowermentPrefix;
  spellGenerateAmount;
  icon; //ability_druid_eclipse
  resource = RESOURCE_TYPES.ASTRAL_POWER;
  empowermentsActive = 0;
  empowermentsWasted = 0;
  empowermentsSpent = 0;

  on_initialized() {
    this.active = !this.combatants.selected.hasHead(ITEMS.THE_EMERALD_DREAMCATCHER.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === this.empoweredSpell.id && this.empowermentsActive > 0){
        this.empowermentsActive -= 1;
        this.empowermentsSpent += 1;
    }
    if (spellId !== SPELLS.STARSURGE_MOONKIN.id){
      return; 
    }
    if (this.empowermentsActive < 3){
      this.empowermentsActive += 1;
    } else if (event.classResources){
      const hasCooldown = this.combatants.selected.hasBuff(SPELLS.CELESTIAL_ALIGNMENT.id) || this.combatants.selected.hasBuff(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id);
      const hasElune = this.combatants.selected.hasBuff(SPELLS.BLESSING_OF_ELUNE.id);
      const minimumDeficit = this.spellGenerateAmount * (hasCooldown ? 1.5 : 1) * (hasElune ? 1.25 : 1) * (1 - PERCENT_OVERCAP_ALLOWED);
      event.classResources
        .filter(resource => resource.type === this.resource.id)
        .forEach(({ amount, max }) => {
          if (max - amount > minimumDeficit){
            this.empowermentsWasted += 1;
          }
        });
    }  
  }

  get wastedPercentage() {
    return this.wasted / this.generated;
  }

  get wasted() {
    return this.empowermentsWasted;
  }

  get generated() {
    return this.empowermentsSpent + this.wasted;
  }

  get wastedPerMinute() {
    return (this.wasted / this.owner.fightDuration) * 1000 * 60 || 0;
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
      return suggest(<React.Fragment>You overcapped {this.wasted} {this.empowermentPrefix} Empowerments when you could have spent them without overcapping Astral Power. Try to prioritize casting {this.empoweredSpell.name} over Starsurge when not near max Astral Power and at 3 stacks of {this.empowermentPrefix} Empowerment.</React.Fragment>)
        .icon(this.icon)
        .actual(`${formatPercentage(actual)}% overcapped ${this.empowermentPrefix} Empowerments`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon={this.icon} />}
        value={`${this.wastedPerMinute.toFixed(2)}`}
        label={`Overcapped ${this.empowermentPrefix} Emp per minute`}
        tooltip={`${this.wasted} out of ${this.generated} (${formatPercentage(this.wastedPercentage)}%) ${this.empowermentPrefix} Empowerments wasted. ${this.empowermentPrefix} Empowerment overcapping should never occur when it is possible to cast a ${this.empoweredSpell.name} without overcapping Astral Power.`}
      />
    );
  }
}

export default Empowerment;
