import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, TooltipElement } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';

import { RAKE_BASE_DURATION } from '../../constants';
import { getHardcast, isFromHardcast } from '../../normalizers/CastLinkNormalizer';
import Snapshots, { hasSpec, PROWL_SPEC, SnapshotSpec, TIGERS_FURY_SPEC } from '../core/Snapshots';

const MAX_RAKE_PROWL_DOWNGRADE_TIME = 2000;

class RakeUptimeAndSnapshots extends Snapshots {
  static dependencies = {
    ...Snapshots.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  prowlRakeTimeLost: number = 0;

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
    // note if player downgrades a Prowl Rake
    if (
      prevSnapshots !== null &&
      hasSpec(prevSnapshots, PROWL_SPEC) &&
      !hasSpec(snapshots, PROWL_SPEC) &&
      isFromHardcast(application) // don't count accidental downgrades from Convoke
    ) {
      this.prowlRakeTimeLost += remainingOnPrev;
      if (remainingOnPrev >= MAX_RAKE_PROWL_DOWNGRADE_TIME) {
        const cast = getHardcast(application);
        if (cast) {
          cast.meta = {
            isInefficientCast: true,
            inefficientCastReason: `This cast overwrote more than ${(
              MAX_RAKE_PROWL_DOWNGRADE_TIME / 1000
            ).toFixed(
              1,
            )} seconds of Prowl buffed Rake. The damage boost from Prowl (or Shadowmeld or Incarnation) is
          very large and when your refresh won't be buffed by it you should avoid refreshing until the last moment.`,
          };
        }
      }
    }
  }

  get uptimePercent() {
    return this.getTotalDotUptime() / this.owner.fightDuration;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.RAKE_BLEED.id);
  }

  get prowlSecondsLostPerMinute() {
    return this.owner.getPerMinute(this.prowlRakeTimeLost / 1000);
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
    // rake is often used for proccing BT, so harder to maintain snapshots
    const breakpoints = this.selectedCombatant.hasTalent(SPELLS.BLOODTALONS_TALENT)
      ? { minor: 0.6, average: 0.45, major: 0.3 }
      : { minor: 0.85, average: 0.6, major: 0.4 };
    return {
      actual: this.percentWithTigerFury,
      isLessThan: breakpoints,
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get prowlLostThresholds() {
    return {
      actual: this.prowlSecondsLostPerMinute,
      isGreaterThan: {
        minor: 2, // a little bit of cutoff on the refresh is probably inevitable
        average: 4,
        major: 6,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

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
            message: `${formatPercentage(actual, 1)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
    when(this.tigersFurySnapshotThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to maximize the time your <SpellLink id={SPELLS.RAKE.id} /> is empowered by{' '}
          <SpellLink id={SPELLS.TIGERS_FURY.id} />. Tiger's Fury buffs Rake for its full duration,
          the trick is to target your Rake refreshes to occur during Tiger's Fury. It's acceptable
          to refresh early to accomplish this, for example refreshing right after casting Tiger's
          Fury and then again right before it wears off.
          <br />
          <br />
          Still, 100% snapshot uptime isn't practically possible and the impact of this is
          relatively minor - don't screw up your rotation just to get better snapshotting.
          {this.selectedCombatant.hasTalent(SPELLS.BLOODTALONS_TALENT) && (
            <>
              {' '}
              This is especcially true with <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> - Raking
              to gain a proc takes precedence over good snapshots.
            </>
          )}
        </>,
      )
        .icon(SPELLS.RAKE.icon)
        .actual(`${formatPercentage(actual, 1)}% of Rake uptime had Tiger's Fury snapshot`)
        .recommended(`>${formatPercentage(recommended, 1)}% is recommended`),
    );
    when(this.prowlLostThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          When <SpellLink id={SPELLS.RAKE.id} /> is empowered by <SpellLink id={SPELLS.PROWL.id} />{' '}
          avoid refreshing it unless the replacement would also be empowered. You cut off{' '}
          {(this.prowlRakeTimeLost / 1000).toFixed(1)} seconds of empowered{' '}
          <SpellLink id={SPELLS.RAKE.id} /> bleed time over the encounter.
        </>,
      )
        .icon(SPELLS.RAKE.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.rakeSnapshot.prowlBuffed',
            message: `${actual.toFixed(1)} seconds of Prowl buffed Rake was lost per minute.`,
          }),
        )
        .recommended(`none is recommended`),
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

export default RakeUptimeAndSnapshots;
