import { defineMessage, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { EndChannelEvent, GlobalCooldownEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import Gauge from 'parser/ui/Gauge';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const DEBUG = false;

class AlwaysBeCastingHealing extends CoreAlwaysBeCasting {
  HEALING_ABILITIES_ON_GCD: number[] = [
    // Extend this class and override this property in your spec class to implement this module.
  ];

  /** Memoized total active time (ms) */
  private activeHealingTimeMemo: number | undefined = 0;
  /** Start time of memoized active segment */
  private memoHealingStartTime: number | undefined;
  /** End time of memoized active time segment */
  private memoHealingEndTime: number | undefined;

  isHealingAbility(event: EndChannelEvent | GlobalCooldownEvent): boolean {
    return this.HEALING_ABILITIES_ON_GCD.includes(event.ability.guid);
  }

  onFightEnd() {
    DEBUG &&
      console.log(
        'ABC Stats:\n' +
          'Active Time = ' +
          this.activeTime +
          '\n' +
          'Healing Active Time = ' +
          this.healingTime +
          '\n' +
          'Total Fight Time = ' +
          this.owner.fightDuration +
          '\n' +
          'Active Time Percentage = ' +
          formatPercentage(this.activeTimePercentage) +
          '\n' +
          'Active Healing Time Percentage = ' +
          formatPercentage(this.healingTimePercentage),
      );
  }

  /** The active healing time (in ms) recorded */
  get healingTime() {
    if (
      this.activeHealingTimeMemo === undefined ||
      this.owner.fight.start_time !== this.memoHealingStartTime ||
      this.owner.fight.end_time !== this.memoHealingEndTime
    ) {
      this.memoHealingStartTime = this.owner.fight.start_time;
      this.memoHealingEndTime = this.owner.fight.end_time;
      this.activeHealingTimeMemo = this.getActiveTimeMillisecondsInWindow(
        this.memoHealingStartTime,
        this.memoHealingEndTime,
        true,
      );
    }
    return this.activeHealingTimeMemo;
  }

  /** Percentage of fight time spent casting heals */
  get healingTimePercentage() {
    return this.healingTime / this.owner.fightDuration;
  }

  /** Percentage of fight time not casting heals (either idle or casting other spells) */
  get nonHealingTimePercentage() {
    return 1 - this.healingTimePercentage;
  }

  /////////////////////////////////////////////////////////////////////////////
  // DEFAULT SUGGESTION + STATISTIC STUFF
  //

  showStatistic = true;

  statistic() {
    if (!this.showStatistic) {
      return null;
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        tooltip={
          <Trans id="shared.alwaysBeCastingHealing.statistic.tooltip">
            Active Time is the amount of time you were actively casting something or waiting for a
            Global Cooldown. The remaining time was downtime; you cast nothing and weren't waiting
            for a global cooldown (i.e. "AFK time").
            <br />
            <br />
            You were active for <strong>{formatPercentage(this.activeTimePercentage)}%</strong> of
            the fight. You spent <strong>{formatPercentage(this.healingTimePercentage)}%</strong> of
            your time casting supportive spells,{' '}
            <strong>
              {formatPercentage(this.activeTimePercentage - this.healingTimePercentage)}%
            </strong>{' '}
            of the time casting offensive spells and{' '}
            <strong>{formatPercentage(this.downtimePercentage)}%</strong> of the time doing nothing.
            <br />
            <br />
            See the timeline for details.
          </Trans>
        }
        drilldown="../timeline"
      >
        <div className="pad">
          <label>
            <Trans id="shared.alwaysBeCastingHealing.statistic">Active time</Trans>
          </label>

          <Gauge value={this.activeTimePercentage} />
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
        .actual(
          defineMessage({
            id: 'shared.suggestions.alwaysBeCastingHealing.timeSpentHealing',
            message: `${formatPercentage(1 - actual)}% time spent healing`,
          }),
        )
        .recommended(`>${formatPercentage(1 - recommended)}% is recommended`),
    );
    when(this.downtimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        "Your active time can be improved. Try to reduce your downtime, for example by reducing the delay between casting spells and when you're not healing try to contribute some damage.",
      )
        .icon('spell_mage_altertime')
        .actual(
          defineMessage({
            id: 'shared.suggestions.alwaysBeCasting.activeTime',
            message: `${formatPercentage(1 - actual)}% active time`,
          }),
        )
        .recommended(`>${formatPercentage(1 - recommended)}% is recommended`),
    );
  }
}

export default AlwaysBeCastingHealing;
