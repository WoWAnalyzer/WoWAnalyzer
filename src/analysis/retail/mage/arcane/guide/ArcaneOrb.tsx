import { ReactNode, type JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Analyzer from 'parser/core/Analyzer';
import GuideSection from 'interface/guide/components/GuideSection';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';

import ArcaneOrb from '../analyzers/ArcaneOrb';

interface ArcaneOrbCast {
  timestamp: number;
  targetsHit: number;
  chargesBefore: number;
}

const ORB_EFFICIENT_CHARGE_THRESHOLD = 2;
const AOE_THRESHOLD = 2; // Perfect if hitting 2+ targets

class ArcaneOrbGuide extends Analyzer {
  static dependencies = {
    arcaneOrb: ArcaneOrb,
  };

  protected arcaneOrb!: ArcaneOrb;

  /**
   * Evaluates a single Arcane Orb cast for CastDetail.
   * Returns complete cast information including performance and stats.
   */
  private evaluateOrbCast(cast: ArcaneOrbCast): PerCastData {
    const hitTargets = cast.targetsHit > 0;
    const efficientCharges = cast.chargesBefore <= ORB_EFFICIENT_CHARGE_THRESHOLD;
    const multiTarget = cast.targetsHit >= AOE_THRESHOLD;

    // Determine overall performance
    let performance: QualitativePerformance;
    let notes: ReactNode;

    // Fail conditions
    if (!hitTargets) {
      performance = QualitativePerformance.Fail;
      notes = 'Failed to hit any targets - wasted cast';
    } else if (!efficientCharges) {
      performance = QualitativePerformance.Fail;
      notes = (
        <>
          Inefficient usage - already had {cast.chargesBefore}{' '}
          <SpellLink spell={SPELLS.ARCANE_CHARGE} />s (use at ≤{ORB_EFFICIENT_CHARGE_THRESHOLD}{' '}
          charges)
        </>
      );
    }
    // Perfect condition - hit multiple targets with efficient charges
    else if (hitTargets && efficientCharges && multiTarget) {
      performance = QualitativePerformance.Perfect;
      notes = (
        <>
          Perfect usage - {cast.targetsHit} targets hit with efficient charge usage (
          {cast.chargesBefore}/{ORB_EFFICIENT_CHARGE_THRESHOLD})
        </>
      );
    }
    // Good condition - hit target(s) with efficient charges
    else if (hitTargets && efficientCharges) {
      performance = QualitativePerformance.Good;
      notes = (
        <>
          Good usage - {cast.targetsHit} target(s) hit with efficient charge usage (
          {cast.chargesBefore}/{ORB_EFFICIENT_CHARGE_THRESHOLD})
        </>
      );
    }
    // Default fallback
    else {
      performance = QualitativePerformance.Fail;
      notes = 'Arcane Orb usage needs improvement';
    }

    // Build stats array
    const stats: PerCastStat[] = [];

    // Targets Hit
    stats.push({
      label: 'Targets Hit',
      value: `${cast.targetsHit}`,
      tooltip:
        cast.targetsHit >= AOE_THRESHOLD
          ? 'Great AoE value!'
          : cast.targetsHit > 0
            ? 'Hit at least one target'
            : 'Missed all targets',
    });

    // Charges Before Cast
    stats.push({
      label: 'Charges Before',
      value: `${cast.chargesBefore} / ${ORB_EFFICIENT_CHARGE_THRESHOLD}`,
      tooltip: efficientCharges
        ? 'Efficient - used with low charges'
        : `Too many charges (${cast.chargesBefore}) - should use at ≤${ORB_EFFICIENT_CHARGE_THRESHOLD}`,
    });

    // Charges Generated (always 2 minimum)
    const chargesGenerated = Math.max(2, cast.targetsHit);
    stats.push({
      label: 'Charges Generated',
      value: `${chargesGenerated}`,
      tooltip: 'Arcane Orb generates 2 charges minimum, +1 per additional target hit',
    });

    return {
      performance,
      timestamp: this.owner.formatTimestamp(cast.timestamp),
      stats,
      details: notes,
    };
  }

  get guideSubsection(): JSX.Element {
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;

    const explanation = (
      <>
        <b>{arcaneOrb}</b> primary purpose is to quickly generate {arcaneCharge}s, as it is an
        instant that generates at least 2 charges per cast, with an additional charge per target
        hit.
        <ul>
          <li>
            Try to use it on cooldown, but only when you have 2 or fewer {arcaneCharge}s to avoid
            overcapping.
          </li>
          <li>
            In multi-target situations, position yourself to hit as many targets as possible for
            maximum charge generation.
          </li>
          <li>Perfect usage combines efficient charge management with hitting multiple targets.</li>
        </ul>
      </>
    );

    if (this.arcaneOrb.orbData.length === 0) {
      return (
        <GuideSection
          spell={SPELLS.ARCANE_ORB}
          explanation={explanation}
          title="Arcane Orb (Overview)"
        >
          <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
            No Arcane Orb casts recorded
          </div>
        </GuideSection>
      );
    }

    return (
      <GuideSection spell={SPELLS.ARCANE_ORB} explanation={explanation} title="Arcane Orb">
        <CastDetail
          title="Arcane Orb Casts"
          casts={this.arcaneOrb.orbData.map((cast) => this.evaluateOrbCast(cast))}
        />
        <CastEfficiencyBar
          spell={SPELLS.ARCANE_ORB}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons
          showExplanation
        />
      </GuideSection>
    );
  }
}

export default ArcaneOrbGuide;
