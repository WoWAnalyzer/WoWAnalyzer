import { Enchant } from 'common/SPELLS/Spell';
import { ItemLink } from 'interface';
import { EnhancementBoxRowEntry } from 'interface/guide/components/Preparation/EnhancementSubSection/EnhancementBoxRow';
import Analyzer from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import typedKeys from 'common/typedKeys';

// Example logs with missing enhancement:
// /report/YCNrxPnyHt9g6dhj/2-Mythic+Crawth+-+Kill+(1:45)/1-Sigilweaver/standard

const LEG_SLOT = {
  6: <>Legs</>,
};

class LegEnhancementChecker extends Analyzer {
  get LegSlot(): Record<number, JSX.Element> {
    return LEG_SLOT;
  }

  get MaxEnchantIds(): number[] {
    return [];
  }

  get enhanceableLegs() {
    return typedKeys(this.LegSlot).reduce<{ [key: number]: Item }>((obj, slot) => {
      const item = this.selectedCombatant._getGearItemBySlotId(slot);

      if (item.id === 0) {
        return obj;
      }
      obj[Number(slot)] = this.selectedCombatant._getGearItemBySlotId(slot);

      return obj;
    }, {});
  }

  get numLegs() {
    return Object.keys(this.enhanceableLegs).length || 1;
  }

  get legsMissingEnhancement() {
    const gear = this.enhanceableLegs;
    return Object.keys(gear).length > 0
      ? typedKeys(gear).filter((slot) => !this.hasEnhancement(gear[slot]))
      : null;
  }

  get numLegsMissingEnhancement() {
    return this.legsMissingEnhancement ? this.legsMissingEnhancement.length : 1;
  }

  get legsMissingMaxEnhancement() {
    const gear = this.enhanceableLegs;
    return Object.keys(gear).filter(
      (slot) =>
        this.hasEnhancement(gear[Number(slot)]) && !this.hasMaxEnhancement(gear[Number(slot)]),
    );
  }

  get numLegsMissingMaxEnhancement() {
    return this.legsMissingMaxEnhancement.length;
  }

  hasEnhancement(item: Item): number | null {
    return item.permanentEnchant || null;
  }

  hasMaxEnhancement(item: Item) {
    if (!item.permanentEnchant) {
      return false;
    }
    return this.MaxEnchantIds.includes(item.permanentEnchant);
  }

  get legsEnhancedThreshold() {
    return {
      actual: this.numLegs - this.numLegsMissingEnhancement,
      max: this.numLegs,
      isLessThan: this.numLegs,
      style: ThresholdStyle.NUMBER,
    };
  }

  get bestLegEnhancementsThreshold() {
    return {
      actual: this.numLegs - this.numLegsMissingEnhancement - this.numLegsMissingMaxEnhancement,
      max: this.numLegs,
      isLessThan: this.numLegs,
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
        recommendedEnhancements.includes(item.permanentEnchant ?? 0)
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
        !recommendedEnhancementIds.includes(item.permanentEnchant ?? 0)
      ) {
        return (
          <>
            Your {slotName} has a strong leg enhancement but these are recommended:{' '}
            {recommendedEnhancementNames}
          </>
        );
      }
      return (
        <>
          Your {slotName} has a strong leg enhancement (weapon oil/sharpening stone/weightstone).
          Good work!
        </>
      );
    }
    if (hasEnhancement) {
      if (recommendedEnhancementNames) {
        return (
          <>
            Your {slotName} has a cheap leg enhancement. Apply a strong enhancement to very easily
            increase your throughput slightly. Recommended: {recommendedEnhancementNames}
          </>
        );
      }
      return (
        <>
          Your {slotName} has a cheap leg enhancement. Apply a strong enhancement to very easily
          increase your throughput slightly.
        </>
      );
    }
    if (recommendedEnhancementNames) {
      return (
        <>
          Your {slotName} is missing a leg enhancement. Apply an enhancement to very easily increase
          your throughput slightly. Recommended: {recommendedEnhancementNames}
        </>
      );
    }
    return (
      <>
        Your {slotName} is missing a leg enhancement. Apply an enhancement to very easily increase
        your throughput slightly.
      </>
    );
  }

  getLegEnhancementBoxRowEntries(
    recommendedLegEnhancements: Enchant[] = [],
  ): EnhancementBoxRowEntry[] {
    const gear = this.enhanceableLegs;
    const enchantSlots: { [key: number]: JSX.Element } = this.LegSlot;

    return Object.keys(gear).map<EnhancementBoxRowEntry>((slot) => {
      const slotNumber = Number(slot);
      const item = gear[slotNumber];
      const slotName = enchantSlots[slotNumber];
      const recommendedEnchantments = recommendedLegEnhancements;
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
    const gear = this.enhanceableLegs;
    const weaponSlots: { [key: number]: JSX.Element } = this.LegSlot;
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
              is missing a leg enhancement. Apply an enhancement to very easily increase your
              throughput slightly.
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
              Your
              <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
                {slotName}
              </ItemLink>
              has a cheap leg enhancement. Apply a strong enhancement to very easily increase your
              throughput slightly.
            </>,
          )
            .icon(item.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
        );
    });
  }
}

export default LegEnhancementChecker;
