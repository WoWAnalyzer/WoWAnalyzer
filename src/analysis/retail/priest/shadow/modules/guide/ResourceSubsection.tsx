import { SubSection, GuideProps } from 'interface/guide';
import { Trans } from '@lingui/macro';
import { PerformanceStrong } from './ExtraComponents';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';

import { formatPercentage } from 'common/format';
import CombatLogParser from 'analysis/retail/priest/shadow/CombatLogParser';

function ResourceSubsection({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <p>
        <b>
          <Trans id="guide.priest.shadow.sections.resources.insanity.summary">
            You should avoid capping insanity by using{' '}
            <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} /> or{' '}
            <SpellLink id={TALENTS.MIND_SEAR_TALENT.id} /> on three or more targets.
          </Trans>
        </b>
      </p>
      <p>
        <Trans id="guide.priest.shadow.sections.resources.insanity.chart">
          You wasted{' '}
          <PerformanceStrong performance={modules.insanityTracker.WastedInsanityPerformance}>
            {modules.insanityUsage.wasted} (
            {formatPercentage(modules.insanityUsage.wastePercentage, 1)}%)
          </PerformanceStrong>{' '}
          of your Insanity. TODO: The chart below shows your Insanity over the course of the
          encounter.
        </Trans>
      </p>
      {/*modules.insanityGraph.plot*/} {/* I don't know why this isn't working */}
    </SubSection>
  );
}

export default { ResourceSubsection };
