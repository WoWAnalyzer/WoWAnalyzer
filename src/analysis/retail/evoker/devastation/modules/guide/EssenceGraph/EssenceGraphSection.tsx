import CombatLogParser from '../../../CombatLogParser';
import { GuideProps, Section } from 'interface/guide';
import { formatPercentage } from 'common/format';

export function EssenceGraphSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Essence Graph">
      <p>
        This documents your Essence level over time. You shouldn't have long windows of overcapped
        essence except in some unique cases in Dragon Rage. You were capped on Essence for{' '}
        <strong>{formatPercentage(modules.essenceTracker.percentAtCap, 1)}%</strong> of the
        encounter.
      </p>
      {modules.essenceGraph.plot}
    </Section>
  );
}
