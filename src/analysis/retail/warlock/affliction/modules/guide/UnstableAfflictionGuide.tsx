import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import type { JSX } from 'react';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import UnstableAffliction from '../analyzers/UnstableAffliction';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { TALENTS_WARLOCK } from 'common/TALENTS';

class UnstableAfflictionGuide extends Analyzer {
  static dependencies = {
    unstableaffliction: UnstableAffliction,
  };

  protected unstableaffliction!: UnstableAffliction;

  // Main guide subsection
  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            Keep <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> as much as possible.
          </b>
        </p>

        <p>
          Maintain <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> on the boss at all times. This
          DoT contributes significant damage and enables rotational synergies with{' '}
          <SpellLink spell={TALENTS_WARLOCK.CULL_THE_WEAK_TALENT} /> and other Affliction talents.
        </p>
      </>
    );

    return explanationAndDataSubsection(
      explanation,
      <RoundedPanel>{this.unstableaffliction.subStatistic()}</RoundedPanel>,
    );
  }

  // Statistic bar at the top
  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.unstableaffliction.subStatistic()}
      </StatisticBar>
    );
  }
}

export default UnstableAfflictionGuide;
