import { formatNumber, formatPercentage } from 'common/format';
import { TALENTS_MAGE } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, {
  EventType,
  GetRelatedEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  FightEndEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import AlwaysBeCasting from './AlwaysBeCasting';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class IcyVeins extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    alwaysBeCasting: AlwaysBeCasting,
  };
  protected eventHistory!: EventHistory;
  protected alwaysBeCasting!: AlwaysBeCasting;

  activeTime: number[] = [];
  buffApplies: number = 0;

  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MAGE.ICY_VEINS_TALENT),
      this.onIcyVeinsStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_MAGE.ICY_VEINS_TALENT),
      this.onIcyVeinsEnd,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
    // Guide
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_MAGE.ICY_VEINS_TALENT),
      this.generateCastEntryOnBuffEnd,
    );
    this.addEventListener(Events.fightend, this.generateCastEntryOnFightEnd);
  }

  onIcyVeinsStart(event: ApplyBuffEvent) {
    this.buffApplies += 1;
  }

  onIcyVeinsEnd(event: RemoveBuffEvent) {
    const buffApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, 'BuffApply');
    if (!buffApply) {
      return;
    }
    const icyVeinsDuration = event.timestamp - buffApply.timestamp;
    this.activeTime[buffApply.timestamp] =
      icyVeinsDuration -
      this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(buffApply.timestamp, event.timestamp);
  }

  onFightEnd(event: FightEndEvent) {
    const buffApply = this.eventHistory.getEvents(EventType.ApplyBuff, {
      spell: TALENTS_MAGE.ICY_VEINS_TALENT,
      count: 1,
    })[0];
    if (!this.selectedCombatant.hasBuff(TALENTS_MAGE.ICY_VEINS_TALENT.id) || !buffApply) {
      return;
    }
    const icyVeinsDuration = event.timestamp - buffApply.timestamp;
    this.activeTime[buffApply.timestamp] =
      icyVeinsDuration -
      this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(buffApply.timestamp, event.timestamp);
  }

  generateCastEntryOnFightEnd(event: FightEndEvent) {
    const buffApply = this.eventHistory.getEvents(EventType.ApplyBuff, {
      spell: TALENTS_MAGE.ICY_VEINS_TALENT,
      count: 1,
    })[0];
    if (!this.selectedCombatant.hasBuff(TALENTS_MAGE.ICY_VEINS_TALENT.id) || !buffApply) {
      return;
    }

    this.generateCastEntryBetween(buffApply.timestamp, event.timestamp);
  }

  generateCastEntryOnBuffEnd(event: RemoveBuffEvent) {
    const buffApply: ApplyBuffEvent | undefined = GetRelatedEvent(event, 'BuffApply');
    if (!buffApply) {
      return;
    }

    this.generateCastEntryBetween(buffApply.timestamp, event.timestamp);
  }

  private generateCastEntryBetween(buffApply: number, event: number) {
    const icyVeinsActiveRatio = this.alwaysBeCasting.getActiveTimePercentageInWindow(
      buffApply,
      event,
    );
    let performance = QualitativePerformance.Fail;
    const percentage = formatPercentage(icyVeinsActiveRatio, 0);
    let message = `Fail: less than 75% Active Time (${percentage}%)`;
    if (icyVeinsActiveRatio > 0.95) {
      performance = QualitativePerformance.Perfect;
      message = `Perfect: more than 95% Active Time (${percentage}%)`;
    } else if (icyVeinsActiveRatio > 0.85) {
      performance = QualitativePerformance.Good;
      message = `Good: more than 85% Active Time (${percentage}%)`;
    } else if (icyVeinsActiveRatio > 0.75) {
      performance = QualitativePerformance.Ok;
      message = `Ok: more than 75% Active Time (${percentage}%)`;
    }
    const tooltip = <>{message}</>;
    this.castEntries.push({ value: performance, tooltip });
  }

  icyVeinsDowntime = () => {
    let activeTime = 0;
    this.activeTime.forEach((c) => (activeTime += c));
    return activeTime / 1000;
  };

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(TALENTS_MAGE.ICY_VEINS_TALENT.id) / 1000;
  }

  get percentActiveTime() {
    return 1 - this.icyVeinsDowntime() / this.buffUptime;
  }

  get icyVeinsActiveTimeThresholds() {
    return {
      actual: this.percentActiveTime,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get guideSubsection(): JSX.Element {
    const icyVeins = <SpellLink spell={TALENTS_MAGE.ICY_VEINS_TALENT} />;

    const explanation = (
      <>
        <p>
          <b>{icyVeins}</b> is one of he main sources of damage. You shouldn't hold on it, except in
          cases when you're waiting for a boss increased damage mechanic.
        </p>
        <p>
          Active Time is crucial during {icyVeins}; you should aim for more than 90%. Try to plan
          ahead to avoid overlapping boss mechanics that render it untargetable or inactive with
          {icyVeins}, as this can significantly impact your DPS output.
        </p>
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>{icyVeins} cast efficiency</strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          <strong>{icyVeins} active time</strong>
          <PerformanceBoxRow values={this.castEntries} />
          <small>
            blue (perfect) - more than 95% Active Time (AT) / green (good) - more than 85% AT /
            yellow (ok) - more than 75% AT / red (fail) - less than 75% AT
          </small>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Icy Veins',
    );
  }

  /** Guide subsection describing the proper usage of Icy Veins */
  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_MAGE.ICY_VEINS_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }

  suggestions(when: When) {
    when(this.icyVeinsActiveTimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You spent {formatNumber(this.icyVeinsDowntime())} seconds (
          {formatNumber(this.icyVeinsDowntime() / this.buffApplies)}s per cast) not casting anything
          while <SpellLink spell={TALENTS_MAGE.ICY_VEINS_TALENT} /> was active. Because a large
          portion of your damage comes from Icy Veins, you should ensure that you are getting the
          most out of it every time it is cast. While sometimes this is out of your control (you got
          targeted by a mechanic at the worst possible time), you should try to minimize that risk
          by casting <SpellLink spell={TALENTS_MAGE.ICY_VEINS_TALENT} /> when you are at a low risk
          of being interrupted or when the target is vulnerable.
        </>,
      )
        .icon(TALENTS_MAGE.ICY_VEINS_TALENT.icon)
        .actual(`${formatPercentage(this.percentActiveTime)}% Active Time during Icy Veins`)
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
            When using Icy Veins, you should ensure you are getting the most out of it by using
            every second of the cooldown as any time spent not casting anything is lost damage and
            will result in less cooldown reduction on Icy Veins. While sometimes this will be out of
            your control due to boss mechanics, you should try to minimize that risk by using your
            cooldowns when you are least likely to get interrupted or the boss is vulnerable.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_MAGE.ICY_VEINS_TALENT}>
          {formatPercentage(this.percentActiveTime)}% <small>Icy Veins Active Time</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IcyVeins;
