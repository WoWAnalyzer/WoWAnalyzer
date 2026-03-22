import Backdraft from '../analyzers/Backdraft';
import { ReactNode } from 'react';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { PerformanceBoxRow, BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import { SpellUse } from 'parser/core/SpellUsage/core';

interface BackdraftGuideProps {
  analyzer: Backdraft;
  fightStart: number;
  fightEnd: number;
}

export function BackdraftGuide({ analyzer, fightStart, fightEnd }: BackdraftGuideProps): ReactNode {
  if (!analyzer) return null;

  const uses = analyzer.getSpellUsesWithPotentialMisses(fightStart, fightEnd);

  const boxes: BoxRowEntry[] = uses.map((use: SpellUse) => {
    return {
      value: use.performance,
      tooltip: use.performanceExplanation,
    };
  });

  const explanation = (
    <>
      <SpellLink spell={SPELLS.BACKDRAFT} /> empowers your next Chaos Bolt, Incinerate, or Soul Fire
      casts.
    </>
  );

  const data = (
    <div>
      <div style={{ marginBottom: 8 }}>
        <SpellLink spell={SPELLS.BACKDRAFT} />
        <small> - Green = optimal spender, Yellow = acceptable use.</small>
      </div>

      <PerformanceBoxRow values={boxes} />
    </div>
  );

  return ExplanationAndDataSubSection({
    explanation,
    data,
  });
}
