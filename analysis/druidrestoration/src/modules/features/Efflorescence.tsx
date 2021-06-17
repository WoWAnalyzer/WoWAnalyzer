import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ClosedTimePeriod, mergeTimePeriods, OpenTimePeriod } from 'parser/core/mergeTimePeriods';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import React from 'react';

const DURATION = 30000;
const EFFLO_COLOR = '#bb0044';

class Efflorescence extends Analyzer {
  /** list of time periods when efflo was active */
  effloUptimes: OpenTimePeriod[] = [];
  /** true iff we've seen at least one Efflo cast */
  hasCast: boolean = false;

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
  }

  onHeal(event: HealEvent) {
    // only way to detect precasts if by looking for heal events before the first cast
    // assume the efflo lasted until the last detected heal that happens before first cast
    if (!this.hasCast) {
      if (this.effloUptimes.length === 0) {
        this.effloUptimes.push({ start: this.owner.fight.start_time });
      }
      this.effloUptimes[0].end = event.timestamp;
    }
  }

  _mergeAndCapUptimes(): ClosedTimePeriod[] {
    this.effloUptimes.forEach((ut) => {
      if (ut.end === undefined) {
        ut.end = Math.min(ut.start + DURATION, this.owner.currentTimestamp);
      }
    });
    return mergeTimePeriods(this.effloUptimes, this.owner.currentTimestamp);
  }

  get uptime() {
    return this._mergeAndCapUptimes().reduce((acc, ut) => acc + ut.end - ut.start, 0);
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
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

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.EFFLORESCENCE_CAST],
        uptimes: this._mergeAndCapUptimes(),
        color: EFFLO_COLOR,
      },
      [],
      SubPercentageStyle.ABSOLUTE,
    );
  }
}

export default Efflorescence;
