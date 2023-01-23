import { GuideProps, Section, SubSection } from 'interface/guide';

import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells">
        {modules.rejuvenation.guideSubsection}
        {modules.wildGrowth.guideSubsection}
        {modules.swiftmend.guideSubsection}
      </Section>
      <Section title="Healing Cooldowns">
        <HotGraphSubsection modules={modules} events={events} info={info} />
        <PreparationSection />
      </Section>
    </>
  );
}

function HotGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>HoT Graph</strong> - this graph shows how many Rejuvenation and Wild Growths you had
      active over the course of the encounter, with rule lines showing when you activated your
      healing cooldowns. Did you have a Wild Growth out before every cooldown? Did you ramp
      Rejuvenations well before big damage?
      {modules.hotCountGraph.plot}
    </SubSection>
  );
}
