import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import type { JSX } from 'react';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';

import Immolate from '../analyzers/Immolate';

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { TALENTS_WARLOCK } from 'common/TALENTS';

class ImmolateUptime extends Analyzer {
  static dependencies = {
    immolate: Immolate,
  };

  protected immolate!: Immolate;

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>Keep your primary DoT active.</b>
        </p>

        {!this.selectedCombatant.hasTalent(TALENTS_WARLOCK.WITHER_TALENT) && (
          <p>
            Maintain <SpellLink spell={SPELLS.IMMOLATE} /> on the boss at all times. This DoT
            contributes significant damage and enables rotational synergies with{' '}
            <SpellLink spell={SPELLS.CONFLAGRATE} /> and other Destruction talents.
          </p>
        )}

        {this.selectedCombatant.hasTalent(TALENTS_WARLOCK.WITHER_TALENT) && (
          <p>
            When playing Hellcaller, maintain <SpellLink spell={SPELLS.WITHER_DEBUFF} />. This DoT
            contributes a massive amount of damage and enables rotational synergies with{' '}
            <SpellLink spell={SPELLS.CONFLAGRATE} /> and other Destruction talents.
          </p>
        )}
      </>
    );

    const data = <RoundedPanel>{this.immolate.subStatistic()}</RoundedPanel>;

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.immolate.subStatistic()}
      </StatisticBar>
    );
  }
}

export default ImmolateUptime;
