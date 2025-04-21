import { Trans } from '@lingui/react/macro';
import ITEMS from 'common/ITEMS'; //This is the main item index for the Gem Lookup and ItemLinks
import { CraftedItem } from 'common/ITEMS/Item'; //This is the Crafted Item that has the quality one items doesn't have
import { Item as EventItem, Gem as EventGem } from 'parser/core/Events'; //This is the event item which is different then the inventory items one.
import {
  eventItemGemSocketCount,
  eventItemHasGemSocket,
} from 'common/ITEMS/thewarwithin/socketBonusId';
import { ItemLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { GemBoxRowEntry } from 'interface/guide/components/Preparation/GemSubSection/GemBoxRow';
import { EquipmentPerformance } from 'parser/ui/EquipmentPerformance';
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

  missingGemCount(item: EventItem, slot: number) {
    const gemArrayLength: number = item.gems?.length ?? 0;
    const socketCount = eventItemGemSocketCount(item);

    if (gemArrayLength > socketCount) {
      return 0;
    } else if (GemChecker.twoAddableGemSlots.includes(slot) && socketCount < 2) {
      return 2 - gemArrayLength;
    } else if (GemChecker.oneAddableGemSlot.includes(slot) && socketCount < 1) {
      return 1 - gemArrayLength;
    } else {
      return socketCount - gemArrayLength;
    }
  }

  //#region UI
  //Add a row for the actual Gem in the future to evaluate each
  boxRowPerformance(
    item: EventItem,
    recommendedGems: number[] | undefined,
    slotNumber: number,
    slotName: JSX.Element,
  ) {
    let equipmentPerformance = EquipmentPerformance.Potential; //Every Item starts with Potential
    const gemRank: { gemPerformance: EquipmentPerformance; gem: EventGem }[] = [];
    const tooltipContent: JSX.Element[] = [];
    const gemArrayLength = item.gems?.length ?? 0;
    let tooltip: JSX.Element;

    //Something made it that shouldn't.  Throw a filter here for those without gem or gem potential
    if (
      (item.bonusIDs === undefined && gemArrayLength === 0) ||
      (!eventItemHasGemSocket(item) &&
        !GemChecker.twoAddableGemSlots.includes(slotNumber) &&
        !GemChecker.oneAddableGemSlot.includes(slotNumber) &&
        gemArrayLength === 0)
    ) {
      tooltip = <Trans id="shared.GemChecker.NotGemable">Your {slotName} cannot take a gem.</Trans>;
      return { equipmentPerformance, gemRank, tooltip };
    }

    let allRecommendedGem = true;

    if (gemArrayLength > 0) {
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
            case 2: //Talking with the maintainers, gems are considered cheap enough that really should be quality 3
              tempQP = EquipmentPerformance.Ok;
              break;
            case 1:
              tempQP = EquipmentPerformance.Ok;
              break;
            case undefined: //Current Consensus is that if the gem isn't found it should fail.
              tempQP = EquipmentPerformance.Fail;
              break;
            default:
              tempQP = EquipmentPerformance.Fail; //Should never get here
              break;
          }
        }

        gemRank.push({
          gemPerformance: tempQP,
          gem: iGem,
        });
      });
    }

    const magnificentJewelersSetting: EventGem = {
      id: ITEMS.MAGNIFICENT_JEWELERS_SETTING.id,
      icon: ITEMS.MAGNIFICENT_JEWELERS_SETTING.icon,
      itemLevel: 642, //Minimum unique Season 2 level
    };

    const socketAddingDevice: EventGem = {
      id: ITEMS.SAD_SOCKET_ADDING_DEVICE.id,
      icon: ITEMS.SAD_SOCKET_ADDING_DEVICE.icon,
      itemLevel: 642, //Minimum unique Season 2 level
    };

    const missingGems = this.missingGemCount(item, slotNumber);

    if (missingGems === 0 && allRecommendedGem) {
      equipmentPerformance = EquipmentPerformance.Perfect;
      tooltipContent.push(
        <Trans id="shared.GemChecker.guide.FullyGemmedRecommended">
          {slotName} sockets are fully gemmed with recommended gems!
        </Trans>,
      );
    } else if (missingGems === 0 && !allRecommendedGem) {
      equipmentPerformance = EquipmentPerformance.Good;
      tooltipContent.push(
        <Trans id="shared.GemChecker.guide.FullyGemmed">
          {slotName} sockets are fully gemmed!
        </Trans>,
      );
    } else if (!(missingGems === 0) && item.id !== ITEMS.CYRCES_CIRCLET.id) {
      equipmentPerformance = EquipmentPerformance.Ok;

      if (GemChecker.twoAddableGemSlots.includes(slotNumber) && missingGems <= 2) {
        gemRank.push({
          gemPerformance: EquipmentPerformance.Potential,
          gem: magnificentJewelersSetting,
        });
        if (missingGems === 1) {
          equipmentPerformance = EquipmentPerformance.Ok;
        } else {
          gemRank.push({
            gemPerformance: EquipmentPerformance.Potential,
            gem: magnificentJewelersSetting,
          });
          equipmentPerformance = EquipmentPerformance.Potential;
        }

        tooltipContent.push(
          <Trans id="shared.GemChecker.MissingSlotsCraftable">
            <div>
              You are missing {missingGems} possible gem socket on your {slotName}.
            </div>
            <div>
              Craft/Buy <ItemLink id={magnificentJewelersSetting.id} /> to add a gem socket.
            </div>
          </Trans>,
        );
      } else if (GemChecker.oneAddableGemSlot.includes(slotNumber) && missingGems === 1) {
        equipmentPerformance = EquipmentPerformance.Potential;
        gemRank.push({
          gemPerformance: EquipmentPerformance.Potential,
          gem: socketAddingDevice,
        });
        tooltipContent.push(
          <Trans id="shared.GemChecker.MissingSlotsVault">
            You do not have a gem socket on your {slotName}. If you don't have good items in your
            Vault, you can get <ItemLink id={ITEMS.ALGARI_TOKEN_OF_MERIT.id} /> instead and trade 6
            of them for <ItemLink id={socketAddingDevice.id} /> at the nearby vendor to add a gem
            socket.
          </Trans>,
        );
      } else {
        for (let i = 0; i < missingGems; i = i + 1) {
          gemRank.push({
            gemPerformance: EquipmentPerformance.Fail,
            gem: {
              id: 0,
              icon: 'equipment_empty_gem_socket',
              itemLevel: 0,
            },
          });
        }
      }
    }

    //#region Special Cases
    if (item.id === ITEMS.CYRCES_CIRCLET.id) {
      if (missingGems === 0) {
        //For some reason Cyrces is not showing gems
        equipmentPerformance = EquipmentPerformance.Good;
      } else {
        equipmentPerformance = EquipmentPerformance.Fail;
      }

      //Set all of the gems to good for Cyrces Circlet as it's such a special case
      gemRank.forEach((gem) => {
        gem.gemPerformance = EquipmentPerformance.Good;
      });

      tooltip = (
        <Trans id="shared.GemChecker.CyrceSpecialCase">
          Cyrce's Circlet is a special case. Please see your class guides for best usage.
        </Trans>
      );
    } else {
      tooltip = (
        <div>
          {tooltipContent.map((content, index) => (
            <div key={index}>{content}</div>
          ))}
        </div>
      );
    }

    return { equipmentPerformance, gemRank, tooltip };
  }

  boxRowItemLink(item: EventItem, slotName: JSX.Element) {
    return (
      <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
        {slotName}
      </ItemLink>
    );
  }

  getGemBoxRowEntries(recommendedGems: Record<number, CraftedItem[]> = {}): GemBoxRowEntry[] {
    const gear = this.GemableGear;
    const gemSlots: { [key: number]: JSX.Element } = this.GemableSlots;

    // Filter out items that cannot have gems
    return Object.keys(gear)
      .filter((slot) => {
        const slotNumber = Number(slot);
        const item = gear[slotNumber];
        return (
          eventItemHasGemSocket(item) ||
          GemChecker.twoAddableGemSlots.includes(slotNumber) ||
          GemChecker.oneAddableGemSlot.includes(slotNumber) ||
          (item.gems && item.gems.length > 0) // Check if the item has gems
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
          slotName,
        );

        return {
          item,
          slotName: this.boxRowItemLink(item, slotName),
          value: {
            itemQP: performance?.equipmentPerformance ?? EquipmentPerformance.Fail,
            gems: (performance?.gemRank ?? []).map((gem) => ({
              gemQP: gem.gemPerformance,
              gem: gem.gem,
            })),
          },
          tooltip: performance?.tooltip,
        };
      });
  }
  //#endregion UI
}

export default GemChecker;
