import { formatPercentage } from 'common/format';
import { EndChannelEvent, GlobalCooldownEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import Gauge from 'parser/ui/Gauge';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class AlwaysBeCastingHealing extends CoreAlwaysBeCasting {
  HEALING_ABILITIES_ON_GCD: number[] = [
    // Extend this class and override this property in your spec class to implement this module.
  ];

  healingTime = 0;
  get healingTimePercentage() {
    return this.healingTime / this.owner.fightDuration;
  }
  get nonHealingTimePercentage() {
    return 1 - this.healingTimePercentage;
  }

  _lastHealingCastFinishedTimestamp = null;

  onGCD(event: GlobalCooldownEvent) {
    if (!super.onGCD(event)) {
      return false;
    }
    if (this.countsAsHealingAbility(event)) {
      this.healingTime += event.duration;
    }
    return true;
  }
  onEndChannel(event: EndChannelEvent) {
    if (!super.onEndChannel(event)) {
      return false;
    }
    if (this.countsAsHealingAbility(event)) {
      this.healingTime += event.duration;
    }
    return true;
  }
  countsAsHealingAbility(event: GlobalCooldownEvent | EndChannelEvent) {
    return this.HEALING_ABILITIES_ON_GCD.includes(event.ability.guid);
  }

  showStatistic = true;
  static icons = {
    healingTime: '/img/healing.png',
    activeTime: '/img/sword.png',
    downtime: '/img/afk.png',
  };
  statistic() {
    if (!this.showStatistic) {
      return null;
    }

    const activeTimePercentage = this.activeTimePercentage;
    const healingTimePercentage = this.healingTimePercentage;
    const downtimePercentage = this.downtimePercentage;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        tooltip={
          <>
            This is the precise amount of time you were actively casting something or waiting for a
            Global Cooldown. The remaining time was downtime; you cast nothing and wasn't waiting
            for a global cooldown (i.e. "AFK time").
            <br />
            <br />
            You were active for <strong>{formatPercentage(activeTimePercentage)}%</strong> of the
            fight. You spent <strong>{formatPercentage(healingTimePercentage)}%</strong> of your
            time casting supportive spells,{' '}
            <strong>{formatPercentage(activeTimePercentage - healingTimePercentage)}%</strong> of
            the time casting offensive spells and{' '}
            <strong>{formatPercentage(downtimePercentage)}%</strong> of the time doing nothing.
            <br />
            <br />
            See the timeline for details.
          </>
        }
        drilldown="timeline"
      >
        <div className="pad">
          <label>
            <>Active time</>
          </label>

          <Gauge value={activeTimePercentage} />
        </div>
      </Statistic>
    );
  }

  get nonHealingTimeSuggestionThresholds() {
    return {
      actual: this.nonHealingTimePercentage,
      isGreaterThan: {
        minor: 0.3,
        average: 0.4,
        major: 0.45,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  // Override these suggestion thresholds for healers: it's much less important to DPS so allow for considerable slack.
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.35,
        major: 1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  suggestions(when: When) {
    when(this.nonHealingTimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        "Your time spent healing can be improved. Try to reduce the amount of time you're not healing, for example by reducing the delay between casting spells, moving during the GCD and if you have to move try to continue healing with instant spells.",
      )
        .icon('petbattle_health-down')
        .actual(`${formatPercentage(1 - actual)}% time spent healing`)
        .recommended(`>${formatPercentage(1 - recommended)}% is recommended`),
    );
    when(this.downtimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        "Your active time can be improved. Try to reduce your downtime, for example by reducing the delay between casting spells and when you're not healing try to contribute some damage.",
      )
        .icon('spell_mage_altertime')
        .actual(`${formatPercentage(1 - actual)}% active time`)
        .recommended(`>${formatPercentage(1 - recommended)}% is recommended`),
    );
  }
}

export default AlwaysBeCastingHealing;
