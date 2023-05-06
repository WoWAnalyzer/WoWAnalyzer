import { TALENTS_EVOKER } from 'common/TALENTS';
import { GuideProps, Section } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from '../preservation/CombatLogParser';
/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const isEbBuild = info.combatant.hasTalent(TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT);
  return (
    <>
      <Section title="Core Spells and Buffs">
        {modules.dreamBreath.guideSubsection}
        {modules.spiritBloom.guideSubsection}
        {info.combatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT) &&
          !isEbBuild &&
          modules.resonatingSphere.guideSubsection}
      </Section>
      <PreparationSection />
    </>
  );
}
