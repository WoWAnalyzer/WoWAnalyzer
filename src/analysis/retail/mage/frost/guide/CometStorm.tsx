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

import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import CometStorm from '../talents/CometStorm';

const AOE_THRESHOLD = 3;
const MIN_SHATTERED_PROJECTILES_PER_CAST = 4;

class CometStormGuide extends Analyzer {
  static dependencies = {
    cometStorm: CometStorm,
  };

  protected cometStorm!: CometStorm;

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

  get cometStormData() {
    const data: BoxRowEntry[] = [];
    this.cometStorm.cometCasts.forEach((cs) => {
      const tooltipItems: { perf: QualitativePerformance; detail: string }[] = [];

      const ST = cs.enemiesHit < AOE_THRESHOLD;
      const AOE = cs.enemiesHit >= AOE_THRESHOLD;
      const noHits = cs.enemiesHit === 0;
      const lowShatters = ST && cs.shatteredHits < MIN_SHATTERED_PROJECTILES_PER_CAST;

      if (noHits) {
        tooltipItems.push({ perf: QualitativePerformance.Fail, detail: 'No Enemies Hit' });
      } else if (AOE) {
        tooltipItems.push({
          perf: QualitativePerformance.Good,
          detail: `${cs.enemiesHit} Enemies Hit (AOE)`,
        });
      }

      if (lowShatters) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `${cs.shatteredHits} Projectiles Shattered (ST/Cleave)`,
        });
      }

      let overallPerf = QualitativePerformance.Good;
      if (lowShatters || noHits) {
        overallPerf = QualitativePerformance.Fail;
      }

      if (tooltipItems) {
        const tooltip = this.generateGuideTooltip(overallPerf, tooltipItems, cs.cast.timestamp);
        data.push({ value: overallPerf, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const cometStorm = <SpellLink spell={TALENTS.COMET_STORM_TALENT} />;
    const wintersChill = <SpellLink spell={SPELLS.WINTERS_CHILL} />;
    const flurry = <SpellLink spell={TALENTS.FLURRY_TALENT} />;

    const explanation = (
      <>
        <b>{cometStorm}</b> is especially good in AOE scenarios where the comets can hit multiple
        targets, however the individual comets can also be shattered without expending a stack of{' '}
        {wintersChill}, which makes it very valuable in Single Target & Cleave as well.
        <ul>
          <li>
            Cast immediately after {flurry} in Single Target & Cleave to allow all comets to impact
            during {wintersChill}.
          </li>
          <li>
            Cast with or without {wintersChill} if it will hit {AOE_THRESHOLD} or more targets.
          </li>
          <li>
            You may need to delay spending both {wintersChill} stacks to allow all the comets to get
            shattered.
          </li>
        </ul>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <CastSummaryAndBreakdown
              spell={TALENTS.COMET_STORM_TALENT}
              castEntries={this.cometStormData}
            />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Comet Storm',
    );
  }
}

export default CometStormGuide;
