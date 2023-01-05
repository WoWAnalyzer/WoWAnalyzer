import { SubSection, GuideProps, Section } from 'interface/guide';
import { t, Trans } from '@lingui/macro';
import { PerformanceStrong } from 'analysis/retail/demonhunter/shared/guide/ExtraComponents';
import { formatPercentage } from 'common/format';
import CombatLogParser from 'analysis/retail/priest/shadow/CombatLogParser';

function ResourceSubsection({ modules }: GuideProps<typeof CombatLogParser>) {
  const InsanityWasted = modules.insanityUsage.wasted;
  const InsanityWastedPercent = modules.insanityUsage.wastePercentage;
  const InsanityWastedPercentFormatted = formatPercentage(InsanityWastedPercent, 1);
  const InsanityWastedPerformance = modules.insanityTracker.WastedInsanityPerformance;

  return (
    <Section
      title={t({
        id: 'guide.priest.shadow.sections.resources.title',
        message: 'Resource Use',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.priest.shadow.sections.resources.insanity.title',
          message: 'Insanity',
        })}
      >
        <p>
          <Trans id="guide.priest.shadow.sections.resources.insanity.summary">
            Shadow's primary resource is Insanity. You should avoid capping insanity.
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
    </Section>
  );
}

export default { ResourceSubsection };
