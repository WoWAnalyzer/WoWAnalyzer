import type { JSX } from 'react';
import { Trans } from '@lingui/react/macro';
import ITEMS from 'common/ITEMS';
import { Enchant as EnchantItem } from 'common/ITEMS/Item';
import { ItemLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { EnchantmentBoxRowEntry } from 'interface/guide/components/Preparation/EnchantmentSubSection/EnchantmentBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SlotMap } from 'parser/core/Combatant';
import typedKeys from 'common/typedKeys';

class EnchantChecker extends Analyzer {
  get EnchantableSlots(): SlotMap<JSX.Element> {
    return {};
  }

  get EnchantableGear(): SlotMap<Item> {
    const enchantSlots = this.EnchantableSlots;
    return typedKeys(enchantSlots).reduce<SlotMap<Item>>((obj, slot) => {
      const item = this.selectedCombatant.getGear(slot);
      if (!item) {
        return obj;
      }

      // If there is no offhand, disregard the item.
      // If the icon has `offhand` in the name, we know it's not a weapon and doesn't need an enchant.
      // This is not an ideal way to determine if an offhand is a weapon.
      if (item.id === 0 || item.icon.includes('offhand') || item.icon.includes('shield')) {
        return obj;
      }
      obj[slot] = item;

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
    return typedKeys(gear).filter((slot) => !this.hasEnchant(gear[slot]!));
  }

  get numSlotsMissingEnchant() {
    return this.slotsMissingEnchant.length;
  }

  get slotsMissingMaxEnchant() {
    const gear = this.EnchantableGear;
    return typedKeys(gear).filter(
      (slot) => this.hasEnchant(gear[slot]!) && !this.hasMaxEnchant(gear[slot]!),
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

  boxRowPerformance(item: Item, recommendedEnchantments: number[] | undefined) {
    const hasEnchant = this.hasEnchant(item);
    const hasMaxEnchant = hasEnchant && this.hasMaxEnchant(item);
    const recommendedEnchantmentExists = recommendedEnchantments !== undefined;
    if (hasMaxEnchant) {
      if (
        recommendedEnchantmentExists &&
        recommendedEnchantments.includes(item.permanentEnchant ?? 0)
      ) {
        return QualitativePerformance.Perfect;
      }
      return QualitativePerformance.Good;
    }
    if (hasEnchant) {
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
    recommendedEnchantments: EnchantItem[] | undefined,
  ) {
    const hasEnchant = this.hasEnchant(item);
    const hasMaxEnchant = hasEnchant && this.hasMaxEnchant(item);
    const recommendedEnchantList = recommendedEnchantments
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
    const recommendedEnchantIds = recommendedEnchantments?.map((it) => it.effectId);
    const currentEnchant = Object.values(ITEMS).find(
      (it): it is EnchantItem => 'effectId' in it && it.effectId === item.permanentEnchant,
    );
    const currentEnchantContent = currentEnchant ? (
      <>
        {' '}
        (<ItemLink id={currentEnchant.id} craftQuality={currentEnchant.craftQuality} />)
      </>
    ) : null;
    if (hasMaxEnchant) {
      if (
        recommendedEnchantIds &&
        recommendedEnchantList &&
        !recommendedEnchantIds.includes(item.permanentEnchant ?? 0)
      ) {
        return (
          <Trans id="shared.enchantChecker.guide.strongEnchant.labelWithRecommendation">
            Your {slotName} has a strong enchant{currentEnchantContent} but these are recommended:{' '}
            {recommendedEnchantList}
          </Trans>
        );
      }
      return (
        <Trans id="shared.enchantChecker.guide.strongEnchant.label">
          Your {slotName} has a strong enchant{currentEnchantContent}. Good work!
        </Trans>
      );
    }
    if (hasEnchant) {
      if (recommendedEnchantList) {
        return (
          <Trans id="shared.enchantChecker.guide.weakEnchant.labelWithRecommendation">
            Your {slotName} has a cheap enchant{currentEnchantContent}. Apply a stronger enchant to
            increase your throughput. Recommended: {recommendedEnchantList}
          </Trans>
        );
      }
      return (
        <Trans id="shared.enchantChecker.guide.weakEnchant.label">
          Your {slotName} has a cheap enchant{currentEnchantContent}. Apply a stronger enchant to
          increase your throughput.
        </Trans>
      );
    }
    if (recommendedEnchantList) {
      return (
        <Trans id="shared.enchantChecker.guide.noEnchant.labelWithRecommendation">
          Your {slotName} is missing an enchant. Apply a strong enchant to increase your throughput.
          Recommended: {recommendedEnchantList}
        </Trans>
      );
    }
    return (
      <Trans id="shared.enchantChecker.guide.noEnchant.label">
        Your {slotName} is missing an enchant. Apply a strong enchant to increase your throughput.
      </Trans>
    );
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

  getEnchantmentBoxRowEntries(
    recommendedEnchants: SlotMap<EnchantItem[]> = {},
  ): EnchantmentBoxRowEntry[] {
    const gear = this.EnchantableGear;
    const enchantSlots = this.EnchantableSlots;

    return typedKeys(gear).map<EnchantmentBoxRowEntry>((slot) => {
      const item = gear[slot]!;
      const slotName = enchantSlots[slot]!;
      const recommendedEnchantments = recommendedEnchants[slot];
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

export default EnchantChecker;
