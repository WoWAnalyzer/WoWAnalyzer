import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  AnyEvent,
  DamageEvent,
  DeathEvent,
  EventType,
} from 'parser/core/Events';
import SPELLS from '../../spell-list_Monk_Brewmaster.retail';
import SPELLS_COMMON from 'common/SPELLS';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { BadColor, GoodColor, PerfectColor } from 'interface/guide';
import { formatPercentage } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import StateHistory from 'parser/core/StateHistory';

const UNKNOWN_SPELL = Number.MIN_SAFE_INTEGER;
const STAGGER_QUICK_DRAIN_MS = 3000;
const STAGGER_TICK_INTERVAL_MS = 500;

/**
 * An indidivual point in the stagger pool, tracking the per-ability breakdown of stagger sources.
 */
class StaggerPoint {
  /**
   * the amount of damage in the pool for each damaging ability
   */
  readonly amountPerAbility: Map<number, number>;
  readonly timestamp: number;
  readonly remainingTicks: number;

  private _total?: number;

  private constructor(
    timestamp: number,
    remainingTicks: number,
    amountPerAbility: StaggerPoint['amountPerAbility'],
  ) {
    this.timestamp = timestamp;
    this.amountPerAbility = amountPerAbility;
    this.remainingTicks = remainingTicks;
  }

  get total(): number {
    if (this._total === undefined) {
      this._total = this.amountPerAbility.values().reduce((total, value) => total + value, 0);
    }
    return this._total;
  }

  add(timestamp: number, abilityId: number, amount: number, remainingTicks: number): StaggerPoint {
    const newAmounts = new Map(this.amountPerAbility);
    newAmounts.set(abilityId, (newAmounts.get(abilityId) ?? 0) + amount);

    return new StaggerPoint(timestamp, remainingTicks, newAmounts);
  }

  /**
   * Produce a new point with the per-ability amounts scaled to sum to `amount`.
   *
   * Used for self-correction on ticks.
   */
  scale(timestamp: number, amount: number, remainingTicks: number): StaggerPoint {
    const total = this.total;
    if (this.total === 0) {
      return new StaggerPoint(timestamp, remainingTicks, new Map(this.amountPerAbility));
    }
    const ratio = amount / total;

    const newAmounts = new Map();
    for (const [abilityId, pooledAmount] of this.amountPerAbility.entries()) {
      newAmounts.set(abilityId, pooledAmount * ratio);
    }

    return new StaggerPoint(timestamp, remainingTicks, newAmounts);
  }

  static empty(timestamp: number, remainingTicks: number): StaggerPoint {
    return new StaggerPoint(timestamp, remainingTicks, new Map());
  }
}

const { normalizer: StaggerPreventedLinkNormalizer, linkHelper: staggerPreventedLink } =
  EventLinkNormalizer.build({
    linkRelation: 'stagger-prevented',
    reverseLinkRelation: 'stagger-prevented',
    linkingEventId: null,
    linkingEventType: EventType.StaggerPrevented,
    referencedEventId: SPELLS.STAGGER_TALENT.id,
    referencedEventType: EventType.Absorbed,
    forwardBufferMs: 100,
    anySource: false,
    anyTarget: true, // StaggerPrevented has no target
    maximumLinks: 1,
  });

export { StaggerPreventedLinkNormalizer };

const ENABLE_DEBUG_ANN = false;

/**
 * Tracker for the stagger pool.
 *
 * There have been multiple iterations of stagger pool tracking. *In theory*, you can
 * simply sum up absorbs + ticks + purifies to maintain the pool state. In practice,
 * there are enough incidental sources of purification that this is very hard.
 *
 * There are two stagger-related events that *should* help, but due to logging quirks
 * they aren't consistent enough for properly maintaining based on the running total.
 *
 * ## Implementation
 *
 * We use 4 events to track pool state:
 *
 * - Absorb events are used to track per-ability pool ratios.
 * - `staggerprevented` events are used to modify the absorb amounts. In particular: if an absorb would
 *   not add any damage to the pool after prevention is applied, the `remainingTicks` count *should not reset*.
 * - Tick events are treated as the true value of the pool, and are used to continuously
 *   rescale the pool. After a tick, the pool always has `remainingTicks * tickAmount` damage in it.
 * - Death events reset the pool to empty.
 *
 * Additionally, this uses the `unmitigatedAmount` on stagger ticks to track removals. This handles Niuzao's
 * Stagger redirection effect. Some tick events do not have amounts (due to immunity, typically). In this case,
 * we estimate the tick as `poolSize / remainingTicks` and apply it. The pool will be rebalanced once we have the
 * next tick with an amount.
 *
 * ## Known Issues
 *
 * These are game issues, not issues with the analyzer. As of this writing, I've worked around all of them.
 *
 * - Some `staggerclear` events report per-tick reduction, others report total pool reduction.
 * - `staggerclear` events may log immediately before a tick. When they do, the per-tick reduction may need to be calculated *after* that tick.
 * - `staggerprevented` for Mantra of Purity does not log if the prevention shield has remaining absorb.
 * - While Niuzao is active, the player sometimes takes slightly too little (~3%) damage from Stagger ticks.
 */
export default class StaggerPool extends Analyzer {
  private readonly poolData: StaggerPoint[] = [];
  public readonly pool: StateHistory<StaggerPoint> = new StateHistory(this.poolData);
  public readonly totalDamageByAbility: Map<number, number> = new Map();
  public readonly hitsByAbility: Map<number, number> = new Map();

  // TODO: this probably shouldn't live here? needed for stagger damage table
  public readonly observedSpellSchools: Map<number, number> = new Map();

  private remainingTicks: number = 0;
  private readonly totalTickCount: number;

  /**
   * Total damage actually taken from ticks, including absorbs. Note that Stagger redirection from Niuzao is not an absorb.
   *
   * Immunity effects reduce this amount. That may seem niche, but some fights (notably Dimensius) give immunity as part of RP.
   *
   * The other big gotcha for comparing these is the rapid pool clearing that occurs if you don't take damage for long enough.
   * This is mostly relevant for M+, where rapid pool clearing occurs between packs and causes damage in to no longer match damage out.
   */
  public totalTickDamageTaken: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.damage.to(SELECTED_PLAYER).spell(SPELLS_COMMON.STAGGER_TAKEN),
      this.onStaggerTick,
    );
    this.addEventListener(
      Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.STAGGER_TALENT),
      this.onStaggerAbsorb,
    );
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.onDeath);

    if (this.selectedCombatant.hasTalent(SPELLS.BOB_AND_WEAVE_TALENT)) {
      this.totalTickCount = 30;
    } else {
      this.totalTickCount = 20;
    }
  }

  /**
   * Retrieve the state of the stagger pool as of `timestamp`.
   *
   * The current implementation uses a binary search to avoid scanning the whole list.
   */
  public getPoolAtTime(timestamp: number): StaggerPoint {
    const nearestMatch = this.pool.getBefore(timestamp);
    return nearestMatch ?? StaggerPoint.empty(timestamp, this.totalTickCount);
  }

  private estimatedNextTick(): number {
    return (this.pool.data[this.pool.data.length - 1]?.total ?? 0) / this.remainingTicks;
  }

  private onStaggerTick(event: DamageEvent): void {
    const tickAmount =
      event.hitType === HIT_TYPES.IMMUNE
        ? /* estimated */ this.estimatedNextTick()
        : event.unmitigatedAmount!;

    this.totalTickDamageTaken += event.amount + (event.absorbed ?? 0);

    if (this.poolData.length === 0) {
      // analysis started after the fight start, aka a phase selection or duration selection.
      // we use this tick to infer the amount of stagger in the pool, assigned to `UNKNOWN_ABILITY`
      const initialPoolValue = StaggerPoint.empty(event.timestamp, this.totalTickCount).add(
        event.timestamp,
        UNKNOWN_SPELL,
        tickAmount * this.totalTickCount,
        this.totalTickCount,
      );
      this.poolData.push(initialPoolValue);
      this.remainingTicks = this.totalTickCount;
      this.updatePoolForTick(event, tickAmount);
    } else {
      if (ENABLE_DEBUG_ANN) {
        const currentAmount = this.poolData[this.poolData.length - 1].total;
        const expectedAmount = tickAmount * this.remainingTicks;

        // Stagger spreads out damage over N ticks. if it doesn't divide evenly, the tick
        // amount alternates between X and X+1 to do the proper amount.
        // this sets a margin so that pool amounts for N*X and N*(X+1) are treated as equal
        const discardMargin = this.remainingTicks;

        const delta = Math.abs(currentAmount - expectedAmount);
        const errorPct =
          delta > discardMargin ? delta / Math.max(currentAmount, expectedAmount) : 0;

        this.addDebugAnnotation(event, {
          summary: `Validated Stagger Tick (expected ${expectedAmount}, actually ${currentAmount})`,
          color: errorPct < 0.02 ? GoodColor : BadColor,
          details: (
            <dl>
              <dt>Tick Amount</dt>
              <dd>{tickAmount}</dd>
              <dt>Remaining Ticks</dt>
              <dd>{this.remainingTicks}</dd>
              <dt>Pool Amount</dt>
              <dd>
                {currentAmount} (expected {expectedAmount})
              </dd>
              <dt>Error %</dt>
              <dd>{formatPercentage(errorPct)}%</dd>
            </dl>
          ),
        });
      }

      if (this.remainingTicks === 0) {
        // this can occur in valid logs due to range issues
        this.addDebugAnnotation(event, {
          summary: 'Unexpected Stagger tick (remaining = 0)',
          color: BadColor,
        });
      }

      this.updatePoolForTick(event, tickAmount);
    }
  }

  /**
   * Update total damage maps, ignoring prevention. (We want actual total damage staggered)
   */
  private updateTotalDamage(event: AbsorbedEvent): void {
    this.totalDamageByAbility.set(
      event.extraAbility.guid,
      (this.totalDamageByAbility.get(event.extraAbility.guid) ?? 0) + event.amount,
    );
    this.hitsByAbility.set(
      event.extraAbility.guid,
      (this.hitsByAbility.get(event.extraAbility.guid) ?? 0) + 1,
    );

    this.observedSpellSchools.set(event.extraAbility.guid, event.extraAbility.type);
  }

  private onStaggerAbsorb(event: AbsorbedEvent): void {
    this.updateTotalDamage(event);

    if (this.poolData.length === 0) {
      this.poolData.push(StaggerPoint.empty(this.owner.fight.start_time, this.totalTickCount));
    }

    let current = this.poolData[this.poolData.length - 1];
    if (event.timestamp - current.timestamp > STAGGER_QUICK_DRAIN_MS) {
      this.poolData.push(
        StaggerPoint.empty(current.timestamp + STAGGER_TICK_INTERVAL_MS, this.totalTickCount),
      );
      current = this.poolData[this.poolData.length - 1];
    }
    const prevention = staggerPreventedLink.reverse.first(event);
    let amount = event.amount;
    if (prevention) {
      amount = Math.max(0, amount - prevention.amount);
    }

    if (ENABLE_DEBUG_ANN) {
      this.addDebugAnnotation(event, {
        color: PerfectColor,
        summary: `Stagger Absorb (raw amount ${event.amount}, prevented ${prevention?.amount ?? 0})`,
      });
    }

    this.poolData.push(
      current.add(event.timestamp, event.extraAbility.guid, amount, this.totalTickCount),
    );
    if (amount > 0) {
      // if stagger absorb is fully prevented, do not refresh tick count
      this.remainingTicks = this.totalTickCount;
    }
  }

  private onDeath(event: DeathEvent): void {
    this.poolData.push(StaggerPoint.empty(event.timestamp, this.totalTickCount));
  }

  private updatePoolForTick(event: AnyEvent, tickAmount: number) {
    const current = this.poolData[this.poolData.length - 1];
    this.remainingTicks = Math.max(0, this.remainingTicks - 1);
    const newAmount = tickAmount * this.remainingTicks;
    this.poolData.push(current.scale(event.timestamp, newAmount, this.remainingTicks));
  }
}
