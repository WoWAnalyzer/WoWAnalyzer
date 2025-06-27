import CombatLogParser from '../CombatLogParser';
import { GuideProps, Section, SubSection } from 'interface/guide';
import { IntroSection } from './guide/IntroSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IntroSection />

      <Section title="Efficiency Tracking">
        <p>
          Track how efficiently you're using your core abilities and procs. Aim for green ratings
          across all categories.
        </p>

        <SubSection title="Sudden Doom">{modules.suddenDoom.guideSubsection}</SubSection>
        <SubSection title="Virulent Plague Efficiency">
          {modules.virulentPlagueEfficiency.guideSubsection}
        </SubSection>
        <SubSection title="Festering Wound Efficiency">
          {modules.woundTracker.guideSubsection}
        </SubSection>
      </Section>
    </>
  );
}
