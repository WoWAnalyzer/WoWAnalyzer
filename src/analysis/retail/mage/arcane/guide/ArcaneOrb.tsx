import { type JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Analyzer from 'parser/core/Analyzer';
import GuideSection from 'interface/guide/components/GuideSection';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import CastOverview from 'interface/guide/components/CastOverview';
import CastEfficiencyRibbon from 'interface/guide/components/CastEfficiencyRibbon';

import ArcaneOrb from '../analyzers/ArcaneOrb';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

interface ArcaneOrbCast {
  timestamp: number;
  targetsHit: number;
  chargesBefore: number;
}

const ARCANE_CHARGE_THRESHOLD = 2;
const AOE_THRESHOLD = 2; // Perfect if hitting 2+ targets

class ArcaneOrbGuide extends Analyzer {
  static dependencies = {
    arcaneOrb: ArcaneOrb,
  };

  protected arcaneOrb!: ArcaneOrb;

  private buildOverviewStats() {
    const stats = [];

    const totalCasts = this.arcaneOrb.orbData.length;
    const totalTargetsHit = this.arcaneOrb.orbData.reduce((sum, cast) => sum + cast.targetsHit, 0);
    const averageTargetsHit = totalTargetsHit / totalCasts;

    // Average targets hit
    stats.push({
      value: averageTargetsHit.toFixed(1),
      label: 'Avg Targets Hit',
      tooltip: <>Average number of targets hit per Arcane Orb cast.</>,
    });

    return stats;
  }

  private evaluateOrbCast(cast: ArcaneOrbCast): CastEvaluation {
    const hitTargets = cast.targetsHit > 0;
    const isAOE = cast.targetsHit >= AOE_THRESHOLD;

    // FAIL CONDITIONS
    if (!hitTargets) {
      return {
        performance: QualitativePerformance.Fail,
        reason: 'Failed to hit any targets - wasted cast',
        timestamp: cast.timestamp,
      };
    }

    // PERFECT CONDITIONS
    if (cast.chargesBefore <= ARCANE_CHARGE_THRESHOLD) {
      return {
        performance: QualitativePerformance.Perfect,
        reason: `Hit ${cast.targetsHit} target(s) with ${cast.chargesBefore} Arcane Charges`,
        timestamp: cast.timestamp,
      };
    }

    // GOOD CONDITIONS
    if (isAOE) {
      return {
        performance: QualitativePerformance.Good,
        reason: `Hit ${cast.targetsHit} target(s) with (${cast.chargesBefore} Arcane Charges`,
        timestamp: cast.timestamp,
      };
    }

    // DEFAULT
    return {
      performance: QualitativePerformance.Fail,
      reason: `Hit ${cast.targetsHit} target(s) with ${cast.chargesBefore} Arcane Charges`,
      timestamp: cast.timestamp,
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
            Try to use it on cooldown, but only when you have {ARCANE_CHARGE_THRESHOLD} or fewer{' '}
            {arcaneCharge}s to avoid overcapping.
          </li>
          <li>
            In multi-target situations, position yourself to hit as many targets as possible for
            maximum charge generation.
          </li>
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
        <CastOverview spell={SPELLS.ARCANE_ORB} stats={this.buildOverviewStats()} />
        <CastSummary
          spell={SPELLS.ARCANE_ORB}
          casts={this.arcaneOrb.orbData.map((cast) => this.evaluateOrbCast(cast))}
          showBreakdown
        />
        <CastEfficiencyRibbon spell={SPELLS.ARCANE_ORB} showExplanation />
      </GuideSection>
    );
  }
}

export default ArcaneOrbGuide;
