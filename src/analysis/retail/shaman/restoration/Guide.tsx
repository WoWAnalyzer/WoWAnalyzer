import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from '../restoration/CombatLogParser';
import talents from 'common/TALENTS/shaman';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells and Buffs">
        {modules.riptide.guideSubsection}
        {modules.healingRain.guideSubsection}
        {info.combatant.hasTalent(talents.UNLEASH_LIFE_TALENT) &&
          modules.unleashLife.guideSubsection}
      </Section>
      <Section title="Short Cooldowns">
        {info.combatant.hasTalent(talents.CLOUDBURST_TOTEM_TALENT) &&
          modules.cloudburstTotem.guideSubsection}
        {info.combatant.hasTalent(talents.PRIMORDIAL_WAVE_TALENT) &&
          modules.primordialWave.guideSubsection}
        {info.combatant.hasTalent(talents.EARTHEN_WALL_TOTEM_TALENT) &&
          modules.earthenWallTotem.guideSubsection}
        {info.combatant.hasTalent(talents.WELLSPRING_TALENT) && modules.wellspring.guideSubsection}
      </Section>
      <Section title="Healing Cooldowns"></Section>
      <PreparationSection />
    </>
  );
}
