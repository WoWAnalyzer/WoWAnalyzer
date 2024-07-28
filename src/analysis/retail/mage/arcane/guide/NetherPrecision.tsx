import { ReactNode } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

import NetherPrecision from '../talents/NetherPrecision';

class NetherPrecisionGuide extends Analyzer {
  static dependencies = {
    netherPrecision: NetherPrecision,
  };

  protected netherPrecision!: NetherPrecision;

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

  get netherPrecisionData() {
    const data: BoxRowEntry[] = [];
    this.netherPrecision.netherPrecisionBuffs.forEach((np) => {
      if (np.usage && np.usage?.tooltip) {
        const tooltip = this.generateGuideTooltip(np.usage?.value, np.usage?.tooltip, np.applied);
        data.push({ value: np.usage?.value, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;

    const explanation = (
      <>
        <div>
          <b>{netherPrecision}</b> gets applied to you every time you cast {arcaneMissiles} to spend
          your {clearcasting} procs and buffs the next two {arcaneBlast} or {arcaneBarrage} casts
          within 10 seconds. So whenever you spend {clearcasting}, you should cast {arcaneBlast} or{' '}
          {arcaneBarrage} twice to get the buff's benefit before spending another {clearcasting}{' '}
          proc.
        </div>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>Nether Precision Buff Usage</strong>
            <PerformanceBoxRow values={this.netherPrecisionData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Nether Precision',
    );
  }
}

export default NetherPrecisionGuide;
