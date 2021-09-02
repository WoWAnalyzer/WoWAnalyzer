import { Trans } from '@lingui/macro';
import { ItemLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import React from 'react';

// Example logs with missing enhancement:
// /report/XQrLTRC1bFWGAt3m/21-Mythic+The+Council+of+Blood+-+Wipe+10+(3:17)/Odsuv/standard

const WEAPON_SLOTS = {
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

class WeaponEnhancementChecker extends Analyzer {
  get WeaponSlots(): any {
    return WEAPON_SLOTS;
  }

  get MaxEnchantIds(): number[] {
    return [];
  }

  get enhanceableWeapons() {
    return Object.keys(this.WeaponSlots).reduce((obj: { [key: number]: Item }, slot) => {
      const item = this.selectedCombatant._getGearItemBySlotId(Number(slot));

      // If there is no offhand, disregard the item.
      // If the icon has `offhand` in the name, we know it's not a weapon and doesn't need an enhancement.
      // This is not an ideal way to determine if an offhand is a weapon.
      if (item.id === 0 || item.icon.includes('offhand') || item.icon.includes('shield')) {
        return obj;
      }
      obj[Number(slot)] = this.selectedCombatant._getGearItemBySlotId(Number(slot));

      return obj;
    }, {});
  }

  get numWeapons() {
    return Object.keys(this.enhanceableWeapons).length || 1;
  }

  get weaponsMissingEnhancement() {
    const gear = this.enhanceableWeapons;
    return Object.keys(gear).length > 0
      ? Object.keys(gear).filter((slot) => !this.hasEnhancement(gear[Number(slot)]))
      : null;
  }

  get numWeaponsMissingEnhancement() {
    return this.weaponsMissingEnhancement ? this.weaponsMissingEnhancement.length : 1;
  }

  get weaponsMissingMaxEnhancement() {
    const gear = this.enhanceableWeapons;
    return Object.keys(gear).filter(
      (slot) =>
        this.hasEnhancement(gear[Number(slot)]) && !this.hasMaxEnhancement(gear[Number(slot)]),
    );
  }

  get numWeaponsMissingMaxEnhancement() {
    return this.weaponsMissingMaxEnhancement.length;
  }

  hasEnhancement(item: Item): number | null {
    return item.temporaryEnchant || null;
  }

  hasMaxEnhancement(item: Item) {
    if (!item.temporaryEnchant) {
      return false;
    }
    return this.maxEnchantIds.includes(item.temporaryEnchant);
  }

  get weaponsEnhancedThreshold() {
    return {
      actual: this.numWeapons - this.numWeaponsMissingEnhancement,
      max: this.numWeapons,
      isLessThan: this.numWeapons,
      style: ThresholdStyle.NUMBER,
    };
  }

  get bestWeaponEnhancementsThreshold() {
    return {
      actual:
        this.numWeapons - this.numWeaponsMissingEnhancement - this.numWeaponsMissingMaxEnhancement,
      max: this.numWeapons,
      isLessThan: this.numWeapons,
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    const gear = this.enhanceableWeapons;
    const weaponSlots: { [key: number]: JSX.Element } = this.WeaponSlots;
    // iterating with keys instead of value because the values don't store what slot is being looked at
    Object.keys(gear).forEach((slot) => {
      const item = gear[Number(slot)];
      const slotName = weaponSlots[Number(slot)];
      const hasEnhancement = this.hasEnhancement(item);

      when(Boolean(hasEnhancement))
        .isFalse()
        .addSuggestion((suggest, actual, recommended) =>
          suggest(
            <Trans id="shared.weaponEnhancementChecker.suggestions.noWeaponEnhancement.label">
              Your{' '}
              <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
                {slotName}
              </ItemLink>{' '}
              is missing a weapon enhancement (weapon oil/sharpening stone/weightstone). Apply an
              enhancement to very easily increase your throughput slightly.
            </Trans>,
          )
            .icon(item.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.REGULAR),
        );

      const noMaxEnchant = Boolean(hasEnhancement) && !this.hasMaxEnhancement(item);
      when(noMaxEnchant)
        .isTrue()
        .addSuggestion((suggest, actual, recommended) =>
          suggest(
            <Trans id="shared.weaponEnhancementChecker.suggestions.weakWeaponEnhancement.label">
              Your
              <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
                {slotName}
              </ItemLink>
              has a cheap weapon enhancement [{hasEnhancement}] (weapon oil/sharpening
              stone/weightstone). Apply a strong enhancement to very easily increase your throughput
              slightly.
            </Trans>,
          )
            .icon(item.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
        );
    });
  }
}

export default WeaponEnhancementChecker;
