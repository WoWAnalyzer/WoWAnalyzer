import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ClosedTimePeriod, mergeTimePeriods, OpenTimePeriod } from 'parser/core/mergeTimePeriods';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import React from 'react';
import UptimeBar from 'parser/ui/UptimeBar';
import UptimeStackBar from 'parser/ui/UptimeStackBar';

const DURATION_MS = 30000;
const TICK_MS = 2000;
const EFFLO_COLOR = '#bb0044';

class Efflorescence extends Analyzer {
  /** list of time periods when efflo was active */
  effloUptimes: OpenTimePeriod[] = [];
  /** true iff we've seen at least one Efflo cast */
  hasCast: boolean = false;

  /** a chronological listing of timestamps when efflo healed, and how many targets it healed */
  effloTimes: EffloTime[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EFFLORESCENCE_CAST),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EFFLORESCENCE_HEAL),
      this.onHeal,
    );
  }

  onCast(event: CastEvent) {
    this.hasCast = true;
    this.effloUptimes.push({ start: event.timestamp });
    this.effloTimes.push({timestamp: event.timestamp, targets: 0, start: true});
  }

  onHeal(event: HealEvent) {
    // only way to detect precasts if by looking for heal events before the first cast
    // assume the efflo lasted until the last detected heal that happens before first cast
    if (!this.hasCast) {
      if (this.effloUptimes.length === 0) {
        this.effloUptimes.push({ start: this.owner.fight.start_time });
        this.effloTimes.push({timestamp: this.owner.fight.start_time, targets: 0, start: true});
      }
      this.effloUptimes[0].end = event.timestamp;
    }

    // update heal times list
    if (this.effloTimes.length > 0) {
      const latestHeal = this.effloTimes[this.effloTimes.length-1];
      if (latestHeal.timestamp === event.timestamp) {
        latestHeal.targets += 1;
      } else {
        this.effloTimes.push({timestamp: event.timestamp, targets: 1});
      }
    }
  }

  _mergeAndCapUptimes(): ClosedTimePeriod[] {
    this.effloUptimes.forEach((ut) => {
      if (ut.end === undefined) {
        ut.end = Math.min(ut.start + DURATION_MS, this.owner.currentTimestamp);
      }
    });
    return mergeTimePeriods(this.effloUptimes, this.owner.currentTimestamp);
  }

  _buildTargetsUptimes(): StackTimePeriod[] {
    const stackTimePeriods: StackTimePeriod[] = [];

    let prev: EffloTime | undefined = undefined;
    this.effloTimes.forEach(et => {
      if (prev && !et.start) {
        // TODO this is slightly too generous to 'zero ticks' because it reaches back an unhasted tick duration
        const prevTime = Math.max(prev.timestamp, et.timestamp - TICK_MS);
        stackTimePeriods.push({start: prevTime, end: et.timestamp, stacks: et.targets});
      }
      prev = et;
    });

    return stackTimePeriods;
  }

  get uptime() {
    return this._mergeAndCapUptimes().reduce((acc, ut) => acc + ut.end - ut.start, 0);
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    // TODO make more strict
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.9,
        average: 0.5,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> uptime can be improved.
        </span>,
      )
        .icon(SPELLS.EFFLORESCENCE_CAST.icon)
        .actual(
          t({
            id: 'druid.restoration.efflorescence.uptime',
            message: `${formatPercentage(this.uptimePercent)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );

    // TODO suggestion for early refreshes
  }

  // Custom statistic shows efflo targets hit with bar thickness
  // TODO generalize this if other stacking things want to use it?
  subStatistic() {
    return (
      <div className="flex-main multi-uptime-bar">
        <div className="flex main-bar-big">
          <div className="flex-sub bar-label">
            <SpellIcon key={'Icon-' + SPELLS.EFFLORESCENCE_CAST.name} id={SPELLS.EFFLORESCENCE_CAST.id} />{' '}
            TODO <small>uptime</small>
          </div>
          <div className="flex-main chart">
            <UptimeStackBar
              stackUptimeHistory={this._buildTargetsUptimes()}
              start={this.owner.fight.start_time}
              end={this.owner.fight.end_time}
              maxStacks={3}
              barColor={EFFLO_COLOR}
            />
          </div>
        </div>
      </div>
    );
  }

  // subStatistic() {
  //   return uptimeBarSubStatistic(
  //     this.owner.fight,
  //     {
  //       spells: [SPELLS.EFFLORESCENCE_CAST],
  //       uptimes: this._mergeAndCapUptimes(),
  //       color: EFFLO_COLOR,
  //     },
  //     [],
  //     SubPercentageStyle.ABSOLUTE,
  //   );
  // }
}

/**
 * Record of the start of each efflo and also each of its heal ticks.
 * The first tick happens one tick period after the efflo is spawned,
 * and the last tick happens at roughly the same time as the despawn,
 * so when applying time periods for each tick we will extend backwards from when it happened.
 */
type EffloTime = {
  /** The time of this event in milliseconds */
  timestamp: number,
  /** The number of targets hit by this event (or zero for a start event) */
  targets: number,
  /** True iff this event represents the start of an efflo */
  start?: boolean,
}

type StackTimePeriod = {
  /** Timestamp in milliseconds of the time period start */
  start: number,
  /** Timestamp in milliseconds of the time period end */
  end: number,
  /** Number of stacks present during this time period */
  stacks: number,
}

export default Efflorescence;
