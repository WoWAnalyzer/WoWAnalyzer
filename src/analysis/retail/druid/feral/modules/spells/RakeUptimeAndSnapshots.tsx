import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, TooltipElement } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';

import { getRakeDuration, SNAPSHOT_DOWNGRADE_BUFFER } from 'analysis/retail/druid/feral/constants';
import { getHardcast } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import Snapshots, {
  hasSpec,
  PROWL_SPEC,
  SnapshotSpec,
  TIGERS_FURY_SPEC,
} from 'analysis/retail/druid/feral/modules/core/Snapshots';
import { TALENTS_DRUID } from 'common/TALENTS';
import { proccedBloodtalons } from 'analysis/retail/druid/feral/normalizers/BloodtalonsLinkNormalizer';
import { SubSection } from 'interface/guide';
import { PerformanceBoxRow } from 'parser/ui/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class RakeUptimeAndSnapshots extends Snapshots {
  static dependencies = {
    ...Snapshots.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  prowlRakeTimeLost: number = 0;

  castLog: RakeCast[] = [];

  constructor(options: Options) {
    super(SPELLS.RAKE, SPELLS.RAKE_BLEED, [TIGERS_FURY_SPEC, PROWL_SPEC], options);
  }

  getDotExpectedDuration(): number {
    return getRakeDuration(this.selectedCombatant);
  }

  getDotFullDuration(): number {
    return getRakeDuration(this.selectedCombatant);
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
    const cast = getHardcast(application);
    if (!cast) {
      return; // no handling needed for 'uncontrolled' rakes from DCR or Convoke
    }

    // log the cast
    const timestamp = cast.timestamp;
    const targetName = this.enemies.getEntity(cast)?.name;
    const proccedBt = proccedBloodtalons(cast);
    const snapshotNames = snapshots.map((ss) => ss.name);
    const prevSnapshotNames = prevSnapshots === null ? null : prevSnapshots.map((ss) => ss.name);
    const wasUnacceptableDowngrade =
      prevPower > power && remainingOnPrev > SNAPSHOT_DOWNGRADE_BUFFER;
    const wasUpgrade = prevPower < power;
    this.castLog.push({
      timestamp,
      targetName,
      proccedBt,
      remainingOnPrev,
      clipped,
      snapshotNames,
      prevSnapshotNames,
      wasUnacceptableDowngrade,
      wasUpgrade,
    });

    // note if player downgrades a Prowl Rake
    if (
      prevSnapshots !== null &&
      hasSpec(prevSnapshots, PROWL_SPEC) &&
      !hasSpec(snapshots, PROWL_SPEC)
    ) {
      this.prowlRakeTimeLost += remainingOnPrev;
      if (remainingOnPrev > SNAPSHOT_DOWNGRADE_BUFFER) {
        cast.meta = {
          isInefficientCast: true,
          inefficientCastReason: `This cast overwrote more than ${(
            SNAPSHOT_DOWNGRADE_BUFFER / 1000
          ).toFixed(
            1,
          )} seconds of Prowl buffed Rake. The damage boost from Prowl (or Shadowmeld or Incarnation) is
        very large and when your refresh won't be buffed by it you should avoid refreshing until the last moment.`,
        };
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

  get guideSubsection(): JSX.Element {
    const castPerfBoxes = this.castLog.map((cast) => {
      let value: QualitativePerformance = 'good';
      if (!cast.proccedBt) {
        if (cast.wasUnacceptableDowngrade) {
          value = 'fail';
        }
        if (cast.clipped > 0) {
          value = cast.wasUpgrade ? 'ok' : 'fail';
        }
      }

      const tooltip = (
        <>
          @ <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong> targetting{' '}
          <strong>{cast.targetName || 'unknown'}</strong>
          <br />
          {cast.proccedBt && (
            <>
              Used to proc{' '}
              <strong>
                <SpellLink id={TALENTS_DRUID.BLOODTALONS_FERAL_TALENT.id} />
              </strong>
              <br />
            </>
          )}
          {cast.prevSnapshotNames !== null && (
            <>
              Refreshed on target w/ {(cast.remainingOnPrev / 1000).toFixed(1)}s remaining{' '}
              {cast.clipped > 0 && (
                <>
                  <strong>- Clipped {(cast.clipped / 1000).toFixed(1)}s!</strong>
                </>
              )}
              <br />
            </>
          )}
          Snapshots:{' '}
          <strong>
            {cast.snapshotNames.length === 0 ? 'NONE' : cast.snapshotNames.join(', ')}
          </strong>
          <br />
          {cast.prevSnapshotNames !== null && (
            <>
              Prev Snapshots:{' '}
              <strong>
                {cast.prevSnapshotNames.length === 0 ? 'NONE' : cast.prevSnapshotNames.join(', ')}
              </strong>
            </>
          )}
        </>
      );
      return {
        value,
        tooltip,
      };
    });
    const hasBt = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_FERAL_TALENT);
    return (
      <SubSection>
        <p>
          <b>
            <SpellLink id={SPELLS.RAKE.id} />
          </b>{' '}
          is your highest damage-per-energy single target builder. Try to keep it active on all
          targets (except when in a many-target AoE situation). Rake snapshots{' '}
          <SpellLink id={SPELLS.TIGERS_FURY.id} /> and{' '}
          <SpellLink id={TALENTS_DRUID.POUNCING_STRIKES_FERAL_TALENT.id} /> - when forced to refresh
          with a weaker snapshot, try to wait until the last moment in order to overwrite the
          minimum amount of the stronger DoT.
          {hasBt && (
            <>
              {' '}
              It's always acceptable to do a sub-optimal Rake cast if needed to proc{' '}
              <SpellLink id={TALENTS_DRUID.BLOODTALONS_FERAL_TALENT.id} />.
            </>
          )}
        </p>
        <strong>Rake uptime / snapshots</strong>
        <small> - Try to get as close to 100% as the encounter allows!</small>
        {this.subStatistic()}
        <strong>Rake casts</strong>
        <small>
          {' '}
          - Green is a good cast{' '}
          {hasBt && (
            <>
              (or a cast with problems that procced{' '}
              <SpellLink id={TALENTS_DRUID.BLOODTALONS_FERAL_TALENT.id} />)
            </>
          )}
          , Yellow is an ok cast (clipped duration but upgraded snapshot), Red is a bad cast
          (clipped duration or downgraded snapshot w/ &gt;2s remaining). Mouseover for more details.
        </small>
        <PerformanceBoxRow values={castPerfBoxes} />
      </SubSection>
    );
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
    const breakpoints = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_FERAL_TALENT)
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
          {this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_FERAL_TALENT) && (
            <>
              {' '}
              This is especcially true with{' '}
              <SpellLink id={TALENTS_DRUID.BLOODTALONS_FERAL_TALENT.id} /> - Raking to gain a proc
              takes precedence over good snapshots.
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

/** Tracking object for each rake cast */
type RakeCast = {
  /** Cast's timestamp */
  timestamp: number;
  /** Name of cast's target */
  targetName?: string;
  /** If the cast was involved in proccing Bloodtalons */
  proccedBt: boolean;
  /** Time remaining on previous Rake */
  remainingOnPrev: number;
  /** Time clipped from previous Rake */
  clipped: number;
  /** Name of snapshots on new cast */
  snapshotNames: string[];
  /** Name of snapshots on prev cast (or null for fresh application) */
  prevSnapshotNames: string[] | null;
  /** True iff snapshots were downgraded with more than buffer time remaining */
  wasUnacceptableDowngrade: boolean;
  /** True iff the snapshot got stronger */
  wasUpgrade: boolean;
};

export default RakeUptimeAndSnapshots;
