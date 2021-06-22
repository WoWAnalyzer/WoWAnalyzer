import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, TooltipElement } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, DamageEvent, RefreshDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import React from 'react';

import {
  PANDEMIC_FRACTION,
  PRIMAL_WRATH_RIP_DURATION_BASE,
  PRIMAL_WRATH_RIP_DURATION_PER_CP,
  RIP_DURATION_BASE,
  RIP_DURATION_PER_CP,
  SABERTOOTH_EXTEND_PER_CP,
} from '../../constants';
import { getHardcast, getPrimalWrath } from '../../normalizers/CastLinkNormalizer';
import getComboPointsFromEvent from '../core/getComboPointsFromEvent';
import Snapshots, { BLOODTALONS_SPEC, SnapshotSpec, TIGERS_FURY_SPEC } from '../core/Snapshots';

class RipUptimeAndSnapshots extends Snapshots {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  earlyRefreshTimeLost: number = 0;

  constructor(options: Options) {
    super(SPELLS.RIP, SPELLS.RIP, [TIGERS_FURY_SPEC, BLOODTALONS_SPEC], options);

    // apply the Rip extension if player has Sabertooth
    if (this.selectedCombatant.hasTalent(SPELLS.SABERTOOTH_TALENT)) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
        this.onSabertoothFb,
      );
    }
  }

  getDotExpectedDuration(event: ApplyDebuffEvent | RefreshDebuffEvent): number {
    const fromHardcast = getHardcast(event);
    if (fromHardcast) {
      return RIP_DURATION_BASE + RIP_DURATION_PER_CP * getComboPointsFromEvent(fromHardcast);
    }
    const fromPrimalWrath = getPrimalWrath(event);
    if (fromPrimalWrath) {
      return (
        PRIMAL_WRATH_RIP_DURATION_BASE +
        PRIMAL_WRATH_RIP_DURATION_PER_CP * getComboPointsFromEvent(fromPrimalWrath)
      );
    }

    console.warn(
      "Couldn't find what cast produced Rip application - assuming base duration",
      event,
    );
    return RIP_DURATION_BASE;
  }

  getDotFullDuration(): number {
    return RIP_DURATION_BASE + 5 * RIP_DURATION_PER_CP;
  }

  getTotalDotUptime(): number {
    return this.enemies.getBuffUptime(SPELLS.RIP.id);
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
    if (prevPower >= power && clipped > 0) {
      this.earlyRefreshTimeLost += clipped;
      const cast = getHardcast(application);
      if (cast) {
        cast.meta = {
          isInefficientCast: true,
          inefficientCastReason: `This cast clipped ${(clipped / 1000).toFixed(
            1,
          )} seconds of Rip time without upgrading the snapshot.
          Try to wait until the last 30% of Rip's duration before refreshing`,
        };
      }
    }
  }

  onSabertoothFb(event: DamageEvent) {
    const uptimesOnTarget = this.getUptimesForTarget(event);
    // if there is an active Rip on target, extend it
    if (
      uptimesOnTarget.length > 0 &&
      uptimesOnTarget[uptimesOnTarget.length - 1].end === undefined
    ) {
      const fromHardcast = getHardcast(event);
      // convoked FB acts as though used 5 CPs
      const cpsUsed = fromHardcast ? getComboPointsFromEvent(fromHardcast) : 5;
      uptimesOnTarget[uptimesOnTarget.length - 1].expectedEnd += SABERTOOTH_EXTEND_PER_CP * cpsUsed;
    }
  }

  get uptimePercent() {
    return this.getTotalDotUptime() / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.RIP.id);
  }

  get earlyRefreshTimeLostSecondsPerMinute() {
    return this.owner.getPerMinute(this.earlyRefreshTimeLost / 1000);
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
    // TODO less friendly when player has SbT
    return {
      actual: this.percentWithTigerFury,
      isLessThan: {
        minor: 0.8,
        average: 0.55,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get bloodTalonsSnapshotThresholds() {
    return {
      actual: this.percentWithBloodtalons,
      isLessThan: {
        minor: 0.95,
        average: 0.8,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get earlyRefreshThresholds() {
    return {
      actual: this.earlyRefreshTimeLostSecondsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 10,
        major: 20,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.RIP.id} /> uptime can be improved. You can refresh the DoT once
          it has reached its{' '}
          <TooltipElement content="The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.">
            pandemic window
          </TooltipElement>
          , don't wait for it to wear off.
          {!this.selectedCombatant.hasTalent(SPELLS.SABERTOOTH_TALENT.id) ? (
            <>
              {' '}
              Avoid spending combo points on <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> if{' '}
              <SpellLink id={SPELLS.RIP.id} /> will need refreshing soon.
            </>
          ) : (
            <></>
          )}
        </>,
      )
        .icon(SPELLS.RIP.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.rip.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
    when(this.earlyRefreshThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try not to refresh <SpellLink id={SPELLS.RIP.id} /> before the last 30% of its duration
          unless you are upgrading your snapshot. Refreshing before the last 30% causes you to clip
          duration - you probably should have used
          <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> instead.
        </>,
      )
        .icon(SPELLS.RIP.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.ripSnapshot.earlyRefresh',
            message: `You clipped ${(this.earlyRefreshTimeLost / 1000).toFixed(
              1,
            )} seconds of Rip time during the encounter`,
          }),
        )
        .recommended('None is recommended'),
    );
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.RIP],
        uptimes: this.uptimeHistory,
      },
      this.snapshotUptimes,
      SubPercentageStyle.RELATIVE,
    );
  }
}

export default RipUptimeAndSnapshots;
