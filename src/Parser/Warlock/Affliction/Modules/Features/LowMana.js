import Analyzer from 'Parser/Core/Analyzer';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

const MAX_MANA = 1100000;   // should be constant
const LOW_MANA_THRESHOLD = 0.05;

class LowMana extends Analyzer {
  _lowManaTimestamp = null;
  _currentlyLow = false;
  timeOnLowMana = 0;

  on_byPlayer_cast(event) {
    this._handleManaEvent(event);
  }

  on_byPlayer_heal(event) {
    this._handleManaEvent(event);
  }

  _handleManaEvent(event) {
    if (event.classResources) {
      event.classResources
        .filter(resource => resource.type === RESOURCE_TYPES.MANA.id)
        .forEach(({ amount, cost }) => {
          const manaValue = amount;
          const manaCost = cost || 0;
          const currentMana = manaValue - manaCost;
          this.endingMana = currentMana;

          if (!this._currentlyLow && this.endingMana < LOW_MANA_THRESHOLD * MAX_MANA) {
            this._lowManaTimestamp = event.timestamp;
            this._currentlyLow = true;    // set flag to stop overwriting the timestamp
          }
          else if (this._lowManaTimestamp && this.endingMana > LOW_MANA_THRESHOLD * MAX_MANA) {
            this.timeOnLowMana += event.timestamp - this._lowManaTimestamp;
            this._lowManaTimestamp = null;  // reset timestamp so this branch doesn't fire when we're repeatedly > 5%
            this._currentlyLow = false;
          }
        });
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.timeOnLowMana / 1000,
      isGreaterThan: {
        minor: 4,
        average: 8,
        major: 12,
      },
      style: 'seconds',
    };
  }
}

export default LowMana;
