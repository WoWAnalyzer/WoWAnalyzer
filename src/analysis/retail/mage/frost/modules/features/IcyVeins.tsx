import { Trans } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
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

class IcyVeins extends Analyzer {
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
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ICY_VEINS),
      this.onIcyVeinsRemoved,
    );
  }

  onIcyVeinsRemoved(event: RemoveBuffEvent) {
    const buffApplied = this.eventHistory.last(
      1,
      undefined,
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ICY_VEINS),
    )[0].timestamp;
    const uptime = this.filteredActiveTime.getActiveTime(buffApplied, event.timestamp);
    this.activeTime += uptime;
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ICY_VEINS.id);
  }

  get percentActiveTime() {
    return this.activeTime / this.buffUptime || 0;
  }

  get downtimeSeconds() {
    return (this.buffUptime - this.activeTime) / 1000;
  }

  get averageDowntime() {
    return this.downtimeSeconds / this.abilityTracker.getAbility(SPELLS.ICY_VEINS.id).casts;
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
          You spent {formatNumber(this.downtimeSeconds)} seconds (
          {formatNumber(this.averageDowntime)}s per cast) not casting anything while{' '}
          <SpellLink id={SPELLS.ICY_VEINS.id} /> was active. Because a large portion of your damage
          comes from Icy Veins, you should ensure that you are getting the most out of it every time
          it is cast. While sometimes this is out of your control (you got targeted by a mechanic at
          the worst possible time), you should try to minimize that risk by casting{' '}
          <SpellLink id={SPELLS.ICY_VEINS.id} /> when you are at a low risk of being interrupted or
          when the target is vulnerable.
        </>,
      )
        .icon(SPELLS.ICY_VEINS.icon)
        .actual(
          <Trans id="mage.frost.suggestions.icyVeins.icyVeinsActiveTime">
            {formatPercentage(this.percentActiveTime)}% Active Time during Icy Veins
          </Trans>,
        )
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
            every second of the cooldown as any time spent not casting anything is lost damage.
            While sometimes this will be out of your control due to boss mechanics, you should try
            to minimize that risk by using your cooldowns when you are least likely to get
            interrupted or the boss is vulnerable.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.ICY_VEINS.id}>
          {formatPercentage(this.percentActiveTime)}% <small>Icy Veins Active Time</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IcyVeins;
