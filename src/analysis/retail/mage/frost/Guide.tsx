import { Section, GuideProps, SubSection } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import Explanation from 'interface/guide/components/Explanation';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/mage';

export const GUIDE_CORE_EXPLANATION_PERCENT = 50;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const alwaysBeCastingSubsection = (
    <SubSection title="Active Time">
      <Explanation>
        <b>
          Continuously casting throughout an encounter is the single most important thing for
          achieving good DPS as a caster.
        </b>
        <p>
          As mages we have <SpellLink spell={TALENTS.ICE_FLOES_TALENT} /> or{' '}
          <SpellLink spell={TALENTS.SHIMMER_TALENT} />
          to continue casting while dealing with mechanics that require movement.
        </p>
        <p>
          Some fights have unavoidable downtime due to phase transitions and the like, so in these
          cases 0% downtime will not be possible - do the best you can.
        </p>
      </Explanation>
      <p>
        Active Time:{' '}
        <PerformanceStrong performance={modules.alwaysBeCasting.DowntimePerformance}>
          {formatPercentage(modules.alwaysBeCasting.activeTimePercentage, 1)}%
        </PerformanceStrong>{' '}
        Cancelled Casts:{' '}
        <PerformanceStrong performance={modules.cancelledCasts.CancelledPerformance}>
          {formatPercentage(modules.cancelledCasts.cancelledPercentage, 1)}%
        </PerformanceStrong>{' '}
      </p>
      <ActiveTimeGraph
        activeTimeSegments={modules.alwaysBeCasting.activeTimeSegments}
        fightStart={info.fightStart}
        fightEnd={info.fightEnd}
      />
    </SubSection>
  );

  return (
    <>
      <Section title="Core">
        {alwaysBeCastingSubsection}
        {modules.icyVeins.guideSubsection}
      </Section>
    </>
  );
}
