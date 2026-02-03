import { TALENTS_MONK } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  CastInfo,
  default as CommonCelestialConduit,
} from '../../../shared/hero/ConduitOfTheCelestials/talents/CelestialConduit';
import SpellLink from 'interface/SpellLink';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

class CelestialConduit extends CommonCelestialConduit {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT,
    );
  }

  private castEntries(casts: CastInfo[]): BoxRowEntry[] {
    const entries: BoxRowEntry[] = [];

    casts.forEach((cast) => {
      let value = QualitativePerformance.Fail;
      if (!cast.cancelled) {
        value = QualitativePerformance.Perfect;
      }

      entries.push({
        value,
      });
    });

    return entries;
  }

  get clipAnalysis() {
    return (
      <>
        <strong>
          <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT} /> utilization
        </strong>
        <div>
          <strong>Clip Analysis </strong>
          <small>
            - Blue indicates a perfect cast (
            <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT} /> was channeled to
            completion)
          </small>
          <br />
          <br />
          <PerformanceBoxRow values={this.castEntries(this.castInfoList)} />
        </div>
      </>
    );
  }

  get guideCastBreakdown() {
    const explanation = (
      <p>
        <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT} /> should be cast
        towards the end of a <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} />{' '}
        window, so that the secondary cast of <SpellLink spell={TALENTS_MONK.UNITY_WITHIN_TALENT} />{' '}
        triggers a new window. The channel should always be fully completed when possible.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>{this.clipAnalysis}</RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default CelestialConduit;
