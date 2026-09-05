import { formatManaSaved as formatManaSavedText } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ROLES from 'game/ROLES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import PropTypes from 'prop-types';

class ManaValues extends Analyzer {
  static propTypes = {
    owner: PropTypes.object.isRequired,
  };

  lowestMana = Infinity;
  /** Combat-log mana pool size, including talents, enchants, and similar bonuses. */
  maxMana = 0;
  endingMana = 0;

  manaUpdates: {
    timestamp: number;
    current: number;
    max: number;
    used: number;
  }[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);

    this.active = this.selectedCombatant.spec?.role === ROLES.HEALER;
  }

  onCast(event: CastEvent) {
    if (event.prepull) {
      // These are fabricated by the PrePullCooldowns normalizer which guesses class resources which could introduce issues.
      return;
    }
    if (event.classResources) {
      event.classResources
        .filter((resource) => resource.type === RESOURCE_TYPES.MANA.id)
        .forEach(({ amount, cost, max }) => {
          const manaValue = amount;
          const manaCost = cost || 0;
          const currentMana = manaValue - manaCost;
          this.endingMana = currentMana;

          if (currentMana < this.lowestMana) {
            this.lowestMana = currentMana;
          }
          this.manaUpdates.push({
            timestamp: event.timestamp,
            current: currentMana,
            max: max,
            used: manaCost,
          });
          // Combat log `max` already includes racials, talents, enchants, and items.
          this.maxMana = max;
        });
    }
  }

  get manaLeftPercentage() {
    return this.endingMana / this.maxMana;
  }

  /** Mana saved as a flat amount and as a percentage of this player's total mana. */
  formatManaSaved(manaSaved: number, precision = 1): string {
    return formatManaSavedText(manaSaved, this.maxMana, precision);
  }

  suggest = true;
  get suggestionThresholds() {
    return {
      actual: this.manaLeftPercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default ManaValues;
