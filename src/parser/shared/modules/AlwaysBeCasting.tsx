import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { Icon } from 'interface';
import { Tooltip } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { EndChannelEvent, EventType, GlobalCooldownEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import Haste from 'parser/shared/modules/Haste';
import Channeling from 'parser/shared/normalizers/Channeling';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import Abilities from '../../core/modules/Abilities';
import GlobalCooldown from './GlobalCooldown';
import getUptimeGraph, { UptimeHistoryEntry } from 'parser/shared/modules/getUptimeGraph';

const DEBUG = false;

/** For graphing the active time rolling average, this is the length of the window used */
export const ACTIVE_TIME_ROLLING__WINDOW_DURATION = 15000;

class AlwaysBeCasting extends Analyzer {
  static dependencies = {
    haste: Haste,
    abilities: Abilities,
    globalCooldown: GlobalCooldown, // triggers the globalcooldown event
    channeling: Channeling, // triggers the channeling-related events
  };
  protected haste!: Haste;
  protected abilities!: Abilities;
  protected globalCooldown!: GlobalCooldown;
  protected channeling!: Channeling;

  /**
   * The amount of milliseconds not spent casting anything or waiting for the GCD.
   * @type {number}
   */
  get totalTimeWasted() {
    return this.owner.fightDuration - this.activeTime;
  }

  get downtimePercentage() {
    return 1 - this.activeTimePercentage;
  }

  get activeTimePercentage() {
    return this.activeTime / this.owner.fightDuration;
  }

  activeTime = 0;
  _lastGlobalCooldownDuration = 0;

  /** Segments of time when the player was active, populated at the same time activeTime is incremented.
   *  Guaranteed to not overlap and to be in chronological order,
   *  but segments may not exactly correspond to a cast or GCD */
  activeTimeSegments: { start: number; end: number }[] = [];
  /** Rolling average uptime over the course of the encounter */
  rollingActiveTimeAverage: UptimeHistoryEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.GlobalCooldown, this.onGCD);
    this.addEventListener(Events.EndChannel, this.onEndChannel);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onGCD(event: GlobalCooldownEvent) {
    this._lastGlobalCooldownDuration = event.duration;
    if (event.trigger.prepull) {
      // Ignore prepull casts for active time since active time should only include casts during the
      return false;
    }
    if (event.trigger.type === EventType.BeginChannel) {
      // Only add active time for this channel, we do this when the channel is finished and use the highest of the GCD and channel time
      return false;
    }
    this.activeTime += event.duration;
    this._handleNewUptimeSegment(event.timestamp, event.timestamp + event.duration);
    DEBUG &&
      console.log(
        'Active Time: added ' +
          event.duration +
          ' from GCD for ' +
          event.trigger.ability.name +
          ' @ ' +
          this.owner.formatTimestamp(event.trigger.timestamp),
      );
    return true;
  }

  onEndChannel(event: EndChannelEvent) {
    // If the channel was shorter than the GCD then use the GCD as active time
    let amount = event.duration;
    if (this.globalCooldown.isOnGlobalCooldown(event.ability.guid)) {
      amount = Math.max(amount, this._lastGlobalCooldownDuration);
    }
    this.activeTime += amount;
    this._handleNewUptimeSegment(event.timestamp - amount, event.timestamp);
    DEBUG &&
      console.log(
        'Active Time: added ' +
          amount +
          ' from Channel for ' +
          event.ability.name +
          ' @ ' +
          this.owner.formatTimestamp(event.timestamp),
      );
    return true;
  }

  onFightEnd() {
    this._updateRollingAverage();
    DEBUG &&
      console.log(
        'ABC Stats:\n' +
          'Active Time = ' +
          this.activeTime +
          '\n' +
          'Total Fight Time = ' +
          this.owner.fightDuration +
          '\n' +
          'Active Time Percentage = ' +
          formatPercentage(this.activeTimePercentage),
      );
  }

  _handleNewUptimeSegment(start: number, end: number) {
    this.activeTimeSegments.push({ start, end });
    this._updateRollingAverage();
  }

  _updateRollingAverage() {
    // step backwards through the segment history and tally the active time within the window
    const timestamp = this.owner.currentTimestamp;
    if (timestamp <= this.owner.fight.start_time) {
      // don't want the problems of a 0 size window...
      return;
    }

    const windowStart = Math.max(
      this.owner.fight.start_time,
      timestamp - ACTIVE_TIME_ROLLING__WINDOW_DURATION,
    );
    const windowEnd = timestamp;
    const windowDuration = windowEnd - windowStart;
    let activeInWindow = 0;
    for (let i = this.activeTimeSegments.length - 1; i >= 0; i -= 1) {
      const segment = this.activeTimeSegments[i];
      if (segment.end <= windowStart) {
        break;
      }
      const overlapStart = Math.max(windowStart, segment.start);
      const overlapEnd = Math.min(windowEnd, segment.end);
      activeInWindow += Math.max(0, overlapEnd - overlapStart);
    }

    const uptimePct = activeInWindow / windowDuration;
    this.rollingActiveTimeAverage.push({ timestamp, uptimePct });
  }

  showStatistic = true;
  position = STATISTIC_ORDER.CORE(10);
  static icons = {
    activeTime: '/img/sword.png',
    downtime: '/img/afk.png',
  };

  get rollingAverageUptimeGraph() {
    return getUptimeGraph(this.rollingActiveTimeAverage, this.owner.fight.start_time);
  }

  statistic() {
    const boss = this.owner.boss;
    if (!this.showStatistic || (boss && boss.fight.disableDowntimeStatistic)) {
      return null;
    }
    if (!this.globalCooldown.isAccurate) {
      return null;
    }

    const ctor = this.constructor as typeof AlwaysBeCasting;
    return (
      <StatisticBox
        position={this.position}
        icon={<Icon icon="spell_mage_altertime" alt="Downtime" />}
        value={`${formatPercentage(this.downtimePercentage)} %`}
        label={<Trans id="shared.alwaysBeCasting.statistic.label">Downtime</Trans>}
        tooltip={
          <Trans id="shared.alwaysBeCasting.statistic.tooltip">
            Downtime is available time not used to cast anything (including not having your GCD
            rolling). This can be caused by delays between casting spells, latency, cast
            interrupting or just simply not casting anything (e.g. due to movement/stunned).
            <br />
            <ul>
              <li>
                You spent <strong>{formatPercentage(this.activeTimePercentage)}%</strong> of your
                time casting something.
              </li>
              <li>
                You spent <strong>{formatPercentage(this.downtimePercentage)}%</strong> of your time
                casting nothing at all.
              </li>
            </ul>
          </Trans>
        }
        footer={
          <div className="statistic-box-bar">
            <Tooltip
              content={
                <Trans id="shared.alwaysBeCasting.statistic.footer.activetime.tooltip">
                  You spent <strong>{formatPercentage(this.activeTimePercentage)}%</strong> of your
                  time casting something.
                </Trans>
              }
            >
              <div
                className="stat-health-bg"
                style={{
                  width: `${this.activeTimePercentage * 100}%`,
                }}
              >
                <img src={ctor.icons.activeTime} alt="Active time" />
              </div>
            </Tooltip>
            <Tooltip
              content={
                <Trans id="shared.alwaysBeCasting.statistic.footer.downtime.tooltip">
                  You spent <strong>{formatPercentage(this.downtimePercentage)}%</strong> of your
                  time casting nothing at all.
                </Trans>
              }
            >
              <div className="remainder DeathKnight-bg">
                <img src={ctor.icons.downtime} alt="Downtime" />
              </div>
            </Tooltip>
          </div>
        }
      />
    );
  }

  get downtimeSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.02,
        average: 0.04,
        major: 0.06,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get DowntimePerformance(): QualitativePerformance {
    const suggestionThresholds = this.downtimeSuggestionThresholds?.isGreaterThan;
    if (this.downtimePercentage <= 0) {
      return QualitativePerformance.Perfect;
    }
    if (suggestionThresholds && typeof suggestionThresholds === 'object') {
      if (
        suggestionThresholds.minor !== undefined &&
        this.downtimePercentage <= suggestionThresholds.minor
      ) {
        return QualitativePerformance.Good;
      }
      if (
        suggestionThresholds.average !== undefined &&
        this.downtimePercentage <= suggestionThresholds.average
      ) {
        return QualitativePerformance.Ok;
      }
    }
    return QualitativePerformance.Fail;
  }

  suggestions(when: When) {
    when(this.downtimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="shared.suggestions.alwaysBeCasting.suggestion">
          Your downtime can be improved. Try to Always Be Casting (ABC), avoid delays between
          casting spells and cast instant spells when you have to move.
        </Trans>,
      )
        .icon('spell_mage_altertime')
        .actual(
          <Trans id="shared.suggestions.alwaysBeCasting.downtime">
            {' '}
            {formatPercentage(actual)}% downtime{' '}
          </Trans>,
        )
        .recommended(
          <Trans id="shared.suggestions.alwaysBeCasting.recommended">
            {' '}
            {'<'}
            {formatPercentage(recommended)}% is recommended{' '}
          </Trans>,
        ),
    );
  }
}

export default AlwaysBeCasting;
