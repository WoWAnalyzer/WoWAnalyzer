import { TALENTS_EVOKER } from 'common/TALENTS';
import { GuideProps, Section } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from '../preservation/CombatLogParser';
import cssComponent from 'interface/utils/css-component';
import styles from './Guide.module.scss';
/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export const GuideContainer = cssComponent('div', styles.GuideContainer, [] as const);

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const includeTalentSection = false; /*
    info.combatant.hasTalent(TALENTS_EVOKER.OUROBOROS_TALENT) ||
    info.combatant.hasTalent(TALENTS_EVOKER.STASIS_TALENT)
    */
  return (
    <>
      <Section title="Core Spells and Buffs">
        {modules.merithrasBlessing.guideSubsection}
        {modules.dreamBreath.guideSubsection}
        {modules.essenceBurst.guideSubsection}
        {info.combatant.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
          modules.resonatingSphere.guideSubsection}
        {modules.emeraldBlossom.guideSubsection}
      </Section>
      <Section title="Healing cooldowns">
        {info.combatant.hasTalent(TALENTS_EVOKER.DREAM_FLIGHT_TALENT) &&
          modules.dreamFlight.guideSubsection}
      </Section>
      {includeTalentSection && (
        <Section title="Talents">
          {info.combatant.hasTalent(TALENTS_EVOKER.OUROBOROS_TALENT) &&
            modules.ouroboros.guideSubsection}
          {/*info.combatant.hasTalent(TALENTS_EVOKER.STASIS_TALENT) && modules.stasis.guideSubsection*/}
        </Section>
      )}
      <PreparationSection />
    </>
  );
}
