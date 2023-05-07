import { TALENTS_EVOKER } from 'common/TALENTS';
import { GuideProps, Section } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from '../preservation/CombatLogParser';
import styled from '@emotion/styled';
/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export const GuideContainer = styled.div`
  font-size: 18px;
  padding: 2px;
  display: grid;
  grid-column-gap: 0;
  grid-template-columns: 154px 1fr;
  align-items: center;
`;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const isEbBuild = info.combatant.hasTalent(TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT);
  return (
    <>
      <Section title="Core Spell">
        {modules.dreamBreath.guideSubsection}
        {modules.spiritBloom.guideSubsection}
        {info.combatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT) &&
          !isEbBuild &&
          modules.resonatingSphere.guideSubsection}
      </Section>
      <Section title="Healing cooldowns">
        {info.combatant.hasTalent(TALENTS_EVOKER.DREAM_FLIGHT_TALENT) &&
          modules.dreamFlight.guideSubsection}
        {info.combatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT) &&
          info.combatant.hasTalent(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT) &&
          modules.emeraldCommunion.guideSubsection}
      </Section>
      <PreparationSection />
    </>
  );
}
