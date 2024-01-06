import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
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

class IcyVeins extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    alwaysBeCasting: AlwaysBeCasting,
  };
  protected eventHistory!: EventHistory;
  protected alwaysBeCasting!: AlwaysBeCasting;

  activeTime: number[] = [];
  buffApplies: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ICY_VEINS_TALENT),
      this.onIcyVeinsStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.ICY_VEINS_TALENT),
      this.onIcyVeinsEnd,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
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
      spell: TALENTS.ICY_VEINS_TALENT,
      count: 1,
    })[0];
    if (!this.selectedCombatant.hasBuff(TALENTS.ICY_VEINS_TALENT.id) || !buffApply) {
      return;
    }
    const icyVeinsDuration = event.timestamp - buffApply.timestamp;
    this.activeTime[buffApply.timestamp] =
      icyVeinsDuration -
      this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(buffApply.timestamp, event.timestamp);
  }

  icyVeinsDowntime = () => {
    let activeTime = 0;
    this.activeTime.forEach((c) => (activeTime += c));
    return activeTime / 1000;
  };

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(TALENTS.ICY_VEINS_TALENT.id) / 1000;
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

  suggestions(when: When) {
    when(this.icyVeinsActiveTimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You spent {formatNumber(this.icyVeinsDowntime())} seconds (
          {formatNumber(this.icyVeinsDowntime() / this.buffApplies)}s per cast) not casting anything
          while <SpellLink spell={TALENTS.ICY_VEINS_TALENT} /> was active. Because a large portion
          of your damage comes from Icy Veins, you should ensure that you are getting the most out
          of it every time it is cast. While sometimes this is out of your control (you got targeted
          by a mechanic at the worst possible time), you should try to minimize that risk by casting{' '}
          <SpellLink spell={TALENTS.ICY_VEINS_TALENT} /> when you are at a low risk of being
          interrupted or when the target is vulnerable.
        </>,
      )
        .icon(TALENTS.ICY_VEINS_TALENT.icon)
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
        <BoringSpellValueText spell={TALENTS.ICY_VEINS_TALENT}>
          {formatPercentage(this.percentActiveTime)}% <small>Icy Veins Active Time</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IcyVeins;
