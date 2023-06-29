import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { RemoveBuffEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import FilteredActiveTime from 'parser/shared/modules/FilteredActiveTime';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class ArcaneSurgeActiveTime extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    filteredActiveTime: FilteredActiveTime,
    abilityTracker: AbilityTracker,
  };
  protected eventHistory!: EventHistory;
  protected filteredActiveTime!: FilteredActiveTime;
  protected abilityTracker!: AbilityTracker;

  activeTime = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_SURGE_TALENT),
      this.onArcaneSurgeRemoved,
    );
  }

  onArcaneSurgeRemoved(event: RemoveBuffEvent) {
    const buffApplied = this.eventHistory.last(
      1,
      undefined,
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_SURGE_TALENT),
    )[0].timestamp;
    const uptime = this.filteredActiveTime.getActiveTime(buffApplied, event.timestamp);
    this.activeTime += uptime;
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(TALENTS.ARCANE_SURGE_TALENT.id);
  }

  get percentActiveTime() {
    return this.activeTime / this.buffUptime || 0;
  }

  get downtimeSeconds() {
    return (this.buffUptime - this.activeTime) / 1000;
  }

  get averageDowntime() {
    return (
      this.downtimeSeconds / this.abilityTracker.getAbility(TALENTS.ARCANE_SURGE_TALENT.id).casts
    );
  }

  get arcaneSurgeActiveTimeThresholds() {
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
    when(this.arcaneSurgeActiveTimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You spent {formatNumber(this.downtimeSeconds)} seconds (
          {formatNumber(this.averageDowntime)}s per cast) not casting anything while{' '}
          <SpellLink id={TALENTS.ARCANE_SURGE_TALENT.id} /> was active. Because a large portion of
          your damage comes from Arcane Surge, you should ensure that you are getting the most out
          of it every time it is cast. While sometimes this is out of your control (you got targeted
          by a mechanic at the worst possible time), you should try to minimize that risk by casting{' '}
          <SpellLink id={TALENTS.ARCANE_SURGE_TALENT.id} /> when you are at a low risk of being
          interrupted or when the target is vulnerable.
        </>,
      )
        .icon(TALENTS.ARCANE_SURGE_TALENT.icon)
        .actual(<>{formatPercentage(this.percentActiveTime)}% Active Time during Arcane Surge</>)
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
            When using Arcane Surge, you should ensure you are getting the most out of it by using
            every second of the cooldown as any time spent not casting anything is lost damage.
            While sometimes this will be out of your control due to boss mechanics, you should try
            to minimize that risk by using your cooldowns when you are least likely to get
            interrupted or the boss is vulnerable.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.ARCANE_SURGE_TALENT.id}>
          {formatPercentage(this.percentActiveTime)}% <small>Arcane Surge Active Time</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneSurgeActiveTime;
