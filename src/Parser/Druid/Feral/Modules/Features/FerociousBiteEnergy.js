import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

const energyResourceType = 3;
const energyForFullDamage = 50;

/**
 * Although Ferocious Bite costs 25 energy, it does up to double damage if the character has more.
 * It's recommended that feral druids use Bite when at 50 energy or higher.
 * An exception to this is when the bonus from 4-piece T21 is active, which makes Bite cost no
 * energy and ignore the current energy level.
 */
class FerociousBiteEnergy extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  
  lowEnergyBites = 0;
  sumEnergyBelowTarget = 0;

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.FEROCIOUS_BITE.id) {
      return;
    }

    if (event.classResources[0].type !== energyResourceType) {
      // classResources[0] not being energy means Ferocious Bite didn't consume any energy,
      // and so ignores the character's energy level.
      return;
    }
    if (event.classResources[0].type === energyResourceType && !event.classResources[0].cost) {
      // Ferocious Bite didn't consume energy, and so ignores the character's energy level.
      return;
    }

    // 'amount' is the resource present before the spell alters it.
    const energy = event.classResources[0].amount;
    if (energy < energyForFullDamage) {
      this.lowEnergyBites++;
      this.sumEnergyBelowTarget += (energyForFullDamage - energy);
    }
  }

  /**
   * Use a sum of the magnitude of error to trigger suggestion rather than a simple count
   * of low energy bites. This way using Bite at 49 energy is correctly seen as a minor error
   * with only slight damage loss, while a Bite at 25 energy is more significant.
   */
  get suggestionThresholds() {
    return {
      actual: this.sumEnergyBelowTarget,
      isGreaterThan: {
        minor: 5,
        average: 25,
        major: 60,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      let actualText = '';
      // Vary message for clarity and grammar
      if (this.lowEnergyBites === 1) {
        actualText = `1 low energy bite at ${energyForFullDamage - this.sumEnergyBelowTarget} energy.`;
      }
      else {
        actualText = `${this.lowEnergyBites} low energy bites, ` + 
          `averaging ${(this.sumEnergyBelowTarget / this.lowEnergyBites).toFixed(1)} below ${energyForFullDamage} energy.`;
      }
      return suggest(
        <Wrapper>
          <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> does double damage if used with at least {energyForFullDamage} energy. It's usually worth delaying the bite until you have that energy.
        </Wrapper>
      )
        .icon(SPELLS.FEROCIOUS_BITE.icon)
        .actual(actualText)
        .recommended(`0 is recommended`);
    });
  }
}

export default FerociousBiteEnergy;
