import { ReactNode } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { qualitativePerformanceToColor } from 'interface/guide';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { SpellSeq } from 'parser/ui/SpellSeq';

import ArcaneSurge from '../core/ArcaneSurge';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

class ArcaneSurgeGuide extends Analyzer {
  static dependencies = {
    arcaneSurge: ArcaneSurge,
  };

  protected arcaneSurge!: ArcaneSurge;

  generateGuideTooltip(
    performance: QualitativePerformance,
    tooltipText: ReactNode,
    timestamp: number,
  ) {
    const tooltip = (
      <>
        <div>
          <b>@ {this.owner.formatTimestamp(timestamp)}</b>
        </div>
        <div>
          <PerformanceMark perf={performance} /> {performance}: {tooltipText}
        </div>
      </>
    );
    return tooltip;
  }

  get surgeManaUtil() {
    const util = this.arcaneSurge.arcaneSurgeManaThresholds.actual;
    const thresholds = this.arcaneSurge.arcaneSurgeManaThresholds.isLessThan;
    let performance = QualitativePerformance.Fail;
    if (util >= thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (util >= thresholds.major) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get arcaneSurgeData() {
    const data: BoxRowEntry[] = [];
    this.arcaneSurge.surgeCasts.forEach((as) => {
      if (as.usage && as.usage?.tooltip) {
        const tooltip = this.generateGuideTooltip(as.usage?.value, as.usage?.tooltip, as.cast);
        data.push({ value: as.usage?.value, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />;
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const siphonStorm = <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} />;
    const arcaneSurgeIcon = <SpellIcon spell={TALENTS.ARCANE_SURGE_TALENT} />;

    const explanation = (
      <>
        <div>
          <b>{arcaneSurge}</b> is your primary damage cooldown and will essentially convert all of
          your mana into damage. Because of this, there are a few things that you should do to
          ensure you maximize the amount of damage that {arcaneSurge} does:
        </div>
        <div>
          <ul>
            <li>
              Ensure you have 4 {arcaneCharge}s. Cast {arcaneOrb} if you have less than 4.
            </li>
            <li>
              Full channel {evocation} before each {arcaneSurge} cast to cap your mana and grant an
              intellect buff from {siphonStorm}.
            </li>
            <li>
              Channeling {evocation} will give you a {clearcasting} proc. Cast {arcaneMissiles} to
              get {netherPrecision} before {arcaneSurge}
            </li>
            <li>
              Ensure you have as much mana as possible. If you fully channeled {evocation} then you
              should be capped on mana.
            </li>
          </ul>
        </div>
        <div>
          When incorporating the above items, your spell sequence will look like this:{' '}
          <SpellSeq
            spells={[
              TALENTS.EVOCATION_TALENT,
              TALENTS.ARCANE_MISSILES_TALENT,
              SPELLS.ARCANE_ORB,
              TALENTS.ARCANE_SURGE_TALENT,
            ]}
          />
        </div>
      </>
    );
    const surgeTooltip = (
      <>{formatPercentage(this.arcaneSurge.averageManaPercent)}% average mana per Arcane Surge.</>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div
            style={{ color: qualitativePerformanceToColor(this.surgeManaUtil), fontSize: '20px' }}
          >
            {arcaneSurgeIcon}{' '}
            <TooltipElement content={surgeTooltip}>
              {formatPercentage(this.arcaneSurge.averageManaPercent, 2)}%{' '}
              <small>Average Mana Per Surge</small>
            </TooltipElement>
          </div>
          <div>
            <strong>Arcane Surge Usage</strong>
            <PerformanceBoxRow values={this.arcaneSurgeData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
          <div>
            <strong>Arcane Surge Cast Efficiency</strong>
            <CastEfficiencyBar
              spellId={TALENTS.ARCANE_SURGE_TALENT.id}
              gapHighlightMode={GapHighlight.FullCooldown}
              useThresholds
            />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Arcane Surge',
    );
  }
}

export default ArcaneSurgeGuide;
