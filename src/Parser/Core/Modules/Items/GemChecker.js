import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

const GEMS = [
  ITEMS.DEADLY_SOLSTONE.id,
  ITEMS.QUICK_GOLDEN_BERYL.id,
  ITEMS.MASTERFUL_KUBILINE.id,
  ITEMS.VERSATILE_KYANITE.id,
];

const BEST_GEMS = [
  ITEMS.DEADLY_AMBERBLAZE.id,
  ITEMS.QUICK_OWLSEYE.id,
  ITEMS.MASTERFUL_TIDAL_AMETHYST.id,
  ITEMS.VERSATILE_ROYAL_QUARTZ.id,
];

const UNIQUE_GEMS = [
  ITEMS.KRAKEN_EYE_OF_AGILITY.id,
  ITEMS.KRAKEN_EYE_OF_INTELLECT.id,
  ITEMS.KRAKEN_EYE_OF_STRENGTH.id,
];

class GemChecker extends Analyzer {

  static GEMMABLE_SLOTS = {
    0: 'Head',
    2: 'Shoulders',
    4: 'Chest',
    5: 'Waist',
    6: 'Legs',
    7: 'Feet',
    8: 'Wrists',
    9: 'Hands',
    10: 'Ring',
    11: 'Ring',
    12: 'Trinket',
    13: 'Trinket',
    14: 'Back',
    15: 'MainHand',
    16: 'OffHand',
  };

  gemmableGear() {
    return Object.keys(this.constructor.GEMMABLE_SLOTS).reduce((obj, slot) => {
      obj[slot] = this.selectedCombatant._getGearItemBySlotId(slot);
      return obj;
    }, {});
  }

  isAtLeastGemmed(id) {
    return GEMS.includes(id) || this.isMaxGemmed(id);
  }

  isMaxGemmed(id) {
    return BEST_GEMS.includes(id) || this.isUniqueGemmed(id);
  }

  isUniqueGemmed(id) {
    return UNIQUE_GEMS.includes(id);
  }

  hasEveryGemSlotFilled(item) {
    let everySlotIsGemmed = true;
    item.gems.forEach(({ id }, index) => {
      everySlotIsGemmed &= this.isAtLeastGemmed(id);
    });
    return everySlotIsGemmed;
  }

  hasEveryGemSlotMaxFilled(item) {
    let everySlotIsMaxGemmed = true;
    item.gems.forEach(({ id }, index) => {
      everySlotIsMaxGemmed &= this.isMaxGemmed(id);
    });
    return everySlotIsMaxGemmed;
  }

  get numSockets() {
    const gear = this.gemmableGear;
    let result = 0;
    Object.keys(gear).forEach((slot) => {
      result += gear[slot].gems.length;
    });
    return result;
  }

  get numSocketsMissingGem() {
    const gear = this.gemmableGear;
    let result = 0;
    Object.values(gear).forEach((item) => {
      item.gems.forEach(({ id }, index) => {
        if (!this.isAtLeastGemmed(id)) {
          result++;
        }
      });
    });
    return result;
  }

  get numSocketsMissingMaxGem() {
    const gear = this.gemmableGear;
    let result = 0;
    Object.values(gear).forEach((item) => {
      item.gems.forEach(({ id }, index) => {
        if (!this.isMaxGemmed(id)) {
          result++;
        }
      });
    });
    return result;
  }

  get hasUniqueSocketted() {
    const gear = this.gemmableGear;
    let result = false;
    Object.values(gear).forEach((item) => {
      item.gems.forEach(({ id }, index) => {
        result |= this.isUniqueGemmed(id);
      });
    });
    return result;
  }

  get socketsGemmedThresholds() {
    return {
      actual: this.numSockets - this.numSocketsMissingGem,
      max: this.numSockets,
      isLessThan: this.numSockets,
      style: 'number',
    };
  }

  get socketsBestGemmedThresholds() {
    return {
      actual: this.numSockets - this.numSocketsMissingMaxGem,
      max: this.numSockets,
      isLessThan: this.numSockets,
      style: 'number',
    };
  }

  get socketsContainsUniqueThresholds() {
    return {
      actual: this.hasUniqueSocketted ? 1 : 0,
      max: this.numSockets > 0 ? 1 : 0,
      isLessThan: this.numSockets > 0 ? 1 : 0,
      style: 'boolean',
    };
  }

  suggestions(when) {
    const gear = this.gemmableGear;
    // iterating with keys instead of value because the values don't store what slot is being looked at
    Object.keys(gear)
      .forEach(slot => {
        const item = gear[slot];
        const slotName = this.constructor.GEMMABLE_SLOTS[slot];
        const hasGem = this.hasEveryGemSlotFilled(item);

        when(hasGem).isFalse()
          .addSuggestion((suggest) => {
            return suggest(
              <React.Fragment>
                Your <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>{slotName}</ItemLink> is missing a gem. Apply a good gem to very easily increase your throughput slightly.
              </React.Fragment>
            )
              .icon(item.icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
          });

        const noMaxGem = hasGem && !this.hasEveryGemSlotMaxFilled(item);
        when(noMaxGem).isTrue()
          .addSuggestion((suggest) => {
            return suggest(
              <React.Fragment>
                Your <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>{slotName}</ItemLink> has a cheap gem. Apply a good gem to very easily increase your throughput slightly.
              </React.Fragment>
            )
              .icon(item.icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
          });
      });

    const noUniqueGemWhileOthers = this.numSockets > 0 && !this.hasUniqueSocketted();
    when(noUniqueGemWhileOthers).isTrue()
      .addSuggestion((suggest) => {
        return suggest(
          <React.Fragment>
            Your gear is missing one unique gem like <ItemLink id={ITEMS.KRAKEN_EYE_OF_AGILITY.id} icon={false}>{ITEMS.KRAKEN_EYE_OF_AGILITY.name}</ItemLink>.
          </React.Fragment>
        )
          .icon(ITEMS.KRAKEN_EYE_OF_AGILITY.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
      });
  }
}

export default GemChecker;
