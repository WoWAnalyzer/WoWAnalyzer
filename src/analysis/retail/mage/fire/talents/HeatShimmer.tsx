import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  EventType,
  GetRelatedEvent,
} from 'parser/core/Events';
import {
  evaluateQualitativePerformanceByThreshold,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';

export default class HeatShimmer extends Analyzer {
  procs: HeatShimmerProcs[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HEAT_SHIMMER_TALENT);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HEAT_SHIMMER_BUFF),
      this.onHeatShimmerEnd,
    );
  }

  onHeatShimmerEnd(event: RemoveBuffEvent) {
    const buffApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, EventType.ApplyBuff);
    const spender: CastEvent | undefined = GetRelatedEvent(event, 'consume');
    const uptime: number = (buffApply && event.timestamp - buffApply.timestamp) || 0;

    this.procs.push({
      buffApply,
      buffRemove: event,
      spender,
      uptime,
    });
  }

  get averageUptime() {
    let totalUptime = 0;
    this.procs.forEach((hs) => (totalUptime += hs.uptime));
    return totalUptime / this.procs.length;
  }

  get expiredProcs() {
    const expired = this.procs.filter((hs) => !hs.spender);
    return expired.length;
  }

  get expiredProcsPerformance(): QualitativePerformance {
    return evaluateQualitativePerformanceByThreshold({
      actual: this.expiredProcs,
      isLessThanOrEqual: {
        perfect: 0,
        good: 0.3 * (this.owner.fightDuration / 60000),
        ok: 0.6 * (this.owner.fightDuration / 60000),
      },
    });
  }
}

export interface HeatShimmerProcs {
  buffApply?: ApplyBuffEvent;
  buffRemove: RemoveBuffEvent;
  spender?: CastEvent;
  uptime: number;
}
