import type { JSX } from 'react';
import ITEMS from 'common/ITEMS';
import Item, { CraftedItem } from 'common/ITEMS/Item';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import ItemLink from 'interface/ItemLink';
import { Item as EventItem } from 'parser/core/Events';
import BaseGemChecker, { GemmableSlotConfig } from 'parser/shared/modules/items/GemChecker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const retailJewelrySlots: GemmableSlotConfig = {
  maxSockets: 2,
  timeGated: false,
  socketingItemId: ITEMS.MAGNIFICENT_JEWELERS_SETTING.id,
};

const retailBodySlots: GemmableSlotConfig = {
  maxSockets: 1,
  timeGated: true,
  socketingItemId: ITEMS.TECHNOMANCERS_GIFT.id,
};

const MAX_QUALITY = 3;

class GemChecker extends BaseGemChecker {
  private static retailGemSlots = {
    [GEAR_SLOTS.NECK]: retailJewelrySlots,
    [GEAR_SLOTS.FINGER1]: retailJewelrySlots,
    [GEAR_SLOTS.FINGER2]: retailJewelrySlots,
    [GEAR_SLOTS.HEAD]: retailBodySlots,
    [GEAR_SLOTS.WRISTS]: retailBodySlots,
    [GEAR_SLOTS.WAIST]: retailBodySlots,
  };

  get GemableSlots(): Record<number, GemmableSlotConfig> {
    return GemChecker.retailGemSlots;
  }

  getGemPerformance(gem: Item | CraftedItem): {
    perf: QualitativePerformance;
    explanation: JSX.Element;
  } {
    if ('craftQuality' in gem) {
      // this is at least a crafted gem
      return gem.craftQuality === MAX_QUALITY
        ? {
            perf: QualitativePerformance.Good,
            explanation: (
              <>
                <ItemLink id={gem.id} quality={gem.craftQuality} /> is a max-quality gem
              </>
            ),
          }
        : {
            perf: QualitativePerformance.Ok,
            explanation: (
              <>
                <ItemLink id={gem.id} quality={gem.craftQuality} /> is not a max-quality gem
              </>
            ),
          };
    }

    // no quality means this is an old-expansion gem or a special-cased gem.
    return {
      perf: QualitativePerformance.Fail,
      explanation: (
        <>
          <ItemLink id={gem.id} /> does not have a crafting quality and may be a previous-expansion
          gem
        </>
      ),
    };
  }

  isSpecialItem(itemId: number): boolean {
    return itemId === ITEMS.CYRCES_CIRCLET.id;
  }

  specialItemPerformance(item: EventItem): {
    perf: QualitativePerformance;
    explanation: JSX.Element | undefined;
  } {
    if (item.id === ITEMS.CYRCES_CIRCLET.id) {
      const hasGems = item.gems && item.gems.length === 3;
      return {
        perf: hasGems ? QualitativePerformance.Good : QualitativePerformance.Fail,
        explanation: !hasGems ? (
          <>
            <ItemLink id={item.id} /> is missing one or more gems.
          </>
        ) : undefined,
      };
    }

    return super.specialItemPerformance(item);
  }

  protected explainTimeGate(item: number): JSX.Element | null {
    if (item === ITEMS.SAD_SOCKET_ADDING_DEVICE.id) {
      return (
        <>
          If you don't have good items in your Vault, you can get{' '}
          <ItemLink id={ITEMS.ALGARI_TOKEN_OF_MERIT.id} /> instead (one per available Vault choice)
          and trade 6 for <ItemLink id={item} /> at the nearby vendor to add a gem socket.
        </>
      );
    }

    return null;
  }
}

export default GemChecker;
