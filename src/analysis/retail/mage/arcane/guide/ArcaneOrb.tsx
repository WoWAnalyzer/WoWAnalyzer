import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { qualitativePerformanceToColor } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

import ArcaneOrb from '../core/ArcaneOrb';
import {
  CastEfficiencyBarElement,
  CastEfficiencyStatElement,
} from 'interface/guide/components/CastEfficiencyPanel';

const ORB_CHARGE_THRESHOLD = 2;

class ArcaneOrbGuide extends Analyzer {
  static dependencies = {
    arcaneOrb: ArcaneOrb,
  };

  protected arcaneOrb!: ArcaneOrb;

  get orbTargetUtil() {
    const util = this.arcaneOrb.orbTargetThresholds.actual;
    const thresholds = this.arcaneOrb.orbTargetThresholds.isLessThan;
    let performance = QualitativePerformance.Fail;
    if (util >= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (util >= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get arcaneOrbData(): BoxRowEntry[] {
    return this.arcaneOrb.orbCasts.map((cast) => {
      const value =
        cast.targetsHit > 0 && cast.chargesBefore <= ORB_CHARGE_THRESHOLD
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail;
      const tooltip = (
        <p>
          @ <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong>
          <br />
          Targets Hit: <strong>{cast.targetsHit}</strong>
          <br />
          Charges Before Cast: <strong>{cast.chargesBefore}</strong>
        </p>
      );
      return { value, tooltip };
    });
  }

  get guideSubsection(): JSX.Element {
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneOrbIcon = <SpellIcon spell={SPELLS.ARCANE_ORB} />;

    const explanation = (
      <>
        <div>
          <b>{arcaneOrb}'s</b> primary purpose is to quickly generate {arcaneCharge}s, as it is an
          instant that generates at least 2 charges. Try to use it on cooldown, but only when you
          have 2 or fewer {arcaneCharge}s.
        </div>
      </>
    );
    const orbTargetTooltip = <>{this.arcaneOrb.missedOrbs} Arcane Orb casts with no targets hit.</>;
    const data =
      this.arcaneOrb.orbCasts.length > 0 ? (
        <RoundedPanel>
          <div>
            <span
              style={{ color: qualitativePerformanceToColor(this.orbTargetUtil), fontSize: '18px' }}
            >
              {arcaneOrbIcon}{' '}
              <TooltipElement content={orbTargetTooltip}>
                {this.arcaneOrb.averageHitsPerCast.toFixed(2)} <small>avg targets hit</small>
              </TooltipElement>
            </span>
            {' / '}
            <CastEfficiencyStatElement spell={SPELLS.ARCANE_ORB} useThresholds />
          </div>
          <div>
            <strong>Arcane Orb Usage</strong>
            <PerformanceBoxRow values={this.arcaneOrbData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
          <CastEfficiencyBarElement spell={SPELLS.ARCANE_ORB} />
        </RoundedPanel>
      ) : (
        <RoundedPanel>
          <div style={{ textAlign: 'center', fontSize: '20px' }}>
            <p>
              <strong>Player did not cast {arcaneOrb}</strong>
            </p>
          </div>
        </RoundedPanel>
      );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Arcane Orb',
    );
  }
}

export default ArcaneOrbGuide;
