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
import WintersChill from '../core/WintersChill';

const AOE_THRESHOLD = 3;
const MIN_SHATTERED_PROJECTILES_PER_CAST = 4;

const FREE_SPENDERS = [SPELLS.COMET_STORM_DAMAGE.id, TALENTS.RAY_OF_FROST_TALENT.id];

class WintersChillGuide extends Analyzer {
  static dependencies = {
    wintersChill: WintersChill,
  };

  protected wintersChill!: WintersChill;

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

  get wintersChillData() {
    const data: BoxRowEntry[] = [];
    this.wintersChill.chillDebuffs.forEach((wc) => {
      const tooltipItems: { perf: QualitativePerformance; detail: string }[] = [];

      //const chillSpenders = wc.spentStacks.filter(s => !FREE_SPENDERS.includes(s.spellId))
      //const glacialSpikeDamage = wc.damage.filter(d => d.ability.guid === SPELLS.GLACIAL_SPIKE_DAMAGE.id);
      //const iceLanceDamage = wc.damage.filter(d => d.ability.guid === SPELLS.ICE_LANCE_DAMAGE.id);

      if (!wc.precast) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `No Precast into Winter's Chill`,
        });
      }

      const cometStormDamage = wc.damage.filter(
        (d) => d.ability.guid === SPELLS.COMET_STORM_DAMAGE.id,
      );
      const cometShatters = cometStormDamage.length;
      if (cometShatters > 0) {
        if (cometShatters >= MIN_SHATTERED_PROJECTILES_PER_CAST) {
          tooltipItems.push({
            perf: QualitativePerformance.Perfect,
            detail: `${cometShatters} CS Projectiles Shattered`,
          });
        } else {
          tooltipItems.push({
            perf: QualitativePerformance.Fail,
            detail: `${cometShatters} CS Projectiles Shattered`,
          });
        }
      }

      const rayOfFrostDamage = wc.damage.filter(
        (d) => d.ability.guid === TALENTS.RAY_OF_FROST_TALENT.id,
      );
      const rayTicks = rayOfFrostDamage.length;
      if (rayTicks > 0) {
        if (rayTicks > 2) {
          tooltipItems.push({
            perf: QualitativePerformance.Perfect,
            detail: `${rayTicks} RoF Ticks Shattered`,
          });
        } else {
          tooltipItems.push({
            perf: QualitativePerformance.Fail,
            detail: `${rayTicks} RoF Ticks Shattered`,
          });
        }
      }

      if (wc.precast) {
        tooltipItems.push({
          perf: QualitativePerformance.Good,
          detail: `${wc.precast.ability.name} Precast Found`,
        });
      } else {
        tooltipItems.push({ perf: QualitativePerformance.Fail, detail: `No Precast Found` });
      }

      const wcSpenders = wc.damage.filter((d) => !FREE_SPENDERS.includes(d.ability.guid));
      const stacksSpent = wcSpenders.length;
      if (stacksSpent >= 2) {
        tooltipItems.push({
          perf: QualitativePerformance.Good,
          detail: `${stacksSpent} Stacks Spent`,
        });
      } else if (stacksSpent === 1) {
        tooltipItems.push({
          perf: QualitativePerformance.Fail,
          detail: `${stacksSpent} Stacks Spent`,
        });
      } else {
        tooltipItems.push({ perf: QualitativePerformance.Fail, detail: `No Stacks Spent` });
      }

      let overallPerf = QualitativePerformance.Good;
      if (
        stacksSpent >= 2 &&
        wc.precast &&
        (cometShatters > MIN_SHATTERED_PROJECTILES_PER_CAST || rayTicks > 1)
      ) {
        overallPerf = QualitativePerformance.Perfect;
      } else if (stacksSpent < 2 || !wc.precast) {
        overallPerf = QualitativePerformance.Fail;
      }

      if (tooltipItems) {
        const tooltip = this.generateGuideTooltip(overallPerf, tooltipItems, wc.apply.timestamp);
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
              spell={SPELLS.WINTERS_CHILL}
              castEntries={this.wintersChillData}
            />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      "Winter's Chill",
    );
  }
}

export default WintersChillGuide;
