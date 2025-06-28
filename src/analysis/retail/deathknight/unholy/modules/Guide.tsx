import CombatLogParser from '../CombatLogParser';
import { GuideProps, Section, SubSection } from 'interface/guide';
import { IntroSection } from './guide/IntroSection';
import Cooldowns from './guide/Cooldowns';

export default function UnholyGuide(props: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IntroSection />
      <Section title="Cooldown Tracking">
        <Cooldowns {...props} />
      </Section>

      <Section title="Efficiency Tracking">
        <p>
          Track how efficiently you're using your core abilities and procs. Aim for green ratings
          across all categories.
        </p>

        <SubSection title="Sudden Doom">{props.modules.suddenDoom.guideSubsection}</SubSection>
        <SubSection title="Virulent Plague Efficiency">
          {props.modules.virulentPlagueEfficiency.guideSubsection}
        </SubSection>
        <SubSection title="Festering Wound Efficiency">
          {props.modules.woundTracker.guideSubsection}
        </SubSection>
      </Section>
    </>
  );
}
