import { Trans } from '@lingui/macro';
import ITEMS from 'common/ITEMS';
import { Enchant as EnchantItem } from 'common/ITEMS/Item';
import { ItemLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { EnchantmentBoxRowEntry } from 'interface/guide/components/Preparation/EnchantmentSubSection/EnchantmentBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class EnchantChecker extends Analyzer {
  get EnchantableSlots(): Record<number, JSX.Element> {
    return {};
  }

  get EnchantableGear(): any {
    const enchantSlots = this.EnchantableSlots;
    return Object.keys(enchantSlots).reduce<Record<number, Item>>((obj, slot) => {
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
    recommendedEnchants: Record<number, EnchantItem[]> = {},
  ): EnchantmentBoxRowEntry[] {
    const gear = this.EnchantableGear;
    const enchantSlots: { [key: number]: JSX.Element } = this.EnchantableSlots;

    return Object.keys(gear).map<EnchantmentBoxRowEntry>((slot) => {
      const slotNumber = Number(slot);
      const item = gear[slotNumber];
      const slotName = enchantSlots[slotNumber];
      const recommendedEnchantments = recommendedEnchants[slotNumber];
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
              is missing an enchant. Apply a strong enchant to increase your throughput.
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
              has a cheap enchant. Apply a stronger enchant to increase your throughput.
            </Trans>,
          )
            .icon(item.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
        );
    });
  }
}

export default EnchantChecker;
