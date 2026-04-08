import { Trans } from '@lingui/react/macro';
import ITEMS from 'common/ITEMS';
import { Enchant as EnchantItem } from 'common/ITEMS/Item';
import { Enchant } from 'common/SPELLS/Spell';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import { ItemLink } from 'interface';
import { EnhancementBoxRowEntry } from 'interface/guide/components/Preparation/EnhancementSubSection/EnhancementBoxRow';
import Analyzer from 'parser/core/Analyzer';
import { SlotMap } from 'parser/core/Combatant';
import { Item } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import typedKeys from 'common/typedKeys';
import type { JSX } from 'react';

// Example logs with missing enhancement:
// /report/XQrLTRC1bFWGAt3m/21-Mythic+The+Council+of+Blood+-+Wipe+10+(3:17)/Odsuv/standard

const WEAPON_SLOTS: SlotMap<JSX.Element> = {
  MAINHAND: <Trans id="common.slots.weapon">Weapon</Trans>,
  OFFHAND: <Trans id="common.slots.offhand">OffHand</Trans>,
};

class WeaponEnhancementChecker extends Analyzer {
  get WeaponSlots(): SlotMap<JSX.Element> {
    return WEAPON_SLOTS;
  }

  get MaxEnchantIds(): number[] {
    return [];
  }

  get enhanceableWeapons(): SlotMap<Item> {
    // totemic resto shamans can enchant a shield
    const includeShield =
      (this.selectedCombatant.spec === SPECS.ELEMENTAL_SHAMAN &&
        this.selectedCombatant.hasTalent(TALENTS_SHAMAN.THUNDERSTRIKE_WARD_TALENT)) ||
      (this.selectedCombatant.spec === SPECS.RESTORATION_SHAMAN &&
        this.selectedCombatant.hasTalent(TALENTS_SHAMAN.SUPPORTIVE_IMBUEMENTS_TALENT));

    return typedKeys(this.WeaponSlots).reduce<SlotMap<Item>>((obj, slot) => {
      const item = this.selectedCombatant.getGear(slot);
      if (!item) {
        return obj;
      }

      // If there is no offhand, disregard the item.
      // If the icon has `offhand` in the name, we know it's not a weapon and doesn't need an enhancement.
      // This is not an ideal way to determine if an offhand is a weapon.
      if (
        item.id === 0 ||
        item.icon.includes('offhand') ||
        (!includeShield && item.icon.includes('shield'))
      ) {
        return obj;
      }
      obj[slot] = item;

      return obj;
    }, {});
  }

  get numWeapons() {
    return Object.keys(this.enhanceableWeapons).length || 1;
  }

  get weaponsMissingEnhancement() {
    const gear = this.enhanceableWeapons;
    const slots = typedKeys(gear);
    return slots.length > 0 ? slots.filter((slot) => !this.hasEnhancement(gear[slot]!)) : null;
  }

  get numWeaponsMissingEnhancement() {
    return this.weaponsMissingEnhancement ? this.weaponsMissingEnhancement.length : 1;
  }

  get weaponsMissingMaxEnhancement() {
    const gear = this.enhanceableWeapons;
    return typedKeys(gear).filter(
      (slot) => this.hasEnhancement(gear[slot]!) && !this.hasMaxEnhancement(gear[slot]!),
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

  get exampleWeaponEnchancements() {
    return (
      <Trans id="shared.weaponEnhancementChecker.weaponEnhancementExamples">
        oil, whetstone, or weightstone
      </Trans>
    );
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

  boxRowTooltip(
    item: Item,
    slotName: JSX.Element,
    recommendedEnhancements: EnchantItem[] | undefined,
  ) {
    const hasEnhancement = this.hasEnhancement(item);
    const hasMaxEnhancement = hasEnhancement && this.hasMaxEnhancement(item);
    const recommendedEnhancementList = recommendedEnhancements
      ?.map((enchant) => (
        <ItemLink key={enchant.id} id={enchant.id} craftQuality={enchant.craftQuality} />
      ))
      .reduce((acc, x) =>
        acc == null ? (
          x
        ) : (
          <>
            {acc}, {x}
          </>
        ),
      );

    const recommendedEnhancementIds = recommendedEnhancements?.map((it) => it.effectId);
    const currentEnhancement = Object.values(ITEMS).find(
      (items): items is EnchantItem =>
        'effectId' in items && items.effectId === item.temporaryEnchant,
    );
    const currentEnhancementContent = currentEnhancement ? (
      <ItemLink id={currentEnhancement.id} craftQuality={currentEnhancement.craftQuality} />
    ) : (
      this.exampleWeaponEnchancements
    );

    if (hasMaxEnhancement) {
      if (
        recommendedEnhancementIds &&
        recommendedEnhancementList &&
        !recommendedEnhancementIds.includes(item.temporaryEnchant ?? 0)
      ) {
        return (
          <Trans id="shared.weaponEnhancementChecker.guide.strongEnhancement.labelWithRecommendation">
            Your {slotName} has a strong enhancement ({currentEnhancementContent}) but these are
            recommended: {recommendedEnhancementList}
          </Trans>
        );
      }
      return (
        <Trans id="shared.weaponEnhancementChecker.guide.strongEnhancement.label">
          Your {slotName} has a strong enhancement ({currentEnhancementContent}
          ). Good work!
        </Trans>
      );
    }
    if (hasEnhancement) {
      if (recommendedEnhancementList) {
        return (
          <Trans id="shared.weaponEnhancementChecker.guide.weakEnhancement.labelWithRecommendation">
            Your {slotName} has a cheap weapon enhancement ({this.exampleWeaponEnchancements}) .
            Apply a strong enhancement to very easily increase your throughput slightly.
            Recommended: {recommendedEnhancementList}
          </Trans>
        );
      }
      return (
        <Trans id="shared.weaponEnhancementChecker.guide.weakEnhancement.label">
          Your {slotName} has a cheap weapon enhancement ({currentEnhancementContent}
          ). Apply a strong enhancement to very easily increase your throughput slightly.
        </Trans>
      );
    }
    if (recommendedEnhancementList) {
      return (
        <Trans id="shared.weaponEnhancementChecker.guide.noEnhancement.labelWithRecommendation">
          Your {slotName} is missing a weapon enhancement (rune/sharpening stone/weightstone). Apply
          an enhancement to very easily increase your throughput slightly. Recommended:{' '}
          {recommendedEnhancementList}
        </Trans>
      );
    }
    return (
      <Trans id="shared.weaponEnhancementChecker.guide.noEnhancement.label">
        Your {slotName} is missing a weapon enhancement (rune/sharpening stone/weightstone). Apply
        an enhancement to very easily increase your throughput slightly.
      </Trans>
    );
  }

  getWeaponEnhancementBoxRowEntries(
    recommendedWeaponEnhancements: SlotMap<Enchant[]> = {},
  ): EnhancementBoxRowEntry[] {
    const gear = this.enhanceableWeapons;
    const enchantSlots = this.WeaponSlots;

    return typedKeys(gear).map<EnhancementBoxRowEntry>((slot) => {
      const item = gear[slot]!;
      const slotName = enchantSlots[slot]!;
      const recommendedEnchantments = recommendedWeaponEnhancements[slot];
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
}

export default WeaponEnhancementChecker;
