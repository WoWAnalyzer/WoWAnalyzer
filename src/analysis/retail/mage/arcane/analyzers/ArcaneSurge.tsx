import TALENTS from 'common/TALENTS/mage';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  FightEndEvent,
  GetRelatedEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import AlwaysBeCasting from '../core/AlwaysBeCasting';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';

export default class ArcaneSurge extends Analyzer {
  static dependencies = {
    alwaysBeCasting: AlwaysBeCasting,
  };

  protected alwaysBeCasting!: AlwaysBeCasting;

  surgeData: ArcaneSurgeData[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ARCANE_SURGE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_SURGE_TALENT),
      this.onSurgeCast,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onSurgeCast(event: CastEvent) {
    const buffApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, EventType.ApplyBuff);
    const buffRemove: RemoveBuffEvent | undefined = GetRelatedEvent(event, EventType.RemoveBuff);

    this.surgeData.push({
      cast: event.timestamp,
      buffApply,
      buffRemove,
    });
  }

  onFightEnd(event: FightEndEvent) {
    this.analyzeSurge();
  }

  analyzeSurge = () => {
    this.surgeData.forEach((s) => {
      if (!s.buffApply) {
        return;
      }
      const activeTime = this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(
        s.buffApply.timestamp,
        s.buffRemove?.timestamp || this.owner.fight.end_time,
      );
      const activeTimePercent =
        activeTime /
        ((s.buffRemove?.timestamp || this.owner.fight.end_time) - s.buffApply.timestamp);
      s.activeTime = activeTimePercent;
    });
  };

  activeTimeUtil(activePercent: number) {
    return evaluateQualitativePerformanceByThreshold({
      actual: activePercent,
      isGreaterThan: {
        perfect: 0.95,
        good: 0.9,
        ok: 0.8,
      },
    });
  }
}

export interface ArcaneSurgeData {
  cast: number;
  buffApply?: ApplyBuffEvent;
  buffRemove?: RemoveBuffEvent;
  activeTime?: number;
}
