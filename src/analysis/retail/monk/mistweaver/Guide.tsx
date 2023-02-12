import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import SPELLS from 'common/SPELLS';
import CombatLogParser from '../mistweaver/CombatLogParser';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells">
        {modules.renewingMist.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.RISING_SUN_KICK_TALENT) &&
          modules.risingSunKick.guideSubsection}
        {modules.thunderFocusTea.guideSubsection}
        <HotGraphSubsection modules={modules} events={events} info={info} />
      </Section>
      <Section title="Healing Cooldowns">
        <PreparationSection />
      </Section>
    </>
  );
}

function HotGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>HoT Graph</strong> - this graph shows how many{' '}
      <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} /> you have over the course of the fight in
      relation to your <SpellLink id={TALENTS_MONK.RISING_SUN_KICK_TALENT.id} /> and{' '}
      <SpellLink id={SPELLS.VIVIFY} /> casts.
      {modules.remGraph.plot}
    </SubSection>
  );
}
