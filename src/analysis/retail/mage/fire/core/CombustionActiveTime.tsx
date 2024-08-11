import { formatNumber, formatPercentage, formatDuration } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  EventType,
  ApplyBuffEvent,
  GetRelatedEvent,
  RemoveBuffEvent,
  FightEndEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import CombustionPreCastDelay from './Combustion';
import AlwaysBeCasting from './AlwaysBeCasting';
import EventHistory from 'parser/shared/modules/EventHistory';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';

class CombustionActiveTime extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
    alwaysBeCasting: AlwaysBeCasting,
    combustionPreCastDelay: CombustionPreCastDelay,
  };
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected combustionPreCastDelay!: CombustionPreCastDelay;

  activeTime: {
    buffStart: number;
    duration: number;
    downtime: number;
    activePercent: number;
    analysis: BoxRowEntry;
  }[] = [];
  buffApplies: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
      this.onCombustStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
      this.onCombustEnd,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onCombustStart(event: ApplyBuffEvent) {
    this.buffApplies += 1;
  }

  onCombustEnd(event: RemoveBuffEvent) {
    const buffApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, 'BuffApply');
    if (!buffApply) {
      return;
    }
    this.analyzeActiveTime(buffApply, event.timestamp);
  }

  onFightEnd(event: FightEndEvent) {
    const buffApply = this.eventHistory.getEvents(EventType.ApplyBuff, {
      spell: TALENTS.COMBUSTION_TALENT,
      count: 1,
    })[0];
    if (!this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id) || !buffApply) {
      return;
    }
    this.analyzeActiveTime(buffApply, event.timestamp);
  }

  combustionDowntime = () => {
    let active = 0;
    this.activeTime.forEach((c) => (active += c.downtime));
    return active / 1000;
  };

  analyzeActiveTime(buffApply: ApplyBuffEvent, buffEnd: number) {
    const cast = HasRelatedEvent(buffApply, 'SpellCast') && GetRelatedEvent(buffApply, 'SpellCast');
    if (!cast) {
      return;
    }

    const duration = buffEnd - buffApply.timestamp;
    const activeTime = this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(
      buffApply.timestamp,
      buffEnd,
    );
    const activePercent = Math.min(activeTime / duration, 1);
    const downtime = Math.max(duration - activeTime, 0);
    const tooltip = (
      <>
        {formatPercentage(activePercent, 0)}% Active Time
        <br />
        {(downtime / 1000).toFixed(2)}s Downtime
      </>
    );
    this.activeTime[cast.timestamp] = {
      buffStart: buffApply.timestamp,
      duration,
      downtime,
      activePercent,
      analysis: {
        value: this.checkPerformance(activeTime, duration),
        tooltip,
      },
    };
  }

  checkPerformance(activeTime: number, buffDuration: number) {
    const activePercent = activeTime / buffDuration;

    let performance;
    if (activePercent > this.combustionActiveTimeThresholds.isLessThan.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (activePercent > this.combustionActiveTimeThresholds.isLessThan.average) {
      performance = QualitativePerformance.Good;
    } else if (activePercent > this.combustionActiveTimeThresholds.isLessThan.major) {
      performance = QualitativePerformance.Ok;
    } else {
      performance = QualitativePerformance.Fail;
    }

    return performance;
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(TALENTS.COMBUSTION_TALENT.id) / 1000;
  }

  get percentActiveTime() {
    return 1 - this.combustionDowntime() / this.buffUptime;
  }

  get combustionActiveTimeThresholds() {
    return {
      actual: this.percentActiveTime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.combustionActiveTimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You spent {formatNumber(this.combustionDowntime())}s (
          {formatNumber(this.combustionDowntime() / this.buffApplies)}s average per{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} />
          ), not casting anything while <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> was active.
          Because a large portion of your damage comes from Combustion, you should ensure that you
          are getting the most out of it every time it is cast. While sometimes this is out of your
          control (you got targeted by a mechanic at the worst possible time), you should try to
          minimize that risk by casting <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> when you are
          at a low risk of being interrupted or when the target is vulnerable.
        </>,
      )
        .icon(TALENTS.COMBUSTION_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Active Time during Combustion`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={
          <>
            When using Combustion, you should ensure you are getting the most out of it by using
            every second of the cooldown as any time spent not casting anything is lost damage.
            While sometimes this will be out of your control due to boss mechanics, you should try
            to minimize that risk by using your cooldowns when you are least likely to get
            interrupted or the boss is vulnerable. <br />
            <br />
            Additionally, it is recommended that you minimize the delay from the time you activate
            Combustion until your pre-cast (the spell you were casting when you activated
            Combustion) finishes, to ensure you do not miss out on a GCD during Combustion while
            waiting for that pre-cast to finish. The recommendation (and the value that
            SimC/RaidBots uses) is to activate Combustion with 0.7 seconds or less remaining in your
            pre-cast, but if you do not want to adjust your gameplay or cannot accomplish this due
            to latency/ping issues then you can use the values below to tell RaidBots to adjust the
            delay that it uses to provide more accurate sims. To do this, enter
            "apl_variable.combustion_cast_remains=value" in the Custom APL section in Raid Bots
            (where "value" is the delay in seconds ... i.e. 1.1 or 0.9).
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Timestamp</th>
                  <th style={{ textAlign: 'left' }}>Active Time</th>
                  <th style={{ textAlign: 'left' }}>Delay</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(this.combustionPreCastDelay.combustionCasts).map((cast) => (
                  <tr key={cast}>
                    <th style={{ textAlign: 'left' }}>
                      {formatDuration(Number(cast) - this.owner.fight.start_time)}
                    </th>
                    <th style={{ textAlign: 'left' }}>
                      {formatPercentage(this.activeTime[Number(cast)].activePercent)}%
                    </th>
                    <td style={{ textAlign: 'left' }}>
                      {(
                        this.combustionPreCastDelay.combustionCasts[Number(cast)].delay / 1000
                      ).toFixed(2)}
                      s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.COMBUSTION_TALENT}>
          {formatPercentage(this.percentActiveTime)}% <small>Combustion Active Time</small>
          <br />
          {this.combustionPreCastDelay.combustionCastDelayThresholds.actual.toFixed(2)}s{' '}
          <small>Avg. Pre-Cast Delay</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CombustionActiveTime;
