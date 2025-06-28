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

      <Section title="Proc Efficiency">
        <SubSection title="Sudden Doom">{props.modules.suddenDoom.guideSubsection}</SubSection>
        <SubSection title="Soul Reaper">{props.modules.soulReaper.guideSubsection}</SubSection>
      </Section>
    </>
  );
}
