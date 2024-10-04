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
  const includeTalentSection =
    info.combatant.hasTalent(TALENTS_EVOKER.OUROBOROS_TALENT) ||
    info.combatant.hasTalent(TALENTS_EVOKER.STASIS_TALENT) ||
    isEbBuild;
  return (
    <>
      <Section title="Core Spells and Buffs">
        {info.combatant.hasTalent(TALENTS_EVOKER.ENGULF_TALENT) &&
          modules.consumeFlame.guideSubsection}
        {!info.combatant.hasTalent(TALENTS_EVOKER.ENGULF_TALENT) &&
          modules.dreamBreath.guideSubsection}
        {!info.combatant.hasTalent(TALENTS_EVOKER.ENGULF_TALENT) &&
          modules.spiritBloom.guideSubsection}
        {modules.essenceBurst.guideSubsection}
        {info.combatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT) &&
          !isEbBuild &&
          modules.resonatingSphere.guideSubsection}
        {isEbBuild && modules.emeraldBlossom.guideSubsection}
      </Section>
      <Section title="Healing cooldowns">
        {info.combatant.hasTalent(TALENTS_EVOKER.DREAM_FLIGHT_TALENT) &&
          modules.dreamFlight.guideSubsection}
        {info.combatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT) &&
          info.combatant.hasTalent(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT) &&
          modules.emeraldCommunion.guideSubsection}
      </Section>
      {includeTalentSection && (
        <Section title="Talents">
          {info.combatant.hasTalent(TALENTS_EVOKER.OUROBOROS_TALENT) &&
            modules.ouroboros.guideSubsection}
          {info.combatant.hasTalent(TALENTS_EVOKER.STASIS_TALENT) && modules.stasis.guideSubsection}
          {isEbBuild &&
            info.combatant.hasTalent(TALENTS_EVOKER.ANCIENT_FLAME_TALENT) &&
            modules.ancientFlame.guideSubsection}
        </Section>
      )}
      <PreparationSection />
    </>
  );
}
