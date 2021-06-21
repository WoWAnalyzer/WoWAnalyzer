import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, TooltipElement } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import React from 'react';

import { RAKE_BASE_DURATION } from '../../constants';
import Snapshots2, { PROWL_SPEC, SnapshotSpec, TIGERS_FURY_SPEC } from '../core/Snapshots2';

class RakeUptime extends Snapshots2 {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(SPELLS.RAKE, SPELLS.RAKE_BLEED, [TIGERS_FURY_SPEC, PROWL_SPEC], options);
  }

  getDotExpectedDuration(): number {
    return RAKE_BASE_DURATION;
  }

  getDotFullDuration(): number {
    return RAKE_BASE_DURATION;
  }

  getTotalDotUptime(): number {
    return this.enemies.getBuffUptime(SPELLS.RAKE_BLEED.id);
  }

  handleApplication(
    application: ApplyDebuffEvent | RefreshDebuffEvent,
    snapshots: SnapshotSpec[],
    prevSnapshots: SnapshotSpec[] | null,
    power: number,
    prevPower: number,
    remainingOnPrev: number,
    clipped: number,
  ) {
    // TODO track downgrades
    // TODO track non-upgrade clips
  }

  get uptimePercent() {
    return this.getTotalDotUptime() / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.RAKE_BLEED.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get tigersFurySnapshotThresholds() {
    // TODO friendlier when player has BT
    return {
      actual: this.percentWithTigerFury,
      isLessThan: {
        minor: 0.85,
        average: 0.6,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  // TODO should we bother with a prowl suggestion? Depends on many things.

  // TODO snapshot suggestions
  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.RAKE.id} /> uptime can be improved. Unless the current
          application was buffed by Prowl you should refresh the DoT once it has reached its{' '}
          <TooltipElement content="The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.">
            pandemic window
          </TooltipElement>
          , don't wait for it to wear off.
        </>,
      )
        .icon(SPELLS.RAKE.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.rake.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.RAKE_BLEED],
        uptimes: this.uptimeHistory,
      },
      this.snapshotUptimes,
      SubPercentageStyle.RELATIVE,
    );
  }
}

export default RakeUptime;
