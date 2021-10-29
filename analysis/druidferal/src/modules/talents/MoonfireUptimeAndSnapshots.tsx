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

import { MOONFIRE_FERAL_BASE_DURATION } from '../../constants';
import Snapshots, { SnapshotSpec, TIGERS_FURY_SPEC } from '../core/Snapshots';

class MoonfireUptimeAndSnapshots extends Snapshots {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(SPELLS.MOONFIRE_FERAL, SPELLS.MOONFIRE_FERAL, [TIGERS_FURY_SPEC], options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id);
  }

  getDotExpectedDuration(): number {
    return MOONFIRE_FERAL_BASE_DURATION;
  }

  getDotFullDuration(): number {
    return MOONFIRE_FERAL_BASE_DURATION;
  }

  getTotalDotUptime(): number {
    return this.enemies.getBuffUptime(SPELLS.MOONFIRE_FERAL.id);
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
    return this.enemies.getDebuffHistory(SPELLS.MOONFIRE_FERAL.id);
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
    // MF is often used for proccing BT, so harder to maintain snapshots
    const breakpoints = this.selectedCombatant.hasTalent(SPELLS.BLOODTALONS_TALENT)
      ? { minor: 0.6, average: 0.45, major: 0.3 }
      : { minor: 0.85, average: 0.6, major: 0.4 };
    return {
      actual: this.percentWithTigerFury,
      isLessThan: breakpoints,
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  // TODO snapshot suggestions
  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.MOONFIRE_FERAL.id} /> uptime can be improved. You should
          refresh the DoT once it has reached its{' '}
          <TooltipElement content="The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.">
            pandemic window
          </TooltipElement>
          , don't wait for it to wear off. You may wish to consider switching talents to{' '}
          <SpellLink id={SPELLS.SABERTOOTH_TALENT.id} /> which is simpler to use and provides more
          damage in most situations.
        </>,
      )
        .icon(SPELLS.MOONFIRE_FERAL.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.moonfire.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
    when(this.tigersFurySnapshotThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to maximize the time your <SpellLink id={SPELLS.MOONFIRE_FERAL.id} /> is empowered by{' '}
          <SpellLink id={SPELLS.TIGERS_FURY.id} />. Tiger's Fury buffs Moonfire for its full
          duration, the trick is to target your Moonfire refreshes to occur during Tiger's Fury.
          It's acceptable to refresh early to accomplish this, for example refreshing right after
          casting Tiger's Fury and then again right before it wears off.
          <br />
          <br />
          Still, 100% snapshot uptime isn't practically possible and the impact of this is
          relatively minor - don't screw up your rotation just to get better snapshotting.
          {this.selectedCombatant.hasTalent(SPELLS.BLOODTALONS_TALENT) && (
            <>
              {' '}
              This is especcially true with <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> - MFing
              to gain a proc takes precedence over good snapshots.
            </>
          )}
        </>,
      )
        .icon(SPELLS.MOONFIRE_FERAL.icon)
        .actual(`${formatPercentage(actual, 1)}% of Moonfire uptime had Tiger's Fury snapshot`)
        .recommended(`>${formatPercentage(recommended, 1)}% is recommended`),
    );
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.MOONFIRE_FERAL],
        uptimes: this.uptimeHistory,
      },
      this.snapshotUptimes,
      SubPercentageStyle.RELATIVE,
    );
  }
}

export default MoonfireUptimeAndSnapshots;
