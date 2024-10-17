import AspectOfHarmonyBaseAnalyzer, {
  CastInfo,
} from 'analysis/retail/monk/shared/hero/MasterOfHarmony/talents/AspectOfHarmonyBase';
import { formatPercentage } from 'common/format';
import { TALENTS_MONK } from 'common/TALENTS';
import { PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import SpellLink from 'interface/SpellLink';
import {
  evaluateQualitativePerformanceByThreshold,
  getAveragePerf,
  QualitativePerformanceThresholdRange,
} from 'parser/ui/QualitativePerformance';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

const targetPerfRange: QualitativePerformanceThresholdRange = {
  perfect: 1,
  good: 0.9,
  ok: 0.8,
  fail: 0.7,
};

// maybe be more strict in the future once better logs emerge
const overhealingPerfRange: QualitativePerformanceThresholdRange = {
  good: 0.6,
  ok: 0.7,
  fail: 1,
};

class AspectOfHarmony extends AspectOfHarmonyBaseAnalyzer {
  getEntryFromCast(info: CastInfo): BoxRowEntry {
    const pctRaid = info.numBuffs / this.combatants.playerCount;
    const targetPerf = evaluateQualitativePerformanceByThreshold({
      actual: pctRaid,
      isGreaterThanOrEqual: targetPerfRange,
    });
    const pctOverheal =
      info.overhealing > 0 ? info.overhealing / (info.totalHealing + info.overhealing) : 0;
    const overhealPerf = evaluateQualitativePerformanceByThreshold({
      actual: pctOverheal,
      isLessThanOrEqual: overhealingPerfRange,
    });
    const value = getAveragePerf([targetPerf, overhealPerf]);
    const tooltip = (
      <>
        <div>@ {this.owner.formatTimestamp(info.startTime)}</div>
        <div>
          # of HoTs: {info.numBuffs} <PerformanceMark perf={targetPerf} />
        </div>
        <div>
          Overhealing: {formatPercentage(pctOverheal)}% <PerformanceMark perf={overhealPerf} />
        </div>
      </>
    );
    return { value, tooltip };
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.ASPECT_OF_HARMONY_TALENT} />
        </b>{' '}
        consumes stored vitality by healing allies after you use{' '}
        <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> equal to 40% of the heal that
        consumed it. It is extremely important to try to apply the HoT to as many allies as
        possible, which is most easily achieved by using{' '}
        <SpellLink spell={TALENTS_MONK.CHI_BURST_SHARED_TALENT} /> on the raid due to its ability to
        hit an uncapped amount of targets while not consuming all stored vitality.
      </p>
    );
    const styleObj = {
      fontSize: 20,
    };
    const styleObjInner = {
      fontSize: 15,
    };
    const entries = this.castEntries.map((castInfo: CastInfo) => {
      return this.getEntryFromCast(castInfo);
    });
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.ASPECT_OF_HARMONY_TALENT} /> utilization
          </strong>
          <PerformanceBoxRow values={entries} />
          <div style={styleObj}>
            <b>{this.avgHots.toFixed(1)}</b> <small style={styleObjInner}>average HoTs</small>
          </div>
        </RoundedPanel>
      </div>
    );
    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default AspectOfHarmony;
