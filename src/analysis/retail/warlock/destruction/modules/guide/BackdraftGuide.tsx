import Backdraft from '../analyzers/Backdraft';
import { ReactNode } from 'react';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import SpellLink from 'interface/SpellLink';
import { BuffUptimeBar } from 'interface/guide/components';

interface BackdraftGuideProps {
  analyzer: Backdraft;
  fightStart: number;
  fightEnd: number;
}

export function BackdraftGuide({ analyzer, fightStart, fightEnd }: BackdraftGuideProps): ReactNode {
  if (!analyzer) return null;

  const explanation = (
    <>
      <p>
        <SpellLink spell={TALENTS.CONFLAGRATE_TALENT} /> grants up to 2 stacks of{' '}
        <SpellLink spell={SPELLS.BACKDRAFT} />, which speeds up your next Chaos Bolt, Incinerate, or
        Soul Fire casts. Which spell you spend on them doesn't matter much.
      </p>
      <small>
        Avoid casting Conflagrate while already at 2 stacks of Backdraft, and don't let the buff
        expire with stacks unused.
      </small>
    </>
  );

  const data = (
    <div>
      <p>
        Wasted stacks: {analyzer.wastedOvercapStacks} overcapped, {analyzer.wastedExpiredStacks}{' '}
        expired.
      </p>
      <BuffUptimeBar
        spell={SPELLS.BACKDRAFT}
        buffHistory={analyzer.buffHistory}
        startTime={fightStart}
        endTime={fightEnd}
        maxStacks={2}
      />
    </div>
  );

  return ExplanationAndDataSubSection({
    explanation,
    data,
  });
}
