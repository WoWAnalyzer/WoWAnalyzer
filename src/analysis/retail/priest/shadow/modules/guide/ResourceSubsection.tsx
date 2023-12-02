import { SubSection, GuideProps } from 'interface/guide';
import { PerformanceStrong } from './ExtraComponents';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';

import { formatPercentage } from 'common/format';
import CombatLogParser from 'analysis/retail/priest/shadow/CombatLogParser';

function ResourceSubsection({ modules }: GuideProps<typeof CombatLogParser>) {
  let perfect = false;
  if (modules.insanityUsage.wasted < 50) {
    perfect = true;
  }

  return (
    <SubSection>
      <p>
        {perfect && (
          <b>
            Good job! You avoided overcapping insanity by using{' '}
            <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} />.
          </b>
        )}
        {!perfect && (
          <b>
            You should avoid capping insanity by using{' '}
            <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} />.
          </b>
        )}
      </p>
      <p>
        You wasted{' '}
        <PerformanceStrong performance={modules.insanityTracker.WastedInsanityPerformance}>
          {modules.insanityUsage.wasted} (
          {formatPercentage(modules.insanityUsage.wastePercentage, 1)}%)
        </PerformanceStrong>{' '}
        of your Insanity. The chart below shows your Insanity over the course of the encounter.
      </p>
      {modules.insanityGraph.plot}
    </SubSection>
  );
}

export default { ResourceSubsection };
