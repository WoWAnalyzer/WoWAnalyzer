import { clsx } from 'clsx';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { GuideProps, Section } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import CombatLogParser from '../preservation/CombatLogParser';
import styles from './Guide.module.scss';
/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export const GuideContainer = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={clsx(styles.guideContainer, className)} />
  ),
);

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
        {modules.dreamBreath.guideSubsection}
        {modules.spiritBloom.guideSubsection}
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
