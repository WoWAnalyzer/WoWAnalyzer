import { formatPercentage } from 'common/format';
import { GuideProps, Section, SubSection } from 'interface/guide';
import PerformanceStrong from 'interface/PerformanceStrong';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import CombatLogParser from '../CombatLogParser';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';

function CoreSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core">
      <SubSection title="Active Time">
        <p>
          <b>
            Continuously casting throughout an encounter is the single most important thing for
            achieving good DPS.
          </b>
          <br />
          Some fights have unavoidable downtime due to phase transitions and the like, so in these
          cases 0% downtime will not be possible - do the best you can.
        </p>
        <p>
          Remember that you always have access to either <SpellLink spell={SPELLS.CONSUME} /> or{' '}
          <SpellLink spell={SPELLS.DEVOUR} /> as fillers.
        </p>
        <p>
          Active Time:{' '}
          <PerformanceStrong performance={modules.alwaysBeCasting.DowntimePerformance}>
            {formatPercentage(modules.alwaysBeCasting.activeTimePercentage, 1)}%
          </PerformanceStrong>{' '}
        </p>
        <ActiveTimeGraph
          activeTimeSegments={modules.alwaysBeCasting.activeTimeSegments}
          fightStart={info.fightStart}
          fightEnd={info.fightEnd}
        />
      </SubSection>
    </Section>
  );
}

export default CoreSection;
