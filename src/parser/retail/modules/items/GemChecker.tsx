import type { JSX } from 'react';
import ITEMS from 'common/ITEMS';
import Item, { CraftedItem } from 'common/ITEMS/Item';
import GEMS from 'common/ITEMS/midnight/gems';
import ItemLink from 'interface/ItemLink';
import { Item as EventItem } from 'parser/core/Events';
import BaseGemChecker, { GemmableSlotConfig } from 'parser/shared/modules/items/GemChecker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const retailJewelrySlots: GemmableSlotConfig = {
  maxSockets: 1,
  timeGated: false,
  socketingItemId: undefined,
};

const retailBodySlots: GemmableSlotConfig = {
  maxSockets: 1,
  timeGated: true,
  socketingItemId: ITEMS.RADIANT_JEWELBINDER.id,
};

const MAX_QUALITY = 2;

const PVE_GEM_IDS: number[] = [
  GEMS.INDECIPHERABLE_EVERSONG_DIAMOND_R1.id,
  GEMS.INDECIPHERABLE_EVERSONG_DIAMOND_R2.id,
  GEMS.POWERFUL_EVERSONG_DIAMOND_R1.id,
  GEMS.POWERFUL_EVERSONG_DIAMOND_R2.id,
  GEMS.STOIC_EVERSONG_DIAMOND_R1.id,
  GEMS.STOIC_EVERSONG_DIAMOND_R2.id,
  GEMS.TELLURIC_EVERSONG_DIAMOND_R1.id,
  GEMS.TELLURIC_EVERSONG_DIAMOND_R2.id,

  GEMS.DEADLY_LAPIS_R1.id,
  GEMS.DEADLY_LAPIS_R2.id,
  GEMS.FLAWLESS_DEADLY_LAPIS_R1.id,
  GEMS.FLAWLESS_DEADLY_LAPIS_R2.id,
  GEMS.FLAWLESS_MASTERFUL_LAPIS_R1.id,
  GEMS.FLAWLESS_MASTERFUL_LAPIS_R2.id,
  GEMS.FLAWLESS_QUICK_LAPIS_R1.id,
  GEMS.FLAWLESS_QUICK_LAPIS_R2.id,
  GEMS.FLAWLESS_VERSATILE_LAPIS_R1.id,
  GEMS.FLAWLESS_VERSATILE_LAPIS_R2.id,
  GEMS.MASTERFUL_LAPIS_R1.id,
  GEMS.MASTERFUL_LAPIS_R2.id,
  GEMS.QUICK_LAPIS_R1.id,
  GEMS.QUICK_LAPIS_R2.id,
  GEMS.VERSATILE_LAPIS_R1.id,
  GEMS.VERSATILE_LAPIS_R2.id,

  GEMS.DEADLY_PERIDOT_R1.id,
  GEMS.DEADLY_PERIDOT_R2.id,
  GEMS.FLAWLESS_DEADLY_PERIDOT_R1.id,
  GEMS.FLAWLESS_DEADLY_PERIDOT_R2.id,
  GEMS.FLAWLESS_MASTERFUL_PERIDOT_R1.id,
  GEMS.FLAWLESS_MASTERFUL_PERIDOT_R2.id,
  GEMS.FLAWLESS_QUICK_PERIDOT_R1.id,
  GEMS.FLAWLESS_QUICK_PERIDOT_R2.id,
  GEMS.FLAWLESS_VERSATILE_PERIDOT_R1.id,
  GEMS.FLAWLESS_VERSATILE_PERIDOT_R2.id,
  GEMS.MASTERFUL_PERIDOT_R1.id,
  GEMS.MASTERFUL_PERIDOT_R2.id,
  GEMS.QUICK_PERIDOT_R1.id,
  GEMS.QUICK_PERIDOT_R2.id,
  GEMS.VERSATILE_PERIDOT_R1.id,
  GEMS.VERSATILE_PERIDOT_R2.id,

  GEMS.DEADLY_GARNET_R1.id,
  GEMS.DEADLY_GARNET_R2.id,
  GEMS.FLAWLESS_DEADLY_GARNET_R1.id,
  GEMS.FLAWLESS_DEADLY_GARNET_R2.id,
  GEMS.FLAWLESS_MASTERFUL_GARNET_R1.id,
  GEMS.FLAWLESS_MASTERFUL_GARNET_R2.id,
  GEMS.FLAWLESS_QUICK_GARNET_R1.id,
  GEMS.FLAWLESS_QUICK_GARNET_R2.id,
  GEMS.FLAWLESS_VERSATILE_GARNET_R1.id,
  GEMS.FLAWLESS_VERSATILE_GARNET_R2.id,
  GEMS.MASTERFUL_GARNET_R1.id,
  GEMS.MASTERFUL_GARNET_R2.id,
  GEMS.QUICK_GARNET_R1.id,
  GEMS.QUICK_GARNET_R2.id,
  GEMS.VERSATILE_GARNET_R1.id,
  GEMS.VERSATILE_GARNET_R2.id,

  GEMS.DEADLY_AMETHYST_R1.id,
  GEMS.DEADLY_AMETHYST_R2.id,
  GEMS.FLAWLESS_DEADLY_AMETHYST_R1.id,
  GEMS.FLAWLESS_DEADLY_AMETHYST_R2.id,
  GEMS.FLAWLESS_MASTERFUL_AMETHYST_R1.id,
  GEMS.FLAWLESS_MASTERFUL_AMETHYST_R2.id,
  GEMS.FLAWLESS_QUICK_AMETHYST_R1.id,
  GEMS.FLAWLESS_QUICK_AMETHYST_R2.id,
  GEMS.FLAWLESS_VERSATILE_AMETHYST_R1.id,
  GEMS.FLAWLESS_VERSATILE_AMETHYST_R2.id,
  GEMS.MASTERFUL_AMETHYST_R1.id,
  GEMS.MASTERFUL_AMETHYST_R2.id,
  GEMS.QUICK_AMETHYST_R1.id,
  GEMS.QUICK_AMETHYST_R2.id,
  GEMS.VERSATILE_AMETHYST_R1.id,
  GEMS.VERSATILE_AMETHYST_R2.id,
];

class GemChecker extends BaseGemChecker {
  private static retailGemSlots = {
    HEAD: retailBodySlots,
    NECK: retailJewelrySlots,
    WRISTS: retailBodySlots,
    WAIST: retailBodySlots,
    FINGER1: retailJewelrySlots,
    FINGER2: retailJewelrySlots,
  } as const;

  get GemableSlots() {
    return GemChecker.retailGemSlots;
  }

  getGemPerformance(gem: Item | CraftedItem): {
    perf: QualitativePerformance;
    explanation: JSX.Element;
  } {
    if (!('craftQuality' in gem)) {
      // no quality means this is an old-expansion gem or a special-cased gem.
      return {
        perf: QualitativePerformance.Fail,
        explanation: (
          <>
            <ItemLink id={gem.id} /> does not have a crafting quality and may be a
            previous-expansion gem
          </>
        ),
      };
    }

    if (!PVE_GEM_IDS.includes(gem.id)) {
      // If it is not listed, it is likely to be a previous expension gem.
      return {
        perf: QualitativePerformance.Fail,
        explanation: (
          <>
            <ItemLink id={gem.id} /> may be a previous-expansion gem
          </>
        ),
      };
    }

    if (gem.craftQuality !== MAX_QUALITY) {
      // this is at least a crafted gem
      return {
        perf: QualitativePerformance.Ok,
        explanation: (
          <>
            <ItemLink id={gem.id} quality={gem.craftQuality} /> is not a max-quality gem
          </>
        ),
      };
    }

    return {
      perf: QualitativePerformance.Good,
      explanation: (
        <>
          <ItemLink id={gem.id} quality={gem.craftQuality} /> is a max-quality gem
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
