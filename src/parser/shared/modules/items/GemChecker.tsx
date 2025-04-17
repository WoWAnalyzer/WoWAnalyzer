import { Trans } from '@lingui/react/macro';
//import ITEMS from 'common/ITEMS';
import { Gem as GemItem } from 'common/ITEMS/Item';
import { ItemLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { Item, Gem as EventGem } from 'parser/core/Events';
import { ItemHelper } from 'parser/core/itemHelper';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { GemBoxRowEntry } from 'interface/guide/components/Preparation/GemSubSection/GemBoxRow';
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
    return Object.keys(gear).filter(
      (slot) => !this.hasMaxGemCount(gear[Number(slot)], Number(slot)),
    );
  }

  get numSlotsMissingEnchant() {
    return this.slotsMissingEnchant.length;
  }

  get slotsMissingGemEnchant() {
    const gear = this.GemableGear;
    return Object.keys(gear).filter(
      (slot) =>
        this.hasGem(gear[Number(slot)]) && this.hasMaxGemCount(gear[Number(slot)], Number(slot)),
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

  hasMaxGemCount(item: Item, slot: number) {
    //BonusID for sockets is 10878, 10879, 10880 (1, 2, 3 respectively)
    if (item.bonusIDs === undefined) {
      return true;
    }

    if (Array.isArray(item.bonusIDs) && ItemHelper.hasBonusId(item, 10880)) {
      return (item.gems?.length ?? 0) >= 3;
    } else if (GemChecker.twoSlots.includes(slot) || ItemHelper.hasBonusId(item, 10879)) {
      return (item.gems?.length ?? 0) >= 2;
    } else if (GemChecker.oneSlot.includes(slot) || ItemHelper.hasBonusId(item, 10878)) {
      return this.hasGem(item);
    } else {
      return true;
    }
  }

  //Add a row for the actual Gem in the future to evaluate each
  boxRowPerformance(item: Item, recommendedGems: number[] | undefined, slot: number) {
    const hasMaxGem = this.hasMaxGemCount(item, slot);
    let qualitativePerformance = QualitativePerformance.Fail;
    if (hasMaxGem) {
      qualitativePerformance = QualitativePerformance.Good;
    }

    let maxGem = true;
    const gemRank: { qualitativePerformance: QualitativePerformance; gem: EventGem }[] = [];

    if ((item.gems ?? []).length > 0) {
      item.gems!.forEach((iGem) => {
        const lookupGem = gemById[iGem.id];

        let tempQP = QualitativePerformance.Fail;

        switch (lookupGem?.craftQuality) {
          case 3:
            tempQP = QualitativePerformance.Perfect;
            break;
          case 2:
            tempQP = QualitativePerformance.Good;
            maxGem = false;
            break;
          case 1:
            tempQP = QualitativePerformance.Ok;
            maxGem = false;
            break;
          case undefined: //Consider Item Level when there isn't a lookup.
            tempQP = QualitativePerformance.Ok;
            maxGem = false;
            break;
          default:
            tempQP = QualitativePerformance.Fail;
            maxGem = false;
            break;
        }

        gemRank.push({
          qualitativePerformance: tempQP,
          gem: iGem,
        });

        if (hasMaxGem && maxGem) {
          qualitativePerformance = QualitativePerformance.Perfect;
        } else if (hasMaxGem && !maxGem) {
          qualitativePerformance = QualitativePerformance.Good;
        } else if (!hasMaxGem) {
          qualitativePerformance = QualitativePerformance.Ok;
        } else {
          qualitativePerformance = tempQP;
        }
      });

      return { qualitativePerformance, gemRank };
    }
  }

  boxRowItemLink(item: Item, slotName: JSX.Element) {
    return (
      <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
        {slotName}
      </ItemLink>
    );
  }

  boxRowTooltip(item: Item, slotName: JSX.Element, recommendedEnchantments: GemItem[] | undefined) {
    /*const hasEnchant = this.hasGem(item);
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
    const recommendedEnchantIds = recommendedEnchantments?.map((it) => it.it);
    const currentEnchant = Object.values(ITEMS).find(
      (it): it is GemItem => 'Id' in it && it.effectId === item.permanentEnchant,
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
    }*/
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

  getGemBoxRowEntries(recommendedGems: Record<number, GemItem[]> = {}): GemBoxRowEntry[] {
    const gear = this.GemableGear;
    const gemSlots: { [key: number]: JSX.Element } = this.GemableSlots;

    // Filter out items that cannot have gems
    return Object.keys(gear)
      .filter((slot) => {
        const slotNumber = Number(slot);
        const item = gear[slotNumber];
        return (
          ItemHelper.hasBonusId(item, 10878) ||
          ItemHelper.hasBonusId(item, 10879) ||
          ItemHelper.hasBonusId(item, 10880) ||
          GemChecker.twoSlots.includes(slotNumber) ||
          GemChecker.oneSlot.includes(slotNumber)
        );
      })
      .map<GemBoxRowEntry>((slot) => {
        const slotNumber = Number(slot);
        const item = gear[slotNumber];
        const slotName = gemSlots[slotNumber];
        const recommendedEnchantments = recommendedGems[slotNumber];

        // Use boxRowPerformance to calculate the value
        const performance = this.boxRowPerformance(
          item,
          recommendedEnchantments?.map((it) => it.id),
          slotNumber,
        );

        return {
          item,
          slotName: this.boxRowItemLink(item, slotName),
          value: {
            itemQP: performance?.qualitativePerformance ?? QualitativePerformance.Fail,
            gems: (performance?.gemRank ?? []).map((gem) => ({
              gemQP: gem.qualitativePerformance,
              gem: gem.gem,
            })),
          },
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

        const noMaxGem = this.hasMaxGemCount(item, slotNumber);
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
