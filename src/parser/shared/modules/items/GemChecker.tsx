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
import { EquipmentPerformance } from 'parser/ui/EquipmentPerformance';
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
    let equipmentPerformance = EquipmentPerformance.Potential;
    if (hasMaxGem) {
      equipmentPerformance = EquipmentPerformance.Good;
    }

    let allRecommendedGem = true;
    const gemRank: { equipmentPerformance: EquipmentPerformance; gem: EventGem }[] = [];

    if ((item.gems ?? []).length > 0) {
      item.gems!.forEach((iGem) => {
        const lookupGem = ITEMS[iGem.id] as CraftedItem | undefined;

        let tempQP = EquipmentPerformance.Potential;
        const gemRec = recommendedGems?.includes(iGem.id);

        if (gemRec) {
          tempQP = EquipmentPerformance.Perfect;
        } else {
          allRecommendedGem = false;
          switch (lookupGem?.craftQuality) {
            case 3:
              tempQP = EquipmentPerformance.Good;
              break;
            case 2:
              tempQP = EquipmentPerformance.Good;
              break;
            case 1:
              tempQP = EquipmentPerformance.Ok;
              break;
            case undefined: //In Futuer Consider Item Level when there isn't a lookup return.
              tempQP = EquipmentPerformance.Ok;
              break;
            default:
              tempQP = EquipmentPerformance.Fail; //Should never get here
              break;
          }
        }

        gemRank.push({
          equipmentPerformance: tempQP,
          gem: iGem,
        });

        if (hasMaxGem && allRecommendedGem) {
          equipmentPerformance = EquipmentPerformance.Perfect;
        } else if (hasMaxGem && !allRecommendedGem) {
          equipmentPerformance = EquipmentPerformance.Good;
        } else if (!hasMaxGem) {
          equipmentPerformance = EquipmentPerformance.Ok;
        } else {
          equipmentPerformance = tempQP;
        }
      });
    }

    return { equipmentPerformance, gemRank };
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
    const gemArrayLength = item.gems?.length ?? 0;

    //Note for Future me: <Trans id="..."> the text comes from locales/<Locale Code>/messages.json

    //#region Special Cases
    if (item.id === ITEMS.CYRCES_CIRCLET.id) {
      return (
        <Trans id="shared.GemChecker.CyrceSpecialCase">
          Cyrce's Circlet is a special case. Please see your class guides for best usage.
        </Trans>
      );
    }

    //Not Gemable (This is more a safety check in case we make it here and the original filter didn't work.)
    if (
      item.bonusIDs === undefined &&
      !hasBonusId(item, SINGLE_GEM_BONUS_ID) &&
      !hasBonusId(item, DOUBLE_GEM_BONUS_ID) &&
      !hasBonusId(item, TRIPLE_GEM_BONUS_ID) &&
      !GemChecker.twoAddableGemSlots.includes(slotNumber) &&
      !GemChecker.oneAddableGemSlot.includes(slotNumber) &&
      item.gems?.length === 0
    ) {
      return <Trans id="shared.GemChecker.NotGemable">Your {slotName} cannot take a gem.</Trans>;
    }
    //#endregion

    // computing `maxGems` could be replaced with a method
    let maxGems = 0;

    if (hasBonusId(item, TRIPLE_GEM_BONUS_ID)) {
      maxGems = 3;
    } else if (hasBonusId(item, DOUBLE_GEM_BONUS_ID)) {
      maxGems = 2;
    } else if (hasBonusId(item, SINGLE_GEM_BONUS_ID)) {
      maxGems = 1;
    }

    const missingGems = maxGems - gemArrayLength;

    if (missingGems > 0) {
      tooltipContent.push(
        <Trans id="shared.GemChecker.MissingGemsMultiple">
          You are missing {missingGems} gems on your {slotName}.
        </Trans>,
      );
    } else if (gemArrayLength > 0) {
      tooltipContent.push(
        <Trans id="shared.GemChecker.guide.FullyGemmed">
          {slotName} sockets are fully gemmed!
        </Trans>,
      );
    }

    //X Missing Socket
    if (GemChecker.twoAddableGemSlots.includes(slotNumber)) {
      const missingGems = 2 - gemArrayLength;
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
        );
      }
    } else if (GemChecker.oneAddableGemSlot.includes(slotNumber)) {
      if (gemArrayLength !== 1) {
        //id="shared.GemChecker.MissingSlotsVault"
        tooltipContent.push(
          <Trans>
            You do not have a gem socket on your {slotName}. If you don't have good items in your
            Vault, you can get <ItemLink id={ITEMS.ALGARI_TOKEN_OF_MERIT.id} /> instead and trade 6
            of them for <ItemLink id={ITEMS.SAD_SOCKET_ADDING_DEVICE.id} /> at the nearby vendor to
            add a gem socket.
          </Trans>,
        );
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
            itemQP: performance?.equipmentPerformance ?? EquipmentPerformance.Fail,
            gems: (performance?.gemRank ?? []).map((gem) => ({
              gemQP: gem.equipmentPerformance,
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
