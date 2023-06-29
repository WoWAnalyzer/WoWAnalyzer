import { Enchant } from 'common/SPELLS/Spell';
import { ItemLink } from 'interface';
import { EnhancementBoxRowEntry } from 'interface/guide/components/Preparation/EnhancementSubSection/EnhancementBoxRow';
import Analyzer from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

// Example logs with missing enhancement:
// /report/XQrLTRC1bFWGAt3m/21-Mythic+The+Council+of+Blood+-+Wipe+10+(3:17)/Odsuv/standard

const WEAPON_SLOTS = {
  15: <>Weapon</>,
  16: <>OffHand</>,
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
    return this.MaxEnchantIds.includes(item.temporaryEnchant);
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

  boxRowPerformance(item: Item, recommendedEnhancements: number[] | undefined) {
    const hasEnhancement = this.hasEnhancement(item);
    const hasMaxEnhancement = hasEnhancement && this.hasMaxEnhancement(item);
    const recommendedEnchantmentExists = recommendedEnhancements !== undefined;
    if (hasMaxEnhancement) {
      if (
        recommendedEnchantmentExists &&
        recommendedEnhancements.includes(item.temporaryEnchant ?? 0)
      ) {
        return QualitativePerformance.Perfect;
      }
      return QualitativePerformance.Good;
    }
    if (hasEnhancement) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  boxRowItemLink(item: Item, slotName: JSX.Element) {
    return (
      <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
        {slotName}
      </ItemLink>
    );
  }

  boxRowTooltip(item: Item, slotName: JSX.Element, recommendedEnhancements: Enchant[] | undefined) {
    const hasEnhancement = this.hasEnhancement(item);
    const hasMaxEnhancement = hasEnhancement && this.hasMaxEnhancement(item);
    const recommendedEnhancementNames = recommendedEnhancements?.map((it) => it.name)?.join(', ');
    const recommendedEnhancementIds = recommendedEnhancements?.map((it) => it.effectId);
    if (hasMaxEnhancement) {
      if (
        recommendedEnhancementIds &&
        recommendedEnhancementNames &&
        !recommendedEnhancementIds.includes(item.temporaryEnchant ?? 0)
      ) {
        return (
          <>
            Your {slotName} has a strong enhancement (rune/sharpening stone/weightstone) but these
            are recommended: {recommendedEnhancementNames}
          </>
        );
      }
      return (
        <>
          Your {slotName} has a strong enhancement (rune/sharpening stone/weightstone). Good work!
        </>
      );
    }
    if (hasEnhancement) {
      if (recommendedEnhancementNames) {
        return (
          <>
            Your {slotName} has a cheap weapon enhancement (rune/sharpening stone/weightstone).
            Apply a strong enhancement to very easily increase your throughput slightly.
            Recommended: {recommendedEnhancementNames}
          </>
        );
      }
      return (
        <>
          Your {slotName} has a cheap weapon enhancement (rune/sharpening stone/weightstone). Apply
          a strong enhancement to very easily increase your throughput slightly.
        </>
      );
    }
    if (recommendedEnhancementNames) {
      return (
        <>
          Your {slotName} is missing a weapon enhancement (rune/sharpening stone/weightstone). Apply
          an enhancement to very easily increase your throughput slightly. Recommended:{' '}
          {recommendedEnhancementNames}
        </>
      );
    }
    return (
      <>
        Your {slotName} is missing a weapon enhancement (rune/sharpening stone/weightstone). Apply
        an enhancement to very easily increase your throughput slightly.
      </>
    );
  }

  getWeaponEnhancementBoxRowEntries(
    recommendedWeaponEnhancements: Record<number, Enchant[]> = {},
  ): EnhancementBoxRowEntry[] {
    const gear = this.enhanceableWeapons;
    const enchantSlots: { [key: number]: JSX.Element } = this.WeaponSlots;

    return Object.keys(gear).map<EnhancementBoxRowEntry>((slot) => {
      const slotNumber = Number(slot);
      const item = gear[slotNumber];
      const slotName = enchantSlots[slotNumber];
      const recommendedEnchantments = recommendedWeaponEnhancements[slotNumber];
      return {
        item,
        slotName: this.boxRowItemLink(item, slotName),
        value: this.boxRowPerformance(
          item,
          recommendedEnchantments?.map((it) => it.effectId),
        ),
        tooltip: this.boxRowTooltip(item, slotName, recommendedEnchantments),
      };
    });
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
            <>
              Your{' '}
              <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
                {slotName}
              </ItemLink>{' '}
              is missing a weapon enhancement (rune/sharpening stone/weightstone). Apply an
              enhancement to very easily increase your throughput slightly.
            </>,
          )
            .icon(item.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.REGULAR),
        );

      const noMaxEnchant = Boolean(hasEnhancement) && !this.hasMaxEnhancement(item);
      when(noMaxEnchant)
        .isTrue()
        .addSuggestion((suggest, actual, recommended) =>
          suggest(
            <>
              Your{' '}
              <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
                {slotName}
              </ItemLink>{' '}
              has a cheap weapon enhancement (rune/sharpening stone/weightstone). Apply a strong
              enhancement to very easily increase your throughput slightly.
            </>,
          )
            .icon(item.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
        );
    });
  }
}

export default WeaponEnhancementChecker;
