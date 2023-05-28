import { GuideProps, Section, SubSection } from 'interface/guide';
import Expansion from 'game/Expansion';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CastingSubsection from './modules/guide/CastingSubsection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core">
        <SubSection title="Curses">{modules.curseUptime.guideSubsection}</SubSection>
        <SubSection title="DoTs and Debuffs">{modules.dotUptimes.guideSubsection}</SubSection>
        <SubSection title="Spells">
          <CastingSubsection.CastingSubsection modules={modules} events={events} info={info} />
        </SubSection>
      </Section>

      <Section title="Cooldowns"></Section>

      <Section title="Procs"></Section>

      <PreparationSection expansion={Expansion.WrathOfTheLichKing} />
    </>
  );
}
