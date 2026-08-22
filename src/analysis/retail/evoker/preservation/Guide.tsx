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
  return (
    <>
      <Section title="Core Spells and Buffs">
        {modules.dreamBreath.guideSubsection}
        {info.combatant.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
          modules.resonatingSphere.guideSubsection}
        {modules.emeraldBlossom.guideSubsection}
        {modules.essenceBurst.guideSubsection}
      </Section>
      <Section title="Healing cooldowns">
        {info.combatant.hasTalent(TALENTS_EVOKER.DREAM_FLIGHT_TALENT) &&
          modules.dreamFlight.guideSubsection}
        {info.combatant.hasTalent(TALENTS_EVOKER.STASIS_TALENT) && modules.stasis.guideSubsection}
        {info.combatant.hasTalent(TALENTS_EVOKER.INNER_FLAME_TALENT) &&
          modules.innerFlame.guideSubsection}
      </Section>
      <PreparationSection />
    </>
  );
}
