import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { Icon } from 'interface';
import { Tooltip } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { EndChannelEvent, GlobalCooldownEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import Haste from 'parser/shared/modules/Haste';
import Channeling from 'parser/shared/normalizers/Channeling';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import Abilities from '../../core/modules/Abilities';
import GlobalCooldown from './GlobalCooldown';

const DEBUG = false;

// settings for what counts as a "small" gap between abilities. the minimum value exists to help deal with latency
const SMALL_GAP_MIN_MS = 100;
const SMALL_GAP_MAX_MS = 2250;

export interface ActivitySegment {
  start: number;
  end: number;
}

interface ActivityEdge {
  timestamp: number;
  /** 1 for activity start, -1 for activity end - see checkAndGenerateActiveTimeSegments */
  value: 1 | -1;
  /** flag for if this ability is a healing ability - used to display healing active time vs
   *  non-healing active time for healers. Non-healers don't need to fill this in */
  isHealingAbility?: boolean;
}

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

  /** Times when activity started or stopped. When an active time segment is entered, its start
   *  time is added with value 1 and its end time with value -1.
   *  See {@link checkAndGenerateActiveTimeSegments} for more details on the algorithm */
  private activeTimeEdges: ActivityEdge[] = [];
  /** Segments when the player was active, in chronological order and non-overlapping.
   *  Access with {@link activeTimeSegments} to ensure they're fully generated */
  private workingActiveTimeSegments: ActivitySegment[] | undefined = undefined;
  /** Segments when the player was casting heals, in chronological order and non-overlapping.
   *  Access with {@link activeHealingTimeSegments} to ensure they're fully generated */
  private workingActiveHealingTimeSegments: ActivitySegment[] | undefined = undefined;
  /** Memoized total active time (ms) */
  private activeTimeMemo: number | undefined = 0;
  /** Start time of memoized active segment */
  private memoStartTime: number | undefined;
  /** End time of memoized active time segment */
  private memoEndTime: number | undefined;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.GlobalCooldown, this.onGCD);
    this.addEventListener(Events.EndChannel, this.onEndChannel);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onGCD(event: GlobalCooldownEvent) {
    const start = event.timestamp;
    const end = event.timestamp + event.duration;
    this.addNewUptime(start, end, this.isHealingAbility(event), `${event.ability.name} GCD`);
    return true;
  }

  onEndChannel(event: EndChannelEvent) {
    const start = event.start;
    const end = event.timestamp;
    this.addNewUptime(start, end, this.isHealingAbility(event), `${event.ability.name} Channel`);
    return true;
  }

  /** Override this to differentiate healing vs non-healing abilities */
  protected isHealingAbility(event: EndChannelEvent | GlobalCooldownEvent): boolean {
    return false;
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

  /** Validates and logs inputs, then adds to activeTimeEdges list */
  protected addNewUptime(start: number, end: number, isHealingAbility: boolean, reason: string) {
    DEBUG &&
      console.log(
        `Active Time: adding from ${reason}: ${this.owner.formatTimestamp(start, 3)} to ${this.owner.formatTimestamp(end, 3)}${isHealingAbility ? ' (heal)' : ''}`,
      );
    if (end < start) {
      console.error(
        `ActiveTime: tried to add uptime with reason (${reason}) with start (${this.owner.formatTimestamp(start, 3)}) after end (${this.owner.formatTimestamp(end, 3)}). No segment will be added.`,
      );
      return;
    }
    if (start === end) {
      // When a spell is made instant from a proc, it often shows as a zero-time channel.
      // We can safely ignore these when calculating active time, as we'll capture the actual
      // active time through the GCD.
      return;
    }

    this.activeTimeEdges.push({ timestamp: start, value: 1, isHealingAbility });
    this.activeTimeEdges.push({ timestamp: end, value: -1, isHealingAbility });
    /*
     * segements and total active time need to be regenerated after data is added,
     * but won't actually be computed until queried (hopefully at end of fight)
     */
    this.workingActiveTimeSegments = undefined;
    this.activeTimeMemo = undefined;
  }

  /**
   * Generates working active time segements if needed. Most likely no one queries the
   * activeTimeSegments until after processing is complete, in which case this function will be
   * called only once.
   *
   * Algorithm for turning edges into segments:
   * activeTimeEdges represent when arbitrarily overlapping individual active time segments start
   * or stop. If we sort them in chronological order and then step through while incrementing the
   * counter an activity start edge and decrementing the counter on an activity end edge, we can
   * detect inactivity time (when counter is 0) and activity time (when counter is greater than 0).
   * Use this to generate the segment's union, which will be non-overlapping and in order.
   */
  private checkAndGenerateActiveTimeSegments(
    workingSegments: ActivitySegment[] | undefined,
    healingOnly?: boolean,
  ): ActivitySegment[] {
    if (workingSegments !== undefined) {
      return workingSegments;
    }

    this.activeTimeEdges.sort((a, b) => a.timestamp - b.timestamp);

    let activityCount = 0;
    let activityStartTimestamp = 0;
    workingSegments = [];
    for (const e of this.activeTimeEdges) {
      if (healingOnly && !e.isHealingAbility) {
        continue;
      } else if (activityCount === 0 && e.value === 1) {
        // upwards edge - activity started
        activityStartTimestamp = e.timestamp;
        DEBUG && console.log(`Starting segment at ${this.owner.formatTimestamp(e.timestamp, 3)}`);
      } else if (activityCount === 1 && e.value === -1) {
        // downwards edge - activity ended
        workingSegments.push({ start: activityStartTimestamp, end: e.timestamp });
        DEBUG && console.log(`Ending segment at ${this.owner.formatTimestamp(e.timestamp, 3)}`);
      }
      activityCount += e.value;
    }

    return workingSegments;
  }

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC GETTERS
  //

  get activeTimeSegments() {
    this.workingActiveTimeSegments = this.checkAndGenerateActiveTimeSegments(
      this.workingActiveTimeSegments,
    );
    return this.workingActiveTimeSegments;
  }

  get activeHealingTimeSegments() {
    this.workingActiveHealingTimeSegments = this.checkAndGenerateActiveTimeSegments(
      this.workingActiveHealingTimeSegments,
      true,
    );
    return this.workingActiveHealingTimeSegments;
  }

  /** The active time (in ms) recorded */
  get activeTime() {
    if (
      this.activeTimeMemo === undefined ||
      this.owner.fight.start_time !== this.memoStartTime ||
      this.owner.fight.end_time !== this.memoEndTime
    ) {
      this.memoStartTime = this.owner.fight.start_time;
      this.memoEndTime = this.owner.fight.end_time;
      this.activeTimeMemo = this.getActiveTimeMillisecondsInWindow(
        this.memoStartTime,
        this.memoEndTime,
      );
    }
    return this.activeTimeMemo;
  }

  /** Percentage of fight time spent active */
  get activeTimePercentage() {
    return this.activeTime / this.owner.fightDuration;
  }

  /** The amount of milliseconds not spent casting anything or waiting for the GCD. */
  get totalTimeWasted() {
    return this.owner.fightDuration - this.activeTime;
  }

  /** Percentage of fight time spent not active */
  get downtimePercentage() {
    return 1 - this.activeTimePercentage;
  }

  /** Gets active time milliseconds within a specified time segment.
   *  Will only see casts that have happened on or before the current timestamp. */
  getActiveTimeMillisecondsInWindow(start: number, end: number, healingOnly?: boolean): number {
    if (start >= end) {
      console.warn(`ActiveTime: called getActiveTimeMillisecondsInWindow with start
        (${this.owner.formatTimestamp(start, 3)}) after end
        (${this.owner.formatTimestamp(end, 3)}). Returning zero.`);
      return 0;
    }

    let activeTimeTally = 0;
    const segments = healingOnly ? this.activeHealingTimeSegments : this.activeTimeSegments;
    for (const seg of segments) {
      if (seg.end <= start) {
        continue;
      }
      if (seg.start >= end) {
        break;
      }
      const clampedStart = Math.max(start, seg.start);
      const clampedEnd = Math.min(end, seg.end);
      activeTimeTally += clampedEnd - clampedStart;
    }
    return activeTimeTally;
  }

  /** Gets active time percentage within a specified time segment.
   *  This will not work properly unless the current timestamp advances past the end time. */
  getActiveTimePercentageInWindow(start: number, end: number): number {
    const windowDuration = end - start;
    return this.getActiveTimeMillisecondsInWindow(start, end) / windowDuration;
  }

  /////////////////////////////////////////////////////////////////////////////
  // DEFAULT SUGGESTION + STATISTIC STUFF
  //

  showStatistic = true;
  position = STATISTIC_ORDER.CORE(10);

  statistic() {
    const boss = this.owner.boss;
    if (!this.showStatistic || (boss && boss.fight.disableDowntimeStatistic)) {
      return null;
    }
    if (!this.globalCooldown.isAccurate) {
      return null;
    }

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
                <img src="/img/sword.png" alt="Active time" />
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
                <img src="/img/afk.png" alt="Downtime" />
              </div>
            </Tooltip>
          </div>
        }
      />
    );
  }

  /**
   * Suggestion threshold for gaps between GCDs. The scale is gaps per minute.
   */
  get smallGapsSuggestionThreshold(): IsGreaterThanThreshold {
    return {
      actual: this.smallGapsPerMinute,
      isGreaterThan: {
        minor: 8,
        average: 10,
        major: 12,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get smallGapsPerMinute(): number {
    return this.smallGaps.length / (this.owner.fightDuration / 60000);
  }

  get smallGaps(): ActivitySegment[] {
    const gaps = [];
    let previousSegment = undefined;
    for (const segment of this.activeTimeSegments) {
      if (previousSegment) {
        const gapTime = segment.start - previousSegment.end;
        if (gapTime > SMALL_GAP_MIN_MS && gapTime < SMALL_GAP_MAX_MS) {
          gaps.push({
            start: previousSegment.end,
            end: segment.start,
          });
        }
      }

      previousSegment = segment;
    }

    return gaps;
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

type IsGreaterThanThreshold = Pick<NumberThreshold, 'actual' | 'isGreaterThan' | 'style'>;
