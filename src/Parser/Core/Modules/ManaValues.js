import Analyzer from 'Parser/Core/Analyzer';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import { formatPercentage, formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import ROLES from 'common/ROLES';

class ManaValues extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  lowestMana = null; // start at `null` and fill it with the first value to account for users starting at a non-default amount for whatever reason
  endingMana = 0;

  maxMana = 110000;
  manaUpdates = [];

  on_initialized() {
    this.active = this.combatants.selected.spec.role === ROLES.HEALER;
  }

  on_byPlayer_cast(event) {
    if (event.classResources) {
      event.classResources
        .filter(resource => resource.type === RESOURCE_TYPES.MANA)
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

  get manaLeftPercentage() {
    return this.endingMana/this.maxMana;
  }
  get suggestionThresholds() {
    return {
      actual: this.manaLeftPercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.suggestionThresholds.actual).isGreaterThan(this.suggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You had mana left at the end of the fight. A good rule of thumb is having the same mana percentage as the bosses health percentage. Mana is indirectly tied with healing throughput and should be optimized.')
          .icon('inv_elemental_mote_mana')
          .actual(`${formatPercentage(actual)}% (${formatNumber(this.endingMana)}) mana left`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.suggestionThresholds.isGreaterThan.average)
          .major(this.suggestionThresholds.isGreaterThan.major);
      });
  }
}

export default ManaValues;
