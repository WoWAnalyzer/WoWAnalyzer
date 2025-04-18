import { Trans } from '@lingui/react/macro';
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
        const gemRec = recommendedGems?.includes(iGem.id);

        if (gemRec) {
          tempQP = QualitativePerformance.Perfect;
        } else {
          switch (lookupGem?.craftQuality) {
            case 3:
              if (recommendedGems !== undefined && !gemRec) {
                tempQP = QualitativePerformance.Good;
                maxGem = false;
              } else {
                tempQP = QualitativePerformance.Perfect;
              }
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

  boxRowTooltip(
    item: Item,
    slotName: JSX.Element,
    slotNumber: number,
    recommendedGems: GemItem[] | undefined,
  ) {
    const tooltipContent: JSX.Element[] = [];
    //#region Cyrce's Circlet has different iLevels making the item id less reliable.
    if (item.icon === 'inv_siren_isle_ring.jpg') {
      return (
        <Trans>
          Cyrce's Circlet is a special case. Please see your class guides for best usage.
        </Trans>
      );
    }
    //#endregion

    //Not Gemable
    if (
      item.bonusIDs === undefined &&
      !ItemHelper.hasBonusId(item, 10878) &&
      !ItemHelper.hasBonusId(item, 10879) &&
      !ItemHelper.hasBonusId(item, 10880) &&
      !GemChecker.twoSlots.includes(slotNumber) &&
      !GemChecker.oneSlot.includes(slotNumber)
    ) {
      return <Trans>Your {slotName} cannot take a gem.</Trans>;
    }

    //X gems Missing
    if (ItemHelper.hasBonusId(item, 10880)) {
      const missingGems = 3 - (item.gems?.length ?? 0);
      if (missingGems > 0) {
        tooltipContent.push(
          <Trans>
            You are missing {missingGems} gems on your {slotName}.
          </Trans>,
        );
      } else {
        return <Trans>{slotName} slots are fully gemmed!</Trans>;
      }
    } else if (ItemHelper.hasBonusId(item, 10879)) {
      const missingGems = 2 - (item.gems?.length ?? 0);
      if (missingGems > 0) {
        tooltipContent.push(
          <Trans>
            You are missing {missingGems} gems on your {slotName}.
          </Trans>,
        );
      } else {
        tooltipContent.push(<Trans>{slotName} slots are fully gemmed!</Trans>);
      }
    } else if (ItemHelper.hasBonusId(item, 10878)) {
      if ((item.gems?.length ?? 0) !== 1) {
        tooltipContent.push(<Trans>You are missing a gem on your {slotName}.</Trans>);
      } else {
        tooltipContent.push(<Trans>{slotName} slots are fully gemmed!</Trans>);
      }
    }

    //X Missing Setting
    if (GemChecker.twoSlots.includes(slotNumber)) {
      const missingGems = 2 - (item.gems?.length ?? 0);
      if (missingGems > 0) {
        tooltipContent.push(
          <Trans>
            You are missing {missingGems} possible slot on your {slotName}.<br />
            Craft/Buy Magnificent Jeweler's Setting to add a slot per.
          </Trans>,
        ); //ItemLink in the future when I figure out they work
      }
    } else if (GemChecker.oneSlot.includes(slotNumber)) {
      if ((item.gems?.length ?? 0) !== 1) {
        tooltipContent.push(
          <Trans>
            You are missing a possible slot on your {slotName}. <br />6 Algari Token of Merit for
            S.A.D. to add a slot.
          </Trans>,
        ); //ItemLink in the future when I figure out they work
      }
    }

    // Combine all tooltip content into a single section
    return (
      <div>
        {tooltipContent.map((content, index) => (
          <div key={index}>{content}</div>
        ))}
      </div>
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
        const gemRecommendations = recommendedGems[slotNumber];

        // Use boxRowPerformance to calculate the value
        const performance = this.boxRowPerformance(
          item,
          gemRecommendations?.map((it) => it.id),
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
          tooltip: this.boxRowTooltip(item, slotName, slotNumber, gemRecommendations),
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
