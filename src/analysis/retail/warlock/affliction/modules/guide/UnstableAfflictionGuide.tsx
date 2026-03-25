import type { JSX } from 'react';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import UnstableAffliction from '../analyzers/UnstableAffliction';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { TALENTS_WARLOCK } from 'common/TALENTS';

interface Props {
  unstableAffliction: UnstableAffliction;
}
function UnstableAfflictionGuide({ unstableAffliction }: Props): JSX.Element {
  const explanation = (
    <>
      <p>
        <b>
          Keep <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> as much as possible.
        </b>
      </p>

      <p>
        Maintain <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> on the boss at all times. This DoT
        contributes significant damage and enables rotational synergies with{' '}
        <SpellLink spell={TALENTS_WARLOCK.CULL_THE_WEAK_TALENT} /> and other Affliction talents.
      </p>
    </>
  );

  return explanationAndDataSubsection(
    explanation,
    <RoundedPanel>{unstableAffliction.subStatistic()}</RoundedPanel>,
  );
}

export default UnstableAfflictionGuide;
