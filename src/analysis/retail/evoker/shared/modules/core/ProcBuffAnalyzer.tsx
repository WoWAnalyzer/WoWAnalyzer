import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { AnalysisData } from '../components/ProcAnalysis';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { CastEvaluation } from 'interface/guide/components';
import { SpellFilter } from 'parser/core/EventFilter';

export interface PerformanceSettings {
  refreshingBuffIsFail: boolean;
  overcapBuffIsFail: boolean;
}

export interface StackOptions {
  /** If either of the values in this is `true` then `amountOfStacksGenerated` should be set to the appropriate value*/
  settings: PerformanceSettings;
  /** If either of the values in `settings` is `true` then this should be set to the appropriate value*/
  amountOfStacksGenerated: number;
  maxStacks: number;
}

export interface ProcBuffAnalyzerOptions {
  trackedBuffs: SpellFilter;
  inactiveListeners: {
    applyBuff?: boolean;
    applyBuffStack?: boolean;
    refreshBuff?: boolean;
    removeBuff?: boolean;
    removeBuffStack?: boolean;
  };
  stackOptions?: StackOptions;
}

/** This Analyzer is a module capable of all the basic buff/proc tracking features and does the following things:
 * - Counts generated, wasted and used stacks
 * - Identifies wasted stacks via overcapping
 * - Keeps track of the stack changes
 * - Provides several functions for augmenting the above functionality
 * */
abstract class ProcBuffAnalyzer extends Analyzer {
  private _stacksGenerated = 0;
  private _stacksUsed = 0;
  private _activeStacks = 0;
  private _previousStacks = 0;
  private _refreshingBuffIsFail = false;
  private _overcapBuffisFail = false;

  protected casts: CastEvaluation[] = [];
  protected maxStacks = 99;
  protected amountOfStacksGenerated = 1;

  constructor(options: Options, analyzerOptions: ProcBuffAnalyzerOptions) {
    super(options);
    if (analyzerOptions.stackOptions) {
      this._refreshingBuffIsFail = analyzerOptions.stackOptions.settings.refreshingBuffIsFail;
      this._overcapBuffisFail = analyzerOptions.stackOptions.settings.overcapBuffIsFail;
      this.amountOfStacksGenerated = analyzerOptions.stackOptions.amountOfStacksGenerated;
      this.maxStacks = analyzerOptions.stackOptions.maxStacks;
    }

    if (!analyzerOptions.inactiveListeners.applyBuff)
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(analyzerOptions.trackedBuffs),
        this.onApplyBuffBase,
      );

    if (!analyzerOptions.inactiveListeners.applyBuffStack)
      this.addEventListener(
        Events.applybuffstack.by(SELECTED_PLAYER).spell(analyzerOptions.trackedBuffs),
        this.onApplyBuffStackBase,
      );

    if (!analyzerOptions.inactiveListeners.refreshBuff)
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(analyzerOptions.trackedBuffs),
        this.onRefreshBuffBase,
      );

    if (!analyzerOptions.inactiveListeners.removeBuff)
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(analyzerOptions.trackedBuffs),
        this.onRemoveBuffBase,
      );

    if (!analyzerOptions.inactiveListeners.removeBuffStack)
      this.addEventListener(
        Events.removebuffstack.by(SELECTED_PLAYER).spell(analyzerOptions.trackedBuffs),
        this.onRemoveBuffStackBase,
      );

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private changeStacks(stacks: number, wasted = false) {
    this._previousStacks = this._activeStacks;
    this._activeStacks = stacks;
  }
  private onApplyBuffBase(event: ApplyBuffEvent) {
    this.changeStacks(Math.min(this._activeStacks + this.amountOfStacksGenerated, this.maxStacks));
    this._stacksGenerated += this.stackDifference;
    this.onApplyBuff(event);
  }
  private onApplyBuffStackBase(event: ApplyBuffStackEvent) {
    this.changeStacks(event.stack);
    if (
      this._overcapBuffisFail &&
      this._previousStacks + this.amountOfStacksGenerated > this.maxStacks
    ) {
      this.pushOvercapFailure(event);
    }
    this._stacksGenerated += this.stackDifference;
    this.onApplyBuffStack(event);
  }
  private onRefreshBuffBase(event: RefreshBuffEvent) {
    if (this._refreshingBuffIsFail) {
      this.pushRefreshFailure(event);
    }
    this.onRefreshBuff(event);
  }
  private onRemoveBuffBase(event: RemoveBuffEvent) {
    this.changeStacks(0);
    this.onRemoveBuff(event);
  }
  private onRemoveBuffStackBase(event: RemoveBuffStackEvent) {
    this.changeStacks(event.stack);
    this.onRemoveBuffStack(event);
  }
  private onFightEnd(event: FightEndEvent) {
    if (this._activeStacks > 0) {
      this.pushCastData(
        event,
        `Fight ended, wasting ${this._activeStacks} stack(s).`,
        QualitativePerformance.Ok,
      );
    }
  }

  // Override these to implement cast checking
  abstract onApplyBuff(event: ApplyBuffEvent): void;
  abstract onApplyBuffStack(event: ApplyBuffStackEvent): void;
  abstract onRefreshBuff(event: RefreshBuffEvent): void;
  abstract onRemoveBuff(event: RemoveBuffEvent): void;
  abstract onRemoveBuffStack(event: RemoveBuffStackEvent): void;

  protected pushCastData(event: AnyEvent, info: string, performance: QualitativePerformance) {
    const castEntry: CastEvaluation = {
      performance: performance,
      timestamp: event.timestamp,
      reason: info,
    };
    this.casts.push(castEntry);
  }
  // Used for custom logic using the generic messages
  protected pushOvercapFailure(event: ApplyBuffStackEvent) {
    this.pushCastData(
      event,
      `Buff overcapped, wasting ${this._activeStacks + this.amountOfStacksGenerated - this.maxStacks} stack(s)`,
      QualitativePerformance.Fail,
    );
  }
  protected pushRefreshFailure(event: RefreshBuffEvent) {
    this.pushCastData(
      event,
      `Buff overcapped, wasting ${this.amountOfStacksGenerated} stack(s)`,
      QualitativePerformance.Fail,
    );
  }

  protected addStacksUsed(count: number) {
    this._stacksUsed += count;
  }

  get activeStacks() {
    return this._activeStacks;
  }
  /** Returns the difference between the last 2 stack states (Positive = Gain, Negative = Loss) */
  get stackDifference() {
    return this._activeStacks - this._previousStacks;
  }
  get stacksGenerated() {
    return this._stacksGenerated;
  }
  get stacksUsed() {
    return this._stacksUsed;
  }
  get stacksWasted() {
    return this._stacksGenerated - this._stacksUsed;
  }

  abstract get procUsageData(): AnalysisData;
}

export default ProcBuffAnalyzer;
