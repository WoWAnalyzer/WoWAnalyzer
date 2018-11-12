import Analyzer from 'parser/core/Analyzer';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatPercentage, formatNumber } from 'common/format';

class ManaValues extends Analyzer {
  static dependencies = {
		deathTracker: DeathTracker,
  };
  
  lowestMana = null; // start at `null` and fill it with the first value to account for users starting at a non-default amount for whatever reason
  endingMana = 0;

  maxMana = 110000;
  manaUpdates = [];

  deadOnKill = false;

  on_byPlayer_cast(event) {
    if (event.classResources) {
      event.classResources
        .filter(resource => resource.type === RESOURCE_TYPES.MANA.id)
        .forEach(({ amount, cost, max }) => {
          const manaValue = amount;
          const manaCost = cost || 0;
          const currentMana = manaValue - manaCost;
          this.endingMana = currentMana;

          if (this.lowestMana === null || currentMana < this.lowestMana) {
            this.lowestMana = currentMana;
          }
          this.manaUpdates.push({
            timestamp: event.timestamp,
            current: currentMana,
            max: max,
            used: manaCost,
          });
          // The variable 'max' is constant but can differentiate by racial/items.
          this.maxMana = max;
        });
    }
  }

  on_finished() {
    if (!this.deathTracker.isAlive) {
      this.deadOnKill = true;
    }
  }

  get manaLeftPercentage() {
    return this.endingMana/this.maxMana;
  }
  get suggestionThresholds() {
    return {
      actual: this.manaLeftPercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.3,
        major: 0.4,
      },
      style: 'percentage',
    };
  }
  
  suggestions(when) {
    if (!this.deadOnKill) {
      when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You had mana left at the end of the fight. You should be aiming to complete the fight with as little mana as possible regardless of whether your cooldowns will be coming up or not. So dont be afraid to burn your mana before the boss dies.')
          .icon('inv_elemental_mote_mana')
          .actual(`${formatPercentage(actual)}% (${formatNumber(this.endingMana)}) mana left`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.suggestionThresholds.isGreaterThan.average)
          .major(this.suggestionThresholds.isGreaterThan.major);
      });
    }
  }
}

export default ManaValues;
