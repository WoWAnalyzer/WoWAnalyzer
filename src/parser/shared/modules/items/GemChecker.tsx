import { Trans } from '@lingui/react/macro';
import ITEMS from 'common/ITEMS';
import { Enchant as EnchantItem } from 'common/ITEMS/Item';
import { ItemLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { EnchantmentBoxRowEntry } from 'interface/guide/components/Preparation/EnchantmentSubSection/EnchantmentBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { gemById } from 'common/ITEMS/thewarwithin/gems'; //Will be used later intermediate commit
import GEAR_SLOTS from 'game/GEAR_SLOTS';

class GemChecker extends Analyzer {
  //Which slots can have a gem slots added
  static twoSlots = [GEAR_SLOTS.NECK, GEAR_SLOTS.FINGER1, GEAR_SLOTS.FINGER2];
  static oneSlot = [GEAR_SLOTS.HEAD, GEAR_SLOTS.WAIST, GEAR_SLOTS.WRISTS];

  get GemableSlots(): Record<number, JSX.Element> {
    return {}; //Keeping form with EnchantChecker and having the user override this
  }

  //Figure out who slot is not a number to begin with...

  get GemableGear(): any {
    const gemSlots = this.GemableSlots;
    return Object.keys(gemSlots).reduce<Record<number, Item>>((obj, slot) => {
      const innerSlot = Number(slot);

      obj[innerSlot] = this.selectedCombatant._getGearItemBySlotId(innerSlot);

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
    return Object.keys(this.GemableGear).length;
  }

  get slotsMissingEnchant() {
    const gear = this.GemableGear;
    return Object.keys(gear).filter((slot) => !this.hasMaxGems(gear[Number(slot)], Number(slot)));
  }

  get numSlotsMissingEnchant() {
    return this.slotsMissingEnchant.length;
  }

  get slotsMissingGemEnchant() {
    const gear = this.GemableGear;
    return Object.keys(gear).filter(
      (slot) =>
        this.hasGem(gear[Number(slot)]) && this.hasMaxGems(gear[Number(slot)], Number(slot)),
    );
  }

  get numSlotsMissingMaxEnchant() {
    return this.slotsMissingGemEnchant.length;
  }

  hasGem(item: Item) {
    //Check if slot is empty
    return (item.gems?.length ?? 0) > 0;
  }

  hasMaxEnchant(item: Item) {
    if (item.permanentEnchant) {
      return this.MaxEnchantIds.includes(item.permanentEnchant);
    }
    return false;
  }

  hasMaxGems(item: Item, slot: number) {
    //If Neck or Ring then min 2 gems - Slotted from Settings
    if (GemChecker.twoSlots.includes(slot)) {
      return (item.gems?.length ?? 0) >= 2;
    } //If Helm, Bracer, or Belt min 1 - Slotted from Vault Coins
    else if (GemChecker.oneSlot.includes(slot)) {
      return this.hasGem(item);
    }
    /*else if(false) //Check if Gem Slot is empty (however you do that.)
    {
        
    }*/ //If you here you have no slot at all so you have to have max gems of none
    else {
      return true;
    }
  }

  boxRowPerformance(item: Item, recommendedEnchantments: number[] | undefined, slot: number) {
    const hasGem = this.hasGem(item);
    const hasMaxGem = hasGem && this.hasMaxGems(item, slot);
    let qualitativePerformance = QualitativePerformance.Fail;
    if (hasMaxGem && item.gems !== undefined && item.gems.length > 0) {
      item.gems.forEach((gem) => {
        const lookupGem = gemById[gem.id];
        let tempQP = QualitativePerformance.Fail;
        if (lookupGem) {
          switch (lookupGem.craftQuality) {
            case 3:
              tempQP = QualitativePerformance.Perfect;
              break;
            case 2:
              tempQP = QualitativePerformance.Good;
              break;
            case 1:
              tempQP = QualitativePerformance.Ok;
              break;
            default:
              tempQP = QualitativePerformance.Fail;
          }
        }

        if (lookupGem === undefined && qualitativePerformance !== QualitativePerformance.Fail) {
          qualitativePerformance = QualitativePerformance.Ok;
        } else if (
          tempQP !== qualitativePerformance &&
          qualitativePerformance !== QualitativePerformance.Fail
        ) {
          qualitativePerformance = QualitativePerformance.Good;
        } else {
          qualitativePerformance = tempQP;
        }
      });

      return qualitativePerformance;
    }
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
    const hasEnchant = this.hasGem(item);
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

  getGemBoxRowEntries(
    recommendedEnchants: Record<number, EnchantItem[]> = {},
  ): EnchantmentBoxRowEntry[] {
    const gear = this.GemableGear;
    const gemSlots: { [key: number]: JSX.Element } = this.GemableSlots;

    //Let's try to filter out the ones that don't have a way to have a gem.
    return Object.keys(gear)
      .filter((slot) => {
        const slotNumber = Number(slot);
        const item = gear[slotNumber];
        return (
          this.hasGem(item) ||
          GemChecker.twoSlots.includes(slotNumber) ||
          GemChecker.oneSlot.includes(slotNumber)
        );
      })
      .map<EnchantmentBoxRowEntry>((slot) => {
        const slotNumber = Number(slot);
        const item = gear[slotNumber];
        const slotName = gemSlots[slotNumber];
        const recommendedEnchantments = recommendedEnchants[slotNumber];
        return {
          item,
          slotName: this.boxRowItemLink(item, slotName),
          value:
            this.boxRowPerformance(
              item,
              recommendedEnchantments?.map((it) => it.effectId),
              slotNumber,
            ) ?? QualitativePerformance.Fail,
          tooltip: this.boxRowTooltip(item, slotName, recommendedEnchantments),
        };
      });
  }

  suggestions(when: When) {
    const gear = this.GemableGear;
    const enchantSlots: { [key: number]: JSX.Element } = this.GemableSlots;

    //Let's try to filter out the ones that don't have a way to have a gem.
    Object.keys(gear)
      .filter((slot) => {
        const slotNumber = Number(slot);
        const item = gear[slotNumber];
        return (
          this.hasGem(item) ||
          GemChecker.twoSlots.includes(slotNumber) ||
          GemChecker.oneSlot.includes(slotNumber)
        );
      })
      .forEach((slot) => {
        const slotNumber = Number(slot);
        const item = gear[slotNumber];
        const slotName = enchantSlots[slotNumber];
        const hasGem = this.hasGem(item);

        when(hasGem)
          .isFalse()
          .addSuggestion((suggest, actual, recommended) =>
            suggest(
              <Trans id="shared.enchantChecker.suggestions.noEnchant.label">
                Your{' '}
                <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
                  {slotName}
                </ItemLink>{' '}
                is missing a gem or a gem slot and a gem.
              </Trans>,
            )
              .icon(item.icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MAJOR),
          );

        const noMaxGem = this.hasMaxGems(item, slotNumber);
        when(noMaxGem)
          .isFalse()
          .addSuggestion((suggest, actual, recommended) =>
            suggest(
              <Trans id="shared.enchantChecker.suggestions.weakEnchant.label">
                Your{' '}
                <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
                  {slotName}
                </ItemLink>{' '}
                does not have all possible gem slots or not all gems slots are filled.
              </Trans>,
            )
              .icon(item.icon)
              .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
          );
      });
  }
}

export default GemChecker;
