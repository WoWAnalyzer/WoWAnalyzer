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

export interface AnalyzerOptions {
  trackedBuffs: SpellFilter;
  inactiveListeners: {
    applyBuff?: boolean;
    applyBuffStack?: boolean;
    refreshBuff?: boolean;
    removeBuff?: boolean;
    removeBuffStack?: boolean;
  };
  refreshingBuffIsFail?: boolean;
  overcapBuffisFail?: boolean;
}

abstract class ProcBuffAnalyzer extends Analyzer {
  casts: CastEvaluation[] = [];
  activeStacks = 0;
  previousStacks = 0;
  maxStacks = 0;
  amountOfStacksGenerated = 1;
  refreshingBuffIsFail = false;
  overcapBuffisFail = false;

  constructor(options: Options, analyzerOptions: AnalyzerOptions) {
    super(options);
    this.refreshingBuffIsFail = analyzerOptions.refreshingBuffIsFail || false;
    this.overcapBuffisFail = analyzerOptions.overcapBuffisFail || false;

    if (!analyzerOptions.inactiveListeners.applyBuff)
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(analyzerOptions.trackedBuffs),
        this.onApplyBuff,
      );

    if (!analyzerOptions.inactiveListeners.applyBuffStack)
      this.addEventListener(
        Events.applybuffstack.by(SELECTED_PLAYER).spell(analyzerOptions.trackedBuffs),
        this.onApplyBuffStack,
      );

    if (!analyzerOptions.inactiveListeners.refreshBuff)
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(analyzerOptions.trackedBuffs),
        this.onRefreshBuff,
      );

    if (!analyzerOptions.inactiveListeners.removeBuff)
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(analyzerOptions.trackedBuffs),
        this.onRemoveBuff,
      );

    if (!analyzerOptions.inactiveListeners.removeBuffStack)
      this.addEventListener(
        Events.removebuffstack.by(SELECTED_PLAYER).spell(analyzerOptions.trackedBuffs),
        this.onRemoveBuffStack,
      );

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private changeStacks(stacks: number) {
    this.previousStacks = this.activeStacks;
    this.activeStacks = stacks;
  }
  private onApplyBuff(event: ApplyBuffEvent) {
    this.changeStacks(Math.min(this.activeStacks + this.amountOfStacksGenerated, this.maxStacks));
    this.ApplyCheck(event);
  }
  private onApplyBuffStack(event: ApplyBuffStackEvent) {
    if (
      this.overcapBuffisFail &&
      this.activeStacks + this.amountOfStacksGenerated > this.maxStacks
    ) {
      this.pushCastData(
        event,
        `Buff overcapped, wasting ${this.activeStacks + this.amountOfStacksGenerated - this.maxStacks}`,
        QualitativePerformance.Fail,
      );
    }
    this.changeStacks(event.stack);
    this.ApplyStackCheck(event);
  }
  private onRefreshBuff(event: RefreshBuffEvent) {
    if (this.refreshingBuffIsFail) {
      this.pushCastData(
        event,
        `Buff overcapped, wasting ${this.amountOfStacksGenerated}`,
        QualitativePerformance.Fail,
      );
    }
    this.RefreshCheck(event);
  }
  private onRemoveBuff(event: RemoveBuffEvent) {
    this.changeStacks(0);
    this.RemoveCheck(event);
  }
  private onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.changeStacks(event.stack);
    this.RemoveStackCheck(event);
  }
  private onFightEnd(event: FightEndEvent) {
    if (this.activeStacks > 0) {
      this.pushCastData(
        event,
        `Fight ended, wasting ${this.activeStacks} stack(s).`,
        QualitativePerformance.Ok,
      );
    }
  }

  // Override these to implement cast checking
  ApplyCheck(event: ApplyBuffEvent) {
    return;
  }
  ApplyStackCheck(event: ApplyBuffStackEvent) {
    return;
  }
  RefreshCheck(event: RefreshBuffEvent) {
    return;
  }
  RemoveCheck(event: RemoveBuffEvent) {
    return;
  }
  RemoveStackCheck(event: RemoveBuffStackEvent) {
    return;
  }

  pushCastData(event: AnyEvent, info: string, performance: QualitativePerformance) {
    const castEntry: CastEvaluation = {
      performance: performance,
      timestamp: event.timestamp,
      reason: info,
    };
    this.casts.push(castEntry);
  }

  abstract get procUsageData(): AnalysisData;
}

export default ProcBuffAnalyzer;
