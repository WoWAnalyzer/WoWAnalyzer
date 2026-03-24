import { Section, SubSection, GuideProps } from 'interface/guide';
import { PerformanceStrong } from './ExtraComponents';
import { formatPercentage } from 'common/format';
import CombatLogParser from 'analysis/retail/priest/shadow/CombatLogParser';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';

function CastingSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <p>
        <b>
          Continuously casting throughout an encounter is the single most important thing for
          achieving good DPS as a caster.
        </b>
        <br />
        Some fights have unavoidable downtime due to phase transitions and the like, so in these
        cases 0% downtime will not be possible - do the best you can.
      </p>
      <p>
        Active Time:{' '}
        <PerformanceStrong performance={modules.alwaysBeCasting.DowntimePerformance}>
          {formatPercentage(modules.alwaysBeCasting.activeTimePercentage, 1)}%
        </PerformanceStrong>{' '}
        Cancelled Casts:{' '}
        <PerformanceStrong performance={modules.cancelledCasts.CancelledPerformance}>
          {formatPercentage(modules.cancelledCasts.Canceled, 1)}%
        </PerformanceStrong>{' '}
      </p>
      <Section title="Active Time Graph">
        <ActiveTimeGraph
          activeTimeSegments={modules.alwaysBeCasting.activeTimeSegments}
          fightStart={info.fightStart}
          fightEnd={info.fightEnd}
        />
      </Section>
    </SubSection>
  );
}

export default { CastingSubsection };
