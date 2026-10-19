import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { CastEvaluation } from 'interface/guide/components';
import { BadColor, OkColor } from 'interface/guide';
import { AnalysisData } from '../components/ProcAnalysis';

export interface ProcBuffAnalyzerConfig {
  /** The buff to track, also shown in the guide. */
  buff: Spell;
  /** Amount of stacks gained per proc. Defaults to 1. */
  stacksPerProc?: number;
  /** Maximum amount of stacks the buff can have. Defaults to 1. */
  maxStacks?: number;
}

export type BuffGainEvent = ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent;
export type BuffRemoveEvent = RemoveBuffEvent | RemoveBuffStackEvent;

/** A cast entry for the guide. Uses the timestamp of the triggering event when `timestamp` is omitted. */
export type ProcEvaluation = Omit<CastEvaluation, 'timestamp'> & { timestamp?: number };

/**
 * An analyzer for a buff that is gained through procs and consumed by casting spells, tracking
 * how its stacks were used.
 *
 * It keeps track of the active stacks and counts the generated, consumed, expired and overcapped
 * stacks (see `stacksGenerated` and friends). Every consume, expiry, overcap, refresh at max stacks
 * and stacks left at the end of the fight gets an entry in the guide, which can be customized.
 *
 * ## Usage
 *
 * 1. Extend this class and call the constructor with the `options` passed into your analyzer and
 *    a `ProcBuffAnalyzerConfig`. Values that depend on the player, like talents or tier sets, can be
 *    computed from `options.owner.selectedCombatant` before calling `super`.
 * 2. Implement `getConsumeEvent`, which returns the event that consumed the buff. This is usually
 *    a cast linked to the remove event by a normalizer.
 * 3. Optionally implement the `onStacks*` hooks to keep track of your own statistics, eg. which
 *    spells consumed the buff.
 * 4. Optionally override the `evaluate*` methods to change or skip guide entries, eg. when
 *    overcapping the buff isn't a mistake.
 * 5. If the game logs refreshes alongside the stack changes of your buff, add it to the
 *    `BuffStackRefreshRemover` of your spec.
 *
 * If you are working with a talent, remember that you need to check `hasTalent` yourself!
 *
 * ## Example
 *
 * Azure Sweep is the simplest implementation and only implements `getConsumeEvent`. Burnout also
 * customizes the guide entries, and Imminent Destruction uses `onStacksConsumed` to keep track of
 * which spells consumed the buff.
 *
 * ## Event handling
 *
 * - An `applybuff` has no stack information, so it is assumed to grant `stacksPerProc` stacks.
 * - Every proc while the buff is active is its own `applybuffstack`, gaining `stacksPerProc` stacks.
 * - A `refreshbuff` is a proc while at max stacks. Refreshes logged alongside a stack change on
 *   the exact same timestamp are ignored, those a few ms off must be removed by a normalizer.
 * - Losing the last stack is a `removebuff`. A single `removebuffstack` can remove multiple stacks
 *   and always means they were consumed.
 *
 * Events that don't fit these rules are never counted as overcapping and are flagged with a debug
 * annotation instead, so check the debug view when adding a new buff.
 */
abstract class ProcBuffAnalyzer<ConsumeEvent extends AnyEvent = AnyEvent> extends Analyzer {
  readonly buff: Spell;
  readonly stacksPerProc: number;
  readonly maxStacks: number;

  private _activeStacks = 0;
  /** False when the active stacks are a guess, eg. after a prepull applybuff */
  private activeStacksKnown = true;
  /** Used to ignore the refreshes the game logs alongside stack changes */
  private lastStackEventTimestamp: number | undefined;

  private _stacksGenerated = 0;
  private _stacksConsumed = 0;
  private _stacksExpired = 0;
  private _stacksOvercapped = 0;

  protected readonly casts: CastEvaluation[] = [];

  protected constructor(options: Options, config: ProcBuffAnalyzerConfig) {
    super(options);
    this.buff = config.buff;
    this.stacksPerProc = config.stacksPerProc ?? 1;
    this.maxStacks = config.maxStacks ?? 1;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(config.buff),
      this.onApplyBuffBase,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(config.buff),
      this.onApplyBuffStackBase,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(config.buff),
      this.onRefreshBuffBase,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(config.buff),
      this.onRemoveBuffBase,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(config.buff),
      this.onRemoveBuffStackBase,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  /** Returns the event that consumed the removed stack(s), or `undefined` if they expired.
   * Usually this is the cast linked to the remove event by a normalizer. */
  protected abstract getConsumeEvent(event: BuffRemoveEvent): ConsumeEvent | undefined;

  /*
   * Stack change hooks. Implement these to keep track of your own statistics, eg. which
   * spells consumed the buff or the damage they dealt. Stack counting is already handled,
   * see `stacksGenerated` and friends.
   *
   * They are called after the stack counts are updated and before the matching `evaluate*`,
   * which should never contain bookkeeping since overriding it to change or skip guide entries
   * would then also change your statistics.
   */

  /** Called when stacks are gained (`gained`) or lost to overcapping (`overcapped`), at least one of which is non-zero. */
  protected onStacksGained?(event: BuffGainEvent, gained: number, overcapped: number): void;
  /** Called when `stacks` were removed and `getConsumeEvent` returned `consumeEvent`. */
  protected onStacksConsumed?(
    event: BuffRemoveEvent,
    consumeEvent: ConsumeEvent,
    stacks: number,
  ): void;
  /** Called when the buff was removed with `stacks` stacks without `getConsumeEvent` returning a consume event. */
  protected onStacksExpired?(event: RemoveBuffEvent, stacks: number): void;

  /*
   * Guide entries. Override these to change the performance or message of an entry, or return
   * `undefined` to skip it. These should not have side effects, use the stack change hooks for that.
   */

  /** Defaults to Good. */
  protected evaluateConsume(
    event: BuffRemoveEvent,
    consumeEvent: ConsumeEvent,
    stacks: number,
  ): ProcEvaluation | undefined {
    return { performance: QualitativePerformance.Good, reason: 'Buff used' };
  }
  /** Defaults to Fail. */
  protected evaluateExpire(event: RemoveBuffEvent, stacks: number): ProcEvaluation | undefined {
    return {
      performance: QualitativePerformance.Fail,
      reason: `Buff expired, wasting ${stacks} stack(s)`,
    };
  }
  /** Called when a proc while below max stacks gained `gained` stacks and lost `overcapped` stacks to overcapping.
   * Defaults to Fail. */
  protected evaluateOvercap(
    event: ApplyBuffStackEvent,
    gained: number,
    overcapped: number,
  ): ProcEvaluation | undefined {
    return {
      performance: QualitativePerformance.Fail,
      reason: `Buff overcapped, wasting ${overcapped} stack(s)`,
    };
  }
  /** Called when a proc while at max stacks lost all `overcapped` stacks.
   * Defaults to Fail. */
  protected evaluateRefresh(
    event: RefreshBuffEvent,
    overcapped: number,
  ): ProcEvaluation | undefined {
    return {
      performance: QualitativePerformance.Fail,
      reason: `Buff refreshed at max stacks, wasting ${overcapped} stack(s)`,
    };
  }
  /** Called when the fight ends with active stacks. Defaults to Ok. */
  protected evaluateFightEnd(event: FightEndEvent, stacks: number): ProcEvaluation | undefined {
    return {
      performance: QualitativePerformance.Ok,
      reason: `Fight ended, wasting ${stacks} stack(s).`,
    };
  }

  /** Adds a guide entry, use this for entries outside of the regular evaluations */
  protected pushEvaluation(event: AnyEvent, evaluation: ProcEvaluation | undefined) {
    if (evaluation) {
      this.casts.push({ ...evaluation, timestamp: evaluation.timestamp ?? event.timestamp });
    }
  }

  get activeStacks() {
    return this._activeStacks;
  }
  /** Stacks actually gained, excludes overcapped stacks */
  get stacksGenerated() {
    return this._stacksGenerated;
  }
  get stacksConsumed() {
    return this._stacksConsumed;
  }
  get stacksExpired() {
    return this._stacksExpired;
  }
  get stacksOvercapped() {
    return this._stacksOvercapped;
  }
  /** Expired and overcapped stacks, excludes stacks still active at the end of the fight */
  get stacksWasted() {
    return this._stacksExpired + this._stacksOvercapped;
  }

  get procUsageData(): AnalysisData {
    return {
      casts: this.casts,
      spell: this.buff,
    };
  }

  // region Internal helpers

  private onApplyBuffBase(event: ApplyBuffEvent) {
    const stacks = Math.min(this.stacksPerProc, this.maxStacks);
    // Prepull applybuffs are fabricated and don't reflect the actual stacks
    this.setActiveStacks(stacks, !event.prepull);
    this.handleGain(event, stacks, 0);
  }

  private onApplyBuffStackBase(event: ApplyBuffStackEvent) {
    // Without any tracked stacks we missed the applybuff, so we only know the buff had at least 1 stack
    const stacksKnown = this.activeStacksKnown && this._activeStacks > 0;
    this.ensureActiveStacks(1);
    const previous = this._activeStacks;
    const uncappedStacks = previous + this.stacksPerProc;
    const expectedStacks = Math.min(uncappedStacks, this.maxStacks);

    let overcapped = 0;
    if (stacksKnown) {
      if (expectedStacks === event.stack) {
        overcapped = uncappedStacks - expectedStacks;
      } else {
        // Don't guess at overcapping when the stacks don't add up, since it would blame the player for our mistake
        this.addDebugAnnotation(event, {
          color: BadColor,
          summary: `Unexpected ${this.buff.name} stack gain`,
          details: `Expected ${previous} -> ${expectedStacks} stacks but got ${event.stack}, check \`stacksPerProc\` / \`maxStacks\` or for missing events.`,
        });
      }
    }

    // Having fewer stacks than tracked means our tracking is off, eg. due to a wrong `stacksPerProc`, which shouldn't affect the generated stacks
    const gained = Math.max(event.stack - previous, 0);
    this.setStacksFromStackEvent(event);
    this.handleGain(event, gained, overcapped);

    if (overcapped > 0) {
      this.pushEvaluation(event, this.evaluateOvercap(event, gained, overcapped));
    }
  }

  private onRefreshBuffBase(event: RefreshBuffEvent) {
    if (event.timestamp === this.lastStackEventTimestamp) {
      // fast track check for dumb refreshes being logged alongside stack changes not removed by a normalizer
      return;
    }

    if (this.activeStacksKnown && this._activeStacks < this.maxStacks) {
      // Not an overcap, likely a refresh that should have been removed by a normalizer or misconfigured `maxStacks`
      this.addDebugAnnotation(event, {
        color: OkColor,
        summary: `Unexpected ${this.buff.name} refresh`,
        details: `Refreshed at ${this._activeStacks}/${this.maxStacks} stacks, check the refresh normalizer or \`maxStacks\`.`,
      });
      return;
    }

    // A refresh means we procced at max stacks, so any stacks we didn't track were missed gains
    this.ensureActiveStacks(this.maxStacks);
    this.setActiveStacks(this.maxStacks);
    this.handleGain(event, 0, this.stacksPerProc);
    this.pushEvaluation(event, this.evaluateRefresh(event, this.stacksPerProc));
  }

  private onRemoveBuffBase(event: RemoveBuffEvent) {
    this.ensureActiveStacks(1);
    const removed = this._activeStacks;
    this.setActiveStacks(0);
    this.handleRemove(event, removed);
  }

  private onRemoveBuffStackBase(event: RemoveBuffStackEvent) {
    this.ensureActiveStacks(event.stack + 1);
    const removed = this._activeStacks - event.stack;
    this.setStacksFromStackEvent(event);
    this.handleRemove(event, removed);
  }

  private onFightEnd(event: FightEndEvent) {
    if (this._activeStacks > 0) {
      this.pushEvaluation(event, this.evaluateFightEnd(event, this._activeStacks));
    }
  }

  /** Sets the active stacks, `known` should only be false when `stacks` is a guess */
  private setActiveStacks(stacks: number, known = true) {
    this._activeStacks = stacks;
    this.activeStacksKnown = known;
  }

  /** Also remembers the timestamp, to ignore the refresh the game logs alongside the stack change */
  private setStacksFromStackEvent(event: ApplyBuffStackEvent | RemoveBuffStackEvent) {
    this.setActiveStacks(event.stack);
    this.lastStackEventTimestamp = event.timestamp;
  }

  /** Corrects the active stacks when an event proves we had more than we tracked, eg. due to missing prepull events */
  private ensureActiveStacks(minimum: number) {
    if (this._activeStacks < minimum) {
      this._stacksGenerated += minimum - this._activeStacks;
      this._activeStacks = minimum;
    }
  }

  private handleGain(event: BuffGainEvent, gained: number, overcapped: number) {
    if (gained === 0 && overcapped === 0) {
      // Keeps `onStacksGained` from being called without any change
      return;
    }

    this._stacksGenerated += gained;
    this._stacksOvercapped += overcapped;
    this.onStacksGained?.(event, gained, overcapped);
  }

  private handleRemove(event: BuffRemoveEvent, stacks: number) {
    const consumeEvent = this.getConsumeEvent(event);
    if (consumeEvent) {
      this._stacksConsumed += stacks;
      this.onStacksConsumed?.(event, consumeEvent, stacks);
      this.pushEvaluation(event, this.evaluateConsume(event, consumeEvent, stacks));
      return;
    }

    if (event.type === EventType.RemoveBuffStack) {
      // Stacks only get removed individually by consuming them, so the consume link is missing
      this.addDebugAnnotation(event, {
        color: BadColor,
        summary: `No consume event found for ${this.buff.name} stack removal`,
        details: 'Counted as consumed, check the normalizer linking the consume event.',
      });
      this._stacksConsumed += stacks;
      return;
    }

    this._stacksExpired += stacks;
    this.onStacksExpired?.(event, stacks);
    this.pushEvaluation(event, this.evaluateExpire(event, stacks));
  }

  // endregion
}

export default ProcBuffAnalyzer;
