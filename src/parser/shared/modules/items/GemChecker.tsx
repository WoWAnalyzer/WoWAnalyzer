import { Trans } from '@lingui/react/macro';
import { CraftedItem, Gem as GemItem } from 'common/ITEMS/Item';
import { ItemLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { Item as EventItem, Gem as EventGem } from 'parser/core/Events';
import {
  hasBonusId,
  TRIPLE_GEM_BONUS_ID,
  DOUBLE_GEM_BONUS_ID,
  SINGLE_GEM_BONUS_ID,
} from 'parser/core/itemHelper';
import { GemBoxRowEntry } from 'interface/guide/components/Preparation/GemSubSection/GemBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ITEMS from 'common/ITEMS';
import GEAR_SLOTS from 'game/GEAR_SLOTS';

class GemChecker extends Analyzer {
  //Which slots can have a gem slots added
  static twoAddableGemSlots = [GEAR_SLOTS.NECK, GEAR_SLOTS.FINGER1, GEAR_SLOTS.FINGER2];
  static oneAddableGemSlot = [GEAR_SLOTS.HEAD, GEAR_SLOTS.WAIST, GEAR_SLOTS.WRISTS];

  get GemableSlots(): Record<number, JSX.Element> {
    return {}; //Keeping form with EnchantChecker and having the user override this
  }

  get GemableGear(): Record<number, EventItem> {
    const gemSlots = this.GemableSlots;
    return Object.keys(gemSlots).reduce<Record<number, EventItem>>((obj, slot) => {
      const innerSlot = Number(slot);

      obj[innerSlot] = this.selectedCombatant._getGearItemBySlotId(innerSlot);

      return obj;
    }, {});
  }

  hasMaxGemCount(item: EventItem, slot: number) {
    //BonusID for sockets is 10878, 10879, 10880 (1, 2, 3 respectively)

    if (hasBonusId(item, TRIPLE_GEM_BONUS_ID)) {
      return (item.gems?.length ?? 0) >= 3;
    } else if (
      GemChecker.twoAddableGemSlots.includes(slot) ||
      hasBonusId(item, DOUBLE_GEM_BONUS_ID)
    ) {
      return (item.gems?.length ?? 0) >= 2;
    } else if (
      GemChecker.oneAddableGemSlot.includes(slot) ||
      hasBonusId(item, SINGLE_GEM_BONUS_ID)
    ) {
      return (item.gems?.length ?? 0) >= 1;
    }

    return true;
  }

  //#region UI
  //Add a row for the actual Gem in the future to evaluate each
  boxRowPerformance(item: EventItem, recommendedGems: number[] | undefined, slot: number) {
    const hasMaxGem = this.hasMaxGemCount(item, slot);
    let qualitativePerformance = QualitativePerformance.Fail;
    if (hasMaxGem) {
      qualitativePerformance = QualitativePerformance.Good;
    }

    let maxGem = true;
    const gemRank: { qualitativePerformance: QualitativePerformance; gem: EventGem }[] = [];

    if ((item.gems ?? []).length > 0) {
      item.gems!.forEach((iGem) => {
        const lookupGem = ITEMS[iGem.id] as CraftedItem | undefined;

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

  boxRowItemLink(item: EventItem, slotName: JSX.Element) {
    return (
      <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
        {slotName}
      </ItemLink>
    );
  }

  boxRowTooltip(
    item: EventItem,
    slotName: JSX.Element,
    slotNumber: number,
    recommendedGems: GemItem[] | undefined,
  ) {
    const tooltipContent: JSX.Element[] = [];

    //Note for Future me: <Trans id="..."> the text comes from locales/<Localization Code>/messages.json

    //#region Special Cases
    if (item.id === ITEMS.CYRCES_CIRCLET.id) {
      return (
        <Trans id="shared.GemChecker.CyrceSpecialCase">
          Cyrce's Circlet is a special case. Please see your class guides for best usage.
        </Trans>
      );
    }

    //Not Gemable
    if (
      item.bonusIDs === undefined &&
      !hasBonusId(item, SINGLE_GEM_BONUS_ID) &&
      !hasBonusId(item, DOUBLE_GEM_BONUS_ID) &&
      !hasBonusId(item, TRIPLE_GEM_BONUS_ID) &&
      !GemChecker.twoAddableGemSlots.includes(slotNumber) &&
      !GemChecker.oneAddableGemSlot.includes(slotNumber)
    ) {
      return <Trans id="shared.GemChecker.NotGemable">Your {slotName} cannot take a gem.</Trans>;
    }
    //#endregion

    //X gems Missing
    if (hasBonusId(item, TRIPLE_GEM_BONUS_ID)) {
      const missingGems = 3 - (item.gems?.length ?? 0);
      if (missingGems > 0) {
        tooltipContent.push(
          <Trans id="shared.GemChecker.MissingGemsMultiple">
            You are missing {missingGems} gems on your {slotName}.
          </Trans>,
        );
      } else {
        tooltipContent.push(
          <Trans id="shared.GemChecker.guide.FullyGemmed">
            {slotName} slots are fully gemmed!
          </Trans>,
        );
      }
    } else if (hasBonusId(item, DOUBLE_GEM_BONUS_ID)) {
      const missingGems = 2 - (item.gems?.length ?? 0);
      if (missingGems > 0) {
        tooltipContent.push(
          <Trans id="shared.GemChecker.MissingGemsMultiple">
            You are missing {missingGems} gems on your {slotName}.
          </Trans>,
        );
      } else {
        tooltipContent.push(
          <Trans id="shared.GemChecker.guide.FullyGemmed">
            {slotName} slots are fully gemmed!
          </Trans>,
        );
      }
    } else if (hasBonusId(item, SINGLE_GEM_BONUS_ID)) {
      if ((item.gems?.length ?? 0) !== 1) {
        tooltipContent.push(
          <Trans id="shared.GemChecker.MissingGemsSingle">
            You are missing a gem on your {slotName}.
          </Trans>,
        );
      } else {
        tooltipContent.push(
          <Trans id="shared.GemChecker.guide.FullyGemmed">
            {slotName} slots are fully gemmed!
          </Trans>,
        );
      }
    }

    //X Missing Setting
    if (GemChecker.twoAddableGemSlots.includes(slotNumber)) {
      const missingGems = 2 - (item.gems?.length ?? 0);
      if (missingGems > 0) {
        //id="shared.GemChecker.MissingSlotsCraftable"
        tooltipContent.push(
          <Trans>
            <div>
              You are missing {missingGems} possible gem socket on your {slotName}.
            </div>
            <div>
              Craft/Buy <ItemLink id={ITEMS.MAGNIFICENT_JEWELERS_SETTING.id} /> to add a gem socket.
            </div>
          </Trans>,
        ); //ItemLink Doesn't currently work as there is no MAGNIFICENT_JEWELERS_SETTING <ItemLink id={ITEMS.MAGNIFICENT_JEWELERS_SETTING.id} />
      }
    } else if (GemChecker.oneAddableGemSlot.includes(slotNumber)) {
      if ((item.gems?.length ?? 0) !== 1) {
        //id="shared.GemChecker.MissingSlotsVault"
        tooltipContent.push(
          <Trans>
            You do not have a gem socket on your {slotName}. If you don't have good items in your
            Vault, you can get <ItemLink id={ITEMS.ALGARI_TOKEN_OF_MERIT.id} /> instead and trade 6
            of them for <ItemLink id={ITEMS.SAD_SOCKET_ADDING_DEVICE.id} /> at the nearby vendor to
            add a gem socket.
          </Trans>,
        ); //ItemLink in the future when I figure out how they work
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

  getGemBoxRowEntries(recommendedGems: Record<number, GemItem[]> = {}): GemBoxRowEntry[] {
    const gear = this.GemableGear;
    const gemSlots: { [key: number]: JSX.Element } = this.GemableSlots;

    // Filter out items that cannot have gems
    return Object.keys(gear)
      .filter((slot) => {
        const slotNumber = Number(slot);
        const item = gear[slotNumber];
        return (
          hasBonusId(item, SINGLE_GEM_BONUS_ID) ||
          hasBonusId(item, DOUBLE_GEM_BONUS_ID) ||
          hasBonusId(item, TRIPLE_GEM_BONUS_ID) ||
          GemChecker.twoAddableGemSlots.includes(slotNumber) ||
          GemChecker.oneAddableGemSlot.includes(slotNumber)
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
  //#endregion UI
}

export default GemChecker;
