import { SubSection, GuideProps } from 'interface/guide';
import { Trans } from '@lingui/macro';
import { PerformanceStrong } from './ExtraComponents';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';

import { formatPercentage } from 'common/format';
import CombatLogParser from 'analysis/retail/priest/shadow/CombatLogParser';

function ResourceSubsection({ modules }: GuideProps<typeof CombatLogParser>) {
  const InsanityWasted = modules.insanityUsage.wasted;
  const InsanityWastedPercent = modules.insanityUsage.wastePercentage;
  const InsanityWastedPercentFormatted = formatPercentage(InsanityWastedPercent, 1);
  const InsanityWastedPerformance = modules.insanityTracker.WastedInsanityPerformance;

  return (
    <SubSection>
      <p>
        <Trans id="guide.priest.shadow.sections.resources.insanity.summary">
          Shadow's primary resource is Insanity. You should avoid capping insanity by using{' '}
          <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} /> or{' '}
          <SpellLink id={TALENTS.MIND_SEAR_TALENT.id} /> on three or more targets.
        </Trans>
      </p>
      <p>
        <Trans id="guide.priest.shadow.sections.resources.insanity.chart">
          The chart below shows your Insanity over the course of the encounter. You wasted{' '}
          <PerformanceStrong performance={InsanityWastedPerformance}>
            {InsanityWasted} ({InsanityWastedPercentFormatted}%)
          </PerformanceStrong>{' '}
          of your Insanity.
        </Trans>
      </p>
      {/*modules.insanityGraph.plot*/}
    </SubSection>
  );
}

export default { ResourceSubsection };
