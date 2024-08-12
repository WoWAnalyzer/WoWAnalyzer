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
import ForcedDowntime from 'parser/shared/normalizers/ForcedDowntime';

const DEBUG = true;

class AlwaysBeCasting extends Analyzer {
  static dependencies = {
    haste: Haste,
    abilities: Abilities,
    forcedDowntime: ForcedDowntime,
    globalCooldown: GlobalCooldown, // triggers the globalcooldown event
    channeling: Channeling, // triggers the channeling-related events
  };
  protected haste!: Haste;
  protected abilities!: Abilities;
  protected forcedDowntime!: ForcedDowntime;
  protected globalCooldown!: GlobalCooldown;
  protected channeling!: Channeling;

  /**
   * The amount of milliseconds not spent casting anything or waiting for the GCD.
   * @type {number}
   */
  get totalTimeWasted() {
    return this.owner.fightDuration - this.activeTime;
  }

  /**
   * Percentage of fight time spent not casting anything or waiting on GCD.
   * In range 0..1.
   */
  get downtimePercentage() {
    return 1 - this.activeTimePercentage;
  }

  /**
   * Percentage of fight time spent casting or waiting on GCD.
   * In range 0..1.
   */
  get activeTimePercentage() {
    return this.activeTime / this.owner.fightDuration;
  }

  /**
   * Percentage of fight time spent casting or waiting on GCD, with 'forced downtime' segments excluded.
   * In range 0..1.
   */
  get activeTimePercentageExcludingForcedDowntime() {
    const durationWithoutForcedDowntime =
      this.owner.fightDuration -
      this.forcedDowntime.downtimeWindows.reduce(
        (sum, window) => sum + (window.end - window.start),
        0,
      );
    if (durationWithoutForcedDowntime <= 0) {
      console.warn(
        'Somehow got all fight time as forced downtime - unable to calculate no-forced-downtime active time percentage',
      );
      return 0;
    }
    return this.activeTimeExcludingForcedDowntime / durationWithoutForcedDowntime;
  }

  /** Gets active time percentage within a specified time segment.
   *  This will not work properly unless the current timestamp advances past the end time. */
  getActiveTimePercentageInWindow(start: number, end: number): number {
    const windowDuration = end - start;
    return this.getActiveTimeMillisecondsInWindow(start, end) / windowDuration;
  }

  /** Gets active time milliseconds within a specified time segment.
   *  This will not work properly unless the current timestamp advances past the end time. */
  getActiveTimeMillisecondsInWindow(start: number, end: number): number {
    let activeTime = 0;
    for (let i = 0; i < this.activeTimeSegments.length; i += 1) {
      const seg = this.activeTimeSegments[i];
      if (seg.end <= start) {
        continue;
      } else if (seg.start >= end) {
        break;
      }
      const overlapStart = Math.max(start, seg.start);
      const overlapEnd = Math.min(end, seg.end);
      activeTime += Math.max(0, overlapEnd - overlapStart);
    }
    return activeTime;
  }

  // TODO 'active time excluding downtime in window'?
  //   Likely don't need because 'in window' queries for checking on CDs,
  //   and we want to show player that they overlapped downtime with a CD and that's bad

  /** Tally of active time in the encounter so far */
  private activeTime = 0;
  /** Tally of active time in the encounter so far, with forced downtime segments excluded */
  private activeTimeExcludingForcedDowntime = 0;

  private _lastGlobalCooldownDuration = 0;

  /** Segments of time when the player was active, populated at the same time activeTime is incremented.
   *  Guaranteed to not overlap and to be in chronological order,
   *  but segments may not exactly correspond to a cast or GCD */
  activeTimeSegments: { start: number; end: number }[] = [];

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
    if (event.trigger.type === EventType.BeginChannel || event.trigger.channel) {
      // Only add active time for this channel, we do this when the channel is finished and use the highest of the GCD and channel time
      return false;
    }

    this._handleNewUptimeSegment(
      event.timestamp,
      event.timestamp + event.duration,
      `GCD for ${event.trigger.ability.name}`,
    );
    return true;
  }

  onEndChannel(event: EndChannelEvent) {
    // If the channel was shorter than the GCD then use the GCD as active time
    let amount = event.duration;
    if (this.globalCooldown.isOnGlobalCooldown(event.ability.guid)) {
      amount = Math.max(amount, this._lastGlobalCooldownDuration);
    }

    // check if the initial channel is from pre-pull, if it is, only count active time from the beginning of the fight
    if (!this.activeTimeSegments.length) {
      amount = Math.min(amount, event.timestamp - this.owner.fight.start_time);
    }

    this._handleNewUptimeSegment(
      event.timestamp - amount,
      event.timestamp,
      `Channel for ${event.ability.name}`,
    );
    return true;
  }

  onFightEnd() {
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

  /** Adds a new active time segment, updating active time tallies and ensuring no overlap.
   *  This must be called in chronological order to work properly! */
  private _handleNewUptimeSegment(start: number, end: number, reason: string) {
    const prev = this.activeTimeSegments.at(-1);
    const noOverlapStart = prev && prev.end > start ? prev.end : start;

    const duration = end - noOverlapStart;
    if (duration <= 0) {
      console.warn(`Tried to add ActiveTime segment with reason ${reason}
        @ ${this.owner.formatTimestamp(noOverlapStart, 1)} - ${this.owner.formatTimestamp(end, 1)}
        that would be fully overlapped by an existing activeTime`);
    }

    this.activeTimeSegments.push({ start: noOverlapStart, end });
    this.activeTime += duration;
    this.activeTimeExcludingForcedDowntime += this._amountNotForcedDowntime(noOverlapStart, end);

    DEBUG &&
      console.log(
        `Active Time: added ${duration.toFixed(0)}ms from ${reason} @ ` +
          `${this.owner.formatTimestamp(noOverlapStart, 1)} - ${this.owner.formatTimestamp(end, 1)} ` +
          `${noOverlapStart !== start ? `(start changed from original overlapping @ ${this.owner.formatTimestamp(start, 1)})` : ''}`,
      );
  }

  /** Check if active time with the given start and end overlaps any of the downtime windows,
   *  and returns the segment length after removing overlap.
   *
   *  For simplicity of logic and perf reasons, this algorithm assumes the active time segment
   *  is shorter than any of the downtime segments, and further assumes it overlaps at most one
   *  of the downtime segments. This should be a reasonable assumption.
   */
  private _amountNotForcedDowntime(start: number, end: number): number {
    const active = { start, end };
    for (const downtime of this.forcedDowntime.downtimeWindows) {
      if (active.start >= downtime.end) {
        // active window is entirely after downtime window
        // this window doesn't overlap, but we have to keep looping to check the others
      } else if (active.end <= downtime.start) {
        // active window is entirely before downtime window
        // this window doesn't overlap, but we have to keep looping to check the others
      } else if (active.end <= downtime.end && active.start >= downtime.start) {
        // active window is entirely contained in downtime window
        DEBUG &&
          console.log(
            `Active Time: segment @ ${this.owner.formatTimestamp(start, 1)} - ${this.owner.formatTimestamp(end, 1)} ` +
              `omitted from noForcedDowntime active due to full overlap with forced downtime @ ` +
              `${this.owner.formatTimestamp(downtime.start, 1)} - ${this.owner.formatTimestamp(downtime.end, 1)}`,
          );
        return 0;
      } else if (active.start >= downtime.start && active.start < downtime.end) {
        // active window's beginning overlaps downtime
        DEBUG &&
          console.log(
            `Active Time: segment @ ${this.owner.formatTimestamp(start, 1)} - ${this.owner.formatTimestamp(end, 1)} ` +
              `truncated to ${active.end - downtime.end}ms in noForcedDowntime active due to partial overlap with forced downtime @ ` +
              `${this.owner.formatTimestamp(downtime.start, 1)} - ${this.owner.formatTimestamp(downtime.end, 1)}`,
          );
        return Math.max(0, active.end - downtime.end);
      } else if (active.end >= downtime.start && active.end < downtime.end) {
        // active window's ending overlaps downtime
        DEBUG &&
          console.log(
            `Active Time: segment @ ${this.owner.formatTimestamp(start, 1)} - ${this.owner.formatTimestamp(end, 1)} ` +
              `truncated to ${downtime.start - active.start}ms in noForcedDowntime active due to partial overlap with forced downtime @ ` +
              `${this.owner.formatTimestamp(downtime.start, 1)} - ${this.owner.formatTimestamp(downtime.end, 1)}`,
          );
        return Math.max(0, downtime.start - active.start);
      } else {
        // unhandled case???
        console.warn(
          `Unexpected active/downtime overlap - ` +
            `activeStart:${active.start}, activeEnd:${active.end}, downtimeStart:${downtime.start}, downtimeEnd:${downtime.end}`,
        );
        return 0;
      }
    }
    return active.end - active.start;
  }

  showStatistic = true;
  position = STATISTIC_ORDER.CORE(10);
  static icons = {
    activeTime: '/img/sword.png',
    downtime: '/img/afk.png',
  };

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
        minor: 0.05,
        average: 0.1,
        major: 0.15,
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
