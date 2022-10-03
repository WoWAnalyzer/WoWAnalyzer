import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, TooltipElement } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';

import {
  PRIMAL_WRATH_RIP_DURATION_BASE,
  PRIMAL_WRATH_RIP_DURATION_PER_CP,
  RIP_DURATION_BASE,
  RIP_DURATION_PER_CP,
} from 'analysis/retail/druid/feral/constants';
import {
  getHardcast,
  getPrimalWrath,
} from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import Snapshots, {
  BLOODTALONS_SPEC,
  SnapshotSpec,
  TIGERS_FURY_SPEC,
} from 'analysis/retail/druid/feral/modules/core/Snapshots';
import { TALENTS_DRUID } from 'common/TALENTS';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

class RipUptimeAndSnapshots extends Snapshots {
  static dependencies = {
    ...Snapshots.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  earlyRefreshTimeLost: number = 0;

  constructor(options: Options) {
    super(SPELLS.RIP, SPELLS.RIP, [TIGERS_FURY_SPEC, BLOODTALONS_SPEC], options);
  }

  getDotExpectedDuration(event: ApplyDebuffEvent | RefreshDebuffEvent): number {
    const fromHardcast = getHardcast(event);
    if (fromHardcast) {
      return (
        RIP_DURATION_BASE +
        RIP_DURATION_PER_CP * getResourceSpent(fromHardcast, RESOURCE_TYPES.COMBO_POINTS)
      );
    }
    const fromPrimalWrath = getPrimalWrath(event);
    if (fromPrimalWrath) {
      return (
        PRIMAL_WRATH_RIP_DURATION_BASE +
        PRIMAL_WRATH_RIP_DURATION_PER_CP *
          getResourceSpent(fromPrimalWrath, RESOURCE_TYPES.COMBO_POINTS)
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
    const breakpoints = { minor: 0.85, average: 0.6, major: 0.4 };
    return {
      actual: this.percentWithTigerFury,
      isLessThan: breakpoints,
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
          , don't wait for it to wear off. Avoid spending combo points on{' '}
          <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> if <SpellLink id={SPELLS.RIP.id} /> will need
          refreshing soon.
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
    when(this.tigersFurySnapshotThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to maximize the time your <SpellLink id={SPELLS.RIP.id} /> is empowered by{' '}
          <SpellLink id={SPELLS.TIGERS_FURY.id} />. Tiger's Fury buffs Rip for its full duration,
          the trick is to target your Rip refreshes to occur during Tiger's Fury. It can be
          acceptable to refresh a little early or late to accomplish this, but not more than a few
          seconds in either direction.
        </>,
      )
        .icon(SPELLS.RIP.icon)
        .actual(`${formatPercentage(actual, 1)}% of Rip uptime had Tiger's Fury snapshot`)
        .recommended(`>${formatPercentage(recommended, 1)}% is recommended`),
    );
    // TODO move this to bloodtalons module?
    if (this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_FERAL_TALENT)) {
      when(this.bloodTalonsSnapshotThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            Try to always empower your <SpellLink id={SPELLS.RIP.id} /> with{' '}
            <SpellLink id={TALENTS_DRUID.BLOODTALONS_FERAL_TALENT.id} />. Bloodtalons buffs Rip for
            its full duration, and you should always have a proc available when refreshing Rip.
          </>,
        )
          .icon(TALENTS_DRUID.BLOODTALONS_FERAL_TALENT.icon)
          .actual(`${formatPercentage(actual, 1)}% of Rip uptime had Bloodtalons snapshot`)
          .recommended(`>${formatPercentage(recommended, 1)}% is recommended`),
      );
    }
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
