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

  /** Times when activity started or stopped. Start and end edges are always added as pairs and the
   *  end edge will always be after the start edge. These effective segments may overlap. */
  private activeTimeEdges: { timestamp: number; value: 1 | -1 }[] = [];
  /** If the activeTimeEdges list is currently sorted in time order */
  private hasUnprocessedData: boolean = false;
  /** Memoized total active time (ms) */
  private activeTimeMemo: number | undefined = 0;
  /** Segments when the player was active, in chronological order and non-overlapping.
   *  Access with {@link activeTimeSegments} to ensure they're fully generated */
  private workingActiveTimeSegments: { start: number; end: number }[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.GlobalCooldown, this.onGCD);
    this.addEventListener(Events.EndChannel, this.onEndChannel);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onGCD(event: GlobalCooldownEvent) {
    const start = event.timestamp;
    const end = event.timestamp + event.duration;
    this.addNewUptime(start, end, `${event.ability.name} GCD`);
    return true;
  }

  onEndChannel(event: EndChannelEvent) {
    const start = event.start;
    const end = event.timestamp;
    this.addNewUptime(start, end, `${event.ability.name} Channel`);
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

  /** Validates and logs inputs, then adds to activeTimeEdges list */
  private addNewUptime(start: number, end: number, reason: string) {
    DEBUG &&
      console.log(
        `Active Time: adding from ${reason}: ${this.owner.formatTimestamp(start, 3)} to ${this.owner.formatTimestamp(end, 3)}`,
      );
    if (end < start) {
      console.error(
        `ActiveTime: tried to add uptime with reason (${reason}) with start (${this.owner.formatTimestamp(start, 3)}) after end (${this.owner.formatTimestamp(end, 3)}). No segment will be added.`,
      );
      return;
    }
    if (start < this.owner.fight.start_time) {
      DEBUG &&
        console.log(`ActiveTime: uptime starts before fight start - clamping to fight start`);
    }
    if (end > this.owner.fight.end_time) {
      DEBUG && console.log(`ActiveTime: uptime ends after fight end - clamping to fight end`);
    }
    const clampedStart = Math.max(start, this.owner.fight.start_time);
    const clampedEnd = Math.min(end, this.owner.fight.end_time);

    if (clampedStart >= clampedEnd) {
      /*
       * Spells made instant by a proc often show as a zero-time channel - we can just ignore as
       * the active time will just be caught while handling the GCD.
       * Other possibility is a cast entirely before or after the fight time shows up here,
       * which we can also safely ignore.
       */
      return;
    }

    this.activeTimeEdges.push({ timestamp: clampedStart, value: 1 });
    this.activeTimeEdges.push({ timestamp: clampedEnd, value: -1 });
    // ideally stuff is only accessed after all events are processed and so we only need to
    // generate once, but adding robost memoization just in case
    this.hasUnprocessedData = true;
    this.activeTimeMemo = undefined;
  }

  /** Process new data if we have any - sorts the edges and uses them to generate segments. */
  private checkAndProcessData() {
    if (!this.hasUnprocessedData) {
      return;
    }

    this.activeTimeEdges.sort((a, b) => a.timestamp - b.timestamp);

    let activityCount = 0;
    let activityStartTimestamp = 0;
    this.workingActiveTimeSegments = [];
    this.activeTimeEdges.forEach((e) => {
      if (activityCount === 0 && e.value === 1) {
        // upwards edge - activity started
        activityStartTimestamp = e.timestamp;
      } else if (activityCount === 1 && e.value === -1) {
        // downwards edge - activity ended
        this.workingActiveTimeSegments.push({ start: activityStartTimestamp, end: e.timestamp });
      }
      activityCount += e.value;
    });

    this.hasUnprocessedData = false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC GETTERS
  //

  get activeTimeSegments() {
    this.checkAndProcessData();
    return this.workingActiveTimeSegments;
  }

  /** The active time (in ms) recorded */
  get activeTime() {
    if (this.activeTimeMemo === undefined) {
      this.activeTimeMemo = this.getActiveTimeMillisecondsInWindow();
    }
    return this.activeTimeMemo;
  }

  /** The amount of milliseconds not spent casting anything or waiting for the GCD. */
  get totalTimeWasted() {
    return this.owner.fightDuration - this.activeTime;
  }

  get downtimePercentage() {
    return 1 - this.activeTimePercentage;
  }

  get activeTimePercentage() {
    return this.activeTime / this.owner.fightDuration;
  }

  /** Gets active time milliseconds within a specified time segment.
   *  Will only see casts that have happened on or before the current timestamp.
   *  Omit start or end to unbound in that direction. */
  getActiveTimeMillisecondsInWindow(start?: number, end?: number): number {
    if (start !== undefined && end !== undefined && start >= end) {
      console.warn(
        `ActiveTime: called getActiveTimeMillisecondsInWindow with start (${this.owner.formatTimestamp(start, 3)}) after end (${this.owner.formatTimestamp(end, 3)}). Returning zero.`,
      );
      return 0;
    }

    let activeTimeTally = 0;
    for (const seg of this.activeTimeSegments) {
      if (start !== undefined && seg.end <= start) {
        continue;
      }
      if (end !== undefined && seg.start >= end) {
        break;
      }
      const clampedStart = start === undefined ? seg.start : Math.max(start, seg.start);
      const clampedEnd = end === undefined ? seg.end : Math.min(end, seg.end);
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
