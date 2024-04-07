import { Section, GuideProps, SubSection } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import Explanation from 'interface/guide/components/Explanation';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

export const GUIDE_CORE_EXPLANATION_PERCENT = 50;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const alwaysBeCastingSubsection = (
    <SubSection title="Active Time">
      <Explanation>
        <>
          Any time you are not casting something, that is damage that is lost. Mage has many ways to
          decrease downtime, such as using <SpellLink spell={SPELLS.BLINK} /> to get somewhere
          faster so you can continue casting or using <SpellLink spell={SPELLS.SCORCH} /> while you
          are moving; even phases where the only target is taking 99% reduced damage is an
          opportunity to fish for procs or get cooldown reduction from crits if you are using{' '}
          <SpellLink spell={TALENTS.KINDLING_TALENT} />. While some encounters have forced downtime,
          which WoWAnalyzer does not account for, anything you can do to minimize your downtime will
          help your damage. Additionally, to better contextualize your downtime, we recommend
          comparing your downtime to another Fire Mage that did better than you on the same
          encounter with roughly the same kill time. If you have less downtime than them, then maybe
          there is something you can do to improve.
        </>
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
        <>
          As a Fire Mage, the vast majority of your rotation revolves around generating, managing,
          and spending your <SpellLink spell={SPELLS.HEATING_UP} /> and{' '}
          <SpellLink spell={SPELLS.HOT_STREAK} /> procs. Regardless of whether{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> is active or not, learning to properly
          utilize your procs will go a long way towards increasing your damage.
        </>
        {modules.hotStreakGuide.guideSubsection}
        {modules.heatingUpGuide.guideSubsection}
        {alwaysBeCastingSubsection}
      </Section>
      <Section title="Procs"></Section>
      <Section title="Cooldowns"></Section>
      <PreparationSection />
    </>
  );
}
