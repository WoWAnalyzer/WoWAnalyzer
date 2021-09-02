import { Trans } from '@lingui/macro';
import { ItemLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import React from 'react';

class EnchantChecker extends Analyzer {
  get EnchantableSlots(): any {
    return {};
  }

  get EnchantableGear(): any {
    const enchantSlots = this.EnchantableSlots;
    return Object.keys(enchantSlots).reduce((obj: { [key: number]: Item }, slot) => {
      const item = this.selectedCombatant._getGearItemBySlotId(Number(slot));

      // If there is no offhand, disregard the item.
      // If the icon has `offhand` in the name, we know it's not a weapon and doesn't need an enchant.
      // This is not an ideal way to determine if an offhand is a weapon.
      if (item.id === 0 || item.icon.includes('offhand') || item.icon.includes('shield')) {
        return obj;
      }
      obj[Number(slot)] = this.selectedCombatant._getGearItemBySlotId(Number(slot));

      return obj;
    }, {});
  }

  get MinEnchantIds(): number[] {
    return [];
  }

  get MaxEnchantIds(): number[] {
    return [];
  }

  get numEnchantableGear() {
    return Object.keys(this.EnchantableGear).length;
  }

  get slotsMissingEnchant() {
    const gear = this.EnchantableGear;
    return Object.keys(gear).filter((slot) => !this.hasEnchant(gear[Number(slot)]));
  }

  get numSlotsMissingEnchant() {
    return this.slotsMissingEnchant.length;
  }

  get slotsMissingMaxEnchant() {
    const gear = this.EnchantableGear;
    return Object.keys(gear).filter(
      (slot) => this.hasEnchant(gear[Number(slot)]) && !this.hasMaxEnchant(gear[Number(slot)]),
    );
  }

  get numSlotsMissingMaxEnchant() {
    return this.slotsMissingMaxEnchant.length;
  }

  hasEnchant(item: Item) {
    return Boolean(item.permanentEnchant);
  }

  hasMaxEnchant(item: Item) {
    if (item.permanentEnchant) {
      return this.MaxEnchantIds.includes(item.permanentEnchant);
    }
    return false;
  }

  get itemsEnchantedThreshold() {
    return {
      actual: this.numEnchantableGear - this.numSlotsMissingEnchant,
      max: this.numEnchantableGear,
      isLessThan: this.numEnchantableGear,
      style: ThresholdStyle.NUMBER,
    };
  }

  get itemsBestEnchantedThreshold() {
    return {
      // numSlotsMissingMaxEnchant doesn't include items without an enchant at all
      actual:
        this.numEnchantableGear - this.numSlotsMissingEnchant - this.numSlotsMissingMaxEnchant,
      max: this.numEnchantableGear,
      isLessThan: this.numEnchantableGear,
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    const gear = this.EnchantableGear;
    const enchantSlots: { [key: number]: JSX.Element } = this.EnchantableSlots;

    Object.keys(gear).forEach((slot) => {
      const item = gear[Number(slot)];
      const slotName = enchantSlots[Number(slot)];
      const hasEnchant = this.hasEnchant(item);

      when(hasEnchant)
        .isFalse()
        .addSuggestion((suggest, actual, recommended) =>
          suggest(
            <Trans id="shared.enchantChecker.suggestions.noEnchant.label">
              Your{' '}
              <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
                {slotName}
              </ItemLink>{' '}
              is missing an enchant. Apply a strong enchant to very easily increase your throughput
              slightly.
            </Trans>,
          )
            .icon(item.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.MAJOR),
        );

      const noMaxEnchant = hasEnchant && !this.hasMaxEnchant(item);
      when(noMaxEnchant)
        .isTrue()
        .addSuggestion((suggest, actual, recommended) =>
          suggest(
            <Trans id="shared.enchantChecker.suggestions.weakEnchant.label">
              Your{' '}
              <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
                {slotName}
              </ItemLink>{' '}
              has a cheap enchant. Apply a strong enchant to very easily increase your throughput
              slightly.
            </Trans>,
          )
            .icon(item.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
        );
    });
  }
}

export default EnchantChecker;
