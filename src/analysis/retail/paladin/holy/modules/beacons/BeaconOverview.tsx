import type { JSX } from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import CastOverview, { StatisticData } from 'interface/guide/components/CastOverview';
import GuideSection from 'interface/guide/components/GuideSection';
import Analyzer from 'parser/core/Analyzer';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';
import DirectBeaconHealing from './DirectBeaconHealing';
import FailedBeaconTransfers from './FailedBeaconTransfers';
import MissingBeacons from './MissingBeacons';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';

/**
 * Taken from the suggestion thresholds on DirectBeaconHealing, which had no consumer.
 * Healing your beacon target directly is the waste here: the transfer already heals them,
 * so a direct heal on top of it buys you far less than the same heal on anyone else.
 */
const DIRECT_BEACON_THRESHOLDS = {
  perfect: 0.2,
  good: 0.25,
  ok: 0.35,
};

/**
 * What the beacons actually did, beyond how long they were up.
 *
 * Uptime says nothing about whether the healing reached them. Healing lost to line of
 * sight is a positioning problem, healing lost to a dropped beacon is a reapplication
 * problem, and healing aimed at the beacon itself is a targeting problem.
 */
class BeaconOverview extends Analyzer {
  static dependencies = {
    directBeaconHealing: DirectBeaconHealing,
    failedBeaconTransfers: FailedBeaconTransfers,
    missingBeacons: MissingBeacons,
  };

  protected directBeaconHealing!: DirectBeaconHealing;
  protected failedBeaconTransfers!: FailedBeaconTransfers;
  protected missingBeacons!: MissingBeacons;

  /** Beacon of Virtue reapplies its own beacons, so a missing one is not a mistake. */
  private get tracksMissingBeacons() {
    return !this.selectedCombatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT);
  }

  get directBeaconPercentage() {
    const value = this.directBeaconHealing.totalHealsOnBeaconPercentage;
    return Number.isFinite(value) ? value : 0;
  }

  private get explanation() {
    return (
      <>
        <p>
          Your beacons copy a share of your healing onto whoever holds them, so most of what matters
          is not how long they were up but whether that copy reached them and whether you spent your
          own casts wisely given it.
        </p>
        <p>
          Healing your beacon target directly is the main way to waste this. The transfer already
          heals them, so the same cast on anyone else does more. Healing lost to line of sight is a
          positioning problem instead -- the transfer simply fails when they cannot be reached.
        </p>
      </>
    );
  }

  private get stats(): StatisticData[] {
    const stats: StatisticData[] = [
      {
        value: `${formatPercentage(this.directBeaconPercentage, 0)}%`,
        label: 'Healing On Beacon',
        tooltip: (
          <>
            The share of your beacon transferring healing that landed on a beacon target directly.
            They are already being healed by the transfer, so this is healing that would have been
            worth more on someone else.
          </>
        ),
        performance: evaluateQualitativePerformanceByThreshold({
          actual: this.directBeaconPercentage,
          isLessThanOrEqual: DIRECT_BEACON_THRESHOLDS,
        }),
      },
      {
        value: formatNumber(this.failedBeaconTransfers.lostBeaconHealing),
        label: 'Lost To Line Of Sight',
        tooltip: (
          <>
            Raw healing that never reached a beacon target because they were out of line of sight or
            phased. Approximate, and usually a sign of where you or they were standing.
          </>
        ),
      },
    ];

    if (this.tracksMissingBeacons) {
      stats.push({
        value: formatNumber(this.missingBeacons.lostBeaconHealing),
        label: 'Lost To Missing Beacon',
        tooltip: (
          <>
            Raw healing that did not transfer because a beacon was not on anyone. Reapply{' '}
            <SpellLink spell={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF} /> promptly when it drops.
          </>
        ),
      });
    }

    return stats;
  }

  get guideSubsection(): JSX.Element {
    return (
      <GuideSection
        explanation={this.explanation}
        explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
      >
        <CastOverview
          spell={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF}
          title="Beacon Overview"
          stats={this.stats}
        />
      </GuideSection>
    );
  }
}

export default BeaconOverview;
