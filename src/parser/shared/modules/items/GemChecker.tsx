import type { JSX } from 'react';
import { Trans } from '@lingui/react/macro';
import ITEMS from 'common/ITEMS'; //This is the main item index for the Gem Lookup and ItemLinks
import Item, { CraftedItem } from 'common/ITEMS/Item'; //This is the Crafted Item that has the quality one items doesn't have
import { Item as EventItem, Gem as EventGem } from 'parser/core/Events'; //This is the event item which is different then the inventory items one.
import {
  eventItemGemSocketCount,
  eventItemHasGemSocket,
} from 'common/ITEMS/thewarwithin/socketBonusId';
import { ItemLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { GemBoxRowEntry } from 'interface/guide/components/Preparation/GemSubSection/GemBoxRow';
import { GEAR_SLOT_NAMES } from 'game/GEAR_SLOTS';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import {
  buildEventItemGemPlaceholders,
  maxSocketCountForGemmableSlotConfig,
} from 'common/ITEMS/gemsUtils';

/*
src\parser\retail\modules\items\GemChecker.tsx is the sister that implements the stub functions
*/

/**
 * Represents a potential upgrade that is available, but only as a randomized or time-gated upgrade.
 * This is currently used for gem upgrades in Retail on Helm/Belt/Bracers, which are available either as random procs or as an alternative reward from the Great Vault.
 */
export const TIME_GATED_UPGRADE = 'time-gated-upgrade' as const;
export type GemPerformance = QualitativePerformance | typeof TIME_GATED_UPGRADE;

/**
 * Configuration for a gemmable slot that can be added to an item.
 *
 * @property maxSockets - The maximum number of sockets that can be added to this slot.
 * @property timeGated - Indicates whether the ability to add sockets is restricted by time-gated mechanics.
 * @property socketingItemId - The ID of the item used to add a socket to this slot, if applicable.
 *                             If no such item exists, this will be `undefined`.
 * @remarks Please use the Items collection to get the socketedItemId.
 *
 */
export interface GemmableSlotConfig {
  maxSockets: number;
  timeGated: boolean;
  /**
   * The id of the item used to add a socket to this slot, if it exists.
   */
  socketingItemId: number | undefined;
}

class GemChecker extends Analyzer {
  get GemableSlots(): Record<number, GemmableSlotConfig> {
    return {};
  }

  get GemableGear(): Record<number, EventItem> {
    const gemSlots = this.GemableSlots;
    return Object.keys(gemSlots).reduce<Record<number, EventItem>>((obj, slot) => {
      const innerSlot = Number(slot);

      obj[innerSlot] = this.selectedCombatant._getGearItemBySlotId(innerSlot);

      return obj;
    }, {});
  }

  private maxSocketCount(slot: number, ignoreTimeGates = false): number {
    return maxSocketCountForGemmableSlotConfig(this.GemableSlots[slot], ignoreTimeGates);
  }

  hasTimeGatedSockets(slot: number): boolean {
    return this.GemableSlots[slot]?.timeGated;
  }

  missingGemCount(item: EventItem, slot: number) {
    const gemArrayLength: number = item.gems?.length ?? 0;
    const socketCount = eventItemGemSocketCount(item);
    const maxSockets = this.maxSocketCount(slot);

    return Math.max(0, Math.max(maxSockets, socketCount) - gemArrayLength);
  }

  isRecommendedGem(gem: Item): boolean {
    return false;
  }

  getGemPerformance(gem: Item): { perf: QualitativePerformance; explanation: JSX.Element } {
    throw new Error('unimplemented');
  }

  /**
   * Handle special-cased items like Cyrce's Circlet differently. The generic `GemChecker` won't cover those.
   */
  isSpecialItem(itemId: number): boolean {
    return false;
  }

  /**
   * Generate a performance description for a special item. For example: Cyrce's Circlet can flag missing gems as a fail, without grading usage of particular gems.
   */
  specialItemPerformance(item: EventItem): {
    perf: QualitativePerformance;
    explanation: JSX.Element | undefined;
  } {
    throw new Error('unimplemented');
  }

  //#region UI
  //Add a row for the actual Gem in the future to evaluate each
  boxRowPerformance(
    item: EventItem,
    slotNumber: number,
    slotName: JSX.Element,
    recommendedGems?: number[],
  ) {
    if (this.isSpecialItem(item.id)) {
      const { perf, explanation } = this.specialItemPerformance(item);
      return {
        equipmentPerformance: perf,
        gemRank:
          item.gems?.map((gem) => ({
            gemPerformance: QualitativePerformance.Good,
            gem,
          })) ?? [],
        tooltip: explanation ?? (
          <Trans id="shared.GemChecker.SpecialCase">
            <ItemLink id={item.id} /> is a special case. Please see your class guides for best
            usage.
          </Trans>
        ),
      };
    }

    let equipmentPerformance: GemPerformance = TIME_GATED_UPGRADE;
    const gemRank: {
      gemPerformance?: QualitativePerformance;
      gem: EventGem;
    }[] = [];
    const tooltipContent: JSX.Element[] = [];

    if (item.gems && item.gems.length > 0) {
      item.gems.forEach((iGem) => {
        const lookupGem = ITEMS[iGem.id] as CraftedItem | undefined;

        let tempQP = QualitativePerformance.Fail;
        // TODO: recommended gems bypass quality checks.
        const gemRec = recommendedGems?.includes(iGem.id);

        if (gemRec) {
          tempQP = QualitativePerformance.Perfect;
          tooltipContent.push(
            <>
              <PerformanceMark perf={tempQP} /> <ItemLink id={iGem.id} /> is a recommended gem
            </>,
          );
        } else if (lookupGem) {
          const { perf, explanation } = this.getGemPerformance(lookupGem);
          tempQP = perf;

          tooltipContent.push(
            <>
              <PerformanceMark perf={tempQP} /> {explanation}
            </>,
          );
        }

        gemRank.push({
          gemPerformance: tempQP,
          gem: iGem,
        });
      });

      equipmentPerformance = getLowestPerf(
        gemRank
          .map(({ gemPerformance }) => gemPerformance)
          .filter((v): v is QualitativePerformance => Boolean(v)),
      );
    }

    const missingGems = this.missingGemCount(item, slotNumber);

    if (missingGems > 0) {
      gemRank.push(...this.buildGemPlaceholders(item, slotNumber));
      const socketAdditionItemId = this.GemableSlots[slotNumber]?.socketingItemId;

      equipmentPerformance = QualitativePerformance.Fail;
      tooltipContent.push(
        <Trans id="shared.GemChecker.MissingSlotsCraftable">
          <div>
            You are missing {missingGems} possible gems on your {slotName}.
          </div>
          {socketAdditionItemId && (
            <div>
              You can use <ItemLink id={socketAdditionItemId} /> to add gem socket, up to a maximum
              of {this.maxSocketCount(slotNumber, true)}.
            </div>
          )}
        </Trans>,
      );
    } else if (this.hasTimeGatedSockets(slotNumber) && eventItemGemSocketCount(item) === 0) {
      gemRank.push(...this.buildGemPlaceholders(item, slotNumber));

      const socketAdditionItemId = this.GemableSlots[slotNumber]?.socketingItemId;

      equipmentPerformance = TIME_GATED_UPGRADE;
      tooltipContent.push(
        <Trans id="shared.GemChecker.MissingSlotsTimeGated">
          <div>You are missing possible gems on your {slotName}.</div>
          {socketAdditionItemId && this.explainTimeGate(socketAdditionItemId)}
        </Trans>,
      );
    }

    const tooltip = (
      <div>
        {tooltipContent.map((content, index) => (
          <div key={index}>{content}</div>
        ))}
      </div>
    );

    return { equipmentPerformance, gemRank, tooltip };
  }

  protected explainTimeGate(item: number): JSX.Element | null {
    return null;
  }

  buildGemPlaceholders(item: EventItem, slotNumber: number): { gem: EventGem }[] {
    return buildEventItemGemPlaceholders(item, this.GemableSlots[slotNumber]);
  }

  boxRowItemLink(item: EventItem, slotName: JSX.Element) {
    return (
      <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
        {slotName}
      </ItemLink>
    );
  }

  getGemBoxRowEntries(recommendedGems: number[] = []): GemBoxRowEntry[] {
    const gear = this.GemableGear;

    // Filter out items that cannot have gems
    return Object.keys(gear)
      .filter((slot) => {
        const slotNumber = Number(slot);
        const item = gear[slotNumber];
        return (
          // Check if the item has gems
          eventItemHasGemSocket(item) ||
          this.maxSocketCount(slotNumber, true) > 0 ||
          (item.gems && item.gems.length > 0)
        );
      })
      .map<GemBoxRowEntry>((slot) => {
        const slotNumber = Number(slot);
        const item = gear[slotNumber];
        const slotName = GEAR_SLOT_NAMES[slotNumber];

        // Use boxRowPerformance to calculate the value
        const performance = this.boxRowPerformance(item, slotNumber, slotName, recommendedGems);

        return {
          item,
          slotName: this.boxRowItemLink(item, slotName),
          value: {
            itemQP: performance?.equipmentPerformance ?? QualitativePerformance.Fail,
            gems: (performance?.gemRank ?? []).map((gem) => ({
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
