import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';

import NetherPrecision from '../talents/NetherPrecision';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';

class NetherPrecisionGuide extends Analyzer {
  static dependencies = {
    netherPrecision: NetherPrecision,
  };

  protected netherPrecision!: NetherPrecision;

  generateGuideTooltip(
    performance: QualitativePerformance,
    tooltipItems: { perf: QualitativePerformance; detail: string }[],
    timestamp: number,
  ) {
    const tooltip = (
      <>
        <div>
          <b>@ {this.owner.formatTimestamp(timestamp)}</b>
        </div>
        <div>
          <PerformanceMark perf={performance} /> {performance}
        </div>
        <div>
          {tooltipItems.map((t, i) => (
            <div key={i}>
              <PerformanceMark perf={t.perf} /> {t.detail}
              <br />
            </div>
          ))}
        </div>
      </>
    );
    return tooltip;
  }

  get netherPrecisionData() {
    const data: BoxRowEntry[] = [];
    this.netherPrecision.netherPrecisionBuffs.forEach((np) => {
      const tooltipItems: { perf: QualitativePerformance; detail: string }[] = [];

      if (np.overwritten) {
        tooltipItems.push({ perf: QualitativePerformance.Fail, detail: `Buff Overwritten` });
      }

      const oneStackLost = np.damageEvents?.length === 1;
      const bothStacksLost = !np.damageEvents;
      if (oneStackLost || bothStacksLost) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `${oneStackLost ? 'One stack' : 'Both stacks'} lost`,
        });
      }

      const fightEndOneLost =
        this.owner.fight.end_time === np.removed && np.damageEvents?.length === 1;
      const fightEndBothLost = this.owner.fight.end_time === np.removed && !np.damageEvents;
      if (fightEndOneLost || fightEndBothLost) {
        tooltipItems.push({
          perf: QualitativePerformance.Ok,
          detail: `${fightEndOneLost ? 'One stack' : 'Both stacks'} lost close to fight end`,
        });
      }

      let overallPerf = QualitativePerformance.Fail;
      if (np.overwritten || oneStackLost || bothStacksLost) {
        overallPerf = QualitativePerformance.Fail;
      } else if (fightEndBothLost || fightEndOneLost) {
        overallPerf = QualitativePerformance.Ok;
      } else {
        overallPerf = QualitativePerformance.Good;
      }

      if (tooltipItems) {
        const tooltip = this.generateGuideTooltip(overallPerf, tooltipItems, np.applied);
        data.push({ value: overallPerf, tooltip });
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
            <CastSummaryAndBreakdown
              spell={TALENTS.NETHER_PRECISION_TALENT}
              castEntries={this.netherPrecisionData}
            />
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
