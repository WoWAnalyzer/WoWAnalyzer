import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import Haste from 'parser/shared/modules/Haste';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';

const BUGGED_SWIFTMEND_BONUS_MULTIPLIER = 0.4;

const HOT_ID_CONSUME_ORDER = [
  SPELLS.REGROWTH.id,
  SPELLS.WILD_GROWTH.id,
  SPELLS.REJUVENATION.id,
  SPELLS.REJUVENATION_GERMINATION.id,
];
const SWIFTMEND_CONSUMABLE_HOTS = [
  SPELLS.REGROWTH,
  SPELLS.WILD_GROWTH,
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
];
const SWIFTMEND_CONSUMABLE_HOT_IDS = new Set(HOT_ID_CONSUME_ORDER);

/**
 * **Verdant Infusion**
 * Spec Talent Tier 3
 *
 * Swiftmend no longer consumes a heal over time effect.
 *
 * Value is estimated at Swiftmend cast time (remaining duration * last tick):
 * - Preserved: the one HoT Swiftmend would have consumed.
 * - 40% bug (incremental): +40% of remaining on other swiftmendable HoTs. The consumed
 *   HoT's 40% exists with or without VI, so it's left out.
 * Neither path uses HotTracker (it clears on refreshbuff).
 */
class VerdantInfusion extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    combatants: Combatants,
    haste: Haste,
  };

  hotTracker!: HotTrackerRestoDruid;
  combatants!: Combatants;
  haste!: Haste;

  /** Cast-time remaining of the one HoT Swiftmend would have consumed */
  preservedHotHealing = 0;
  /** Extra Swiftmend healing from 40% × remaining of swiftmendable HoTs other than the consumed one */
  buggedSwiftmendExtraBonusHealing = 0;
  /** Times each HoT was the one that would have been consumed (preserve breakdown) */
  perHotPreservedCounts: Map<number, number> = new Map<number, number>();
  /** Sum of *extra* (non-consumed) swiftmendable HoTs present at each Swiftmend cast (for bug avg) */
  totalBugHotPresence = 0;
  /** Last seen raw tick amount per target+HoT, used to estimate remaining HoT healing */
  private lastHotTickAmount: Map<string, number> = new Map();
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANT_INFUSION_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmend,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SWIFTMEND_CONSUMABLE_HOTS),
      this.onConsumableHotHeal,
    );
  }

  onConsumableHotHeal(event: HealEvent) {
    if (!event.tick) {
      return;
    }
    const raw = event.amount + (event.absorbed || 0) + (event.overheal || 0);
    this.lastHotTickAmount.set(`${event.targetID}-${event.ability.guid}`, raw);
  }

  onSwiftmend(event: CastEvent) {
    this.casts += 1;
    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }
    const hotsOn = this.hotTracker.hots[target.id];
    if (!hotsOn) {
      return;
    }
    const hotIdsOn: number[] = Object.keys(hotsOn).map((hotId) => Number(hotId));

    const hotIdThatWouldHaveBeenRemoved: number | undefined = HOT_ID_CONSUME_ORDER.find((hotId) =>
      hotIdsOn.includes(hotId),
    );

    if (hotIdThatWouldHaveBeenRemoved === undefined) {
      return;
    }

    // Preserve only the one HoT consumption would have removed — cast-time remaining only.
    this.preservedHotHealing += this.estimateRemainingHotHealing(
      event,
      target.id,
      hotIdThatWouldHaveBeenRemoved,
    );
    this.perHotPreservedCounts.set(
      hotIdThatWouldHaveBeenRemoved,
      (this.perHotPreservedCounts.get(hotIdThatWouldHaveBeenRemoved) ?? 0) + 1,
    );

    // Live bug: Swiftmend also gets +40% of EVERY active swiftmendable HoT's remaining.
    // Without VI you already get +40% of the one consumed HoT — only the *extra* HoTs are
    // incremental VI value (Policy A).
    let remainingHealingFromExtraBugHots = 0;
    let bugHotsThisCast = 0;
    hotIdsOn.forEach((hotId) => {
      if (!SWIFTMEND_CONSUMABLE_HOT_IDS.has(hotId)) {
        return;
      }
      if (hotId === hotIdThatWouldHaveBeenRemoved) {
        return;
      }
      bugHotsThisCast += 1;
      remainingHealingFromExtraBugHots += this.estimateRemainingHotHealing(event, target.id, hotId);
    });
    this.totalBugHotPresence += bugHotsThisCast;
    this.buggedSwiftmendExtraBonusHealing +=
      remainingHealingFromExtraBugHots * BUGGED_SWIFTMEND_BONUS_MULTIPLIER;
  }

  /**
   * Estimate remaining healing on a HoT from duration left × last observed tick size.
   * Same approach as Swiftmend's consumed-HoT bonus estimate (without the 40% multiplier).
   */
  private estimateRemainingHotHealing(event: CastEvent, targetId: number, spellId: number): number {
    const hot = this.hotTracker.hots[targetId]?.[spellId];
    const lastTick = this.lastHotTickAmount.get(`${targetId}-${spellId}`);
    const hotInfo = this.hotTracker.hotInfo[spellId];
    if (!hot || !lastTick || !hotInfo) {
      return 0;
    }

    const remainingMs = Math.max(0, hot.end - event.timestamp);
    const baseTickPeriod = hotInfo.tickPeriod;
    const tickPeriod = hotInfo.noHaste ? baseTickPeriod : baseTickPeriod / (1 + this.haste.current);
    if (tickPeriod <= 0) {
      return 0;
    }

    return (remainingMs / tickPeriod) * lastTick;
  }

  get totalEstimatedHealing() {
    // Preserved = HoT ticks that continue; bug = extra on the Swiftmend heal. Distinct healing.
    return this.preservedHotHealing + this.buggedSwiftmendExtraBonusHealing;
  }

  get avgHotsContributingToBugPerCast() {
    if (this.casts === 0) {
      return 0;
    }
    return this.totalBugHotPresence / this.casts;
  }

  private get preservedHotBreakdown() {
    return [...this.perHotPreservedCounts.entries()]
      .sort(([, a], [, b]) => b - a)
      .map(([spellId, count], index, entries) => (
        <span key={spellId}>
          <SpellLink spell={spellId} /> {count}
          {index < entries.length - 1 ? ', ' : ''}
        </span>
      ));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Preserved = cast-time remaining of the <em>one</em> HoT Swiftmend would have consumed.
            40% bug (incremental) = +40% of remaining on other active swiftmendable HoTs (the
            consumed HoT&apos;s 40% is excluded, since it applies with or without VI).
            <ul>
              <li>
                Preserved HoT healing: <strong>{formatNumber(this.preservedHotHealing)}</strong>
              </li>
              <li>
                Extra healing from the 40% bug:{' '}
                <strong>{formatNumber(this.buggedSwiftmendExtraBonusHealing)}</strong>
              </li>
              <li>
                Avg extra HoTs contributing to the 40% bug:{' '}
                <strong>{this.avgHotsContributingToBugPerCast.toFixed(1)}</strong>
              </li>
            </ul>
            {this.perHotPreservedCounts.size > 0 && (
              <>HoT preserved (times): {this.preservedHotBreakdown}</>
            )}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.VERDANT_INFUSION_TALENT}>
          <ItemPercentHealingDone amount={this.totalEstimatedHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VerdantInfusion;
