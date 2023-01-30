import { GuideProps, Section, SubSection } from 'interface/guide';
import TALENTS from 'common/TALENTS/priest';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CooldownGraphSubsection from './modules/guide/CooldownGraphSubsection';
import ResourceSubsection from './modules/guide/ResourceSubsection';
import CastingSubsection from './modules/guide/CastingSubsection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core">
        <Section title="Insanity">
          <ResourceSubsection.ResourceSubsection modules={modules} events={events} info={info} />{' '}
          {/* TODO: Get Insanity Graph working*/}
          {modules.dotUptimes.guideSubsectionDP}
        </Section>
        <Section title="DoTs">{modules.dotUptimes.guideSubsection}</Section>

        <Section title="Spells">
          {/* TODO: Fix SW:D efficency*/}
          <CooldownGraphSubsection.CoreCooldownsGraph />
          {/* TODO: Add Active Time graph*/}
          <CastingSubsection.CastingSubsection modules={modules} events={events} info={info} />
        </Section>
      </Section>

      <Section title="Cooldowns">
        {/* TODO: fix precast shadow crash*/}
        <CooldownGraphSubsection.ShortCooldownsGraph />
        <CooldownGraphSubsection.LongCooldownsGraph />
      </Section>

      <Section title="Proc Usage">
        {info.combatant.hasTalent(TALENTS.SHADOWY_INSIGHT_TALENT) &&
          modules.shadowyInsight.guideSubsection}
        {info.combatant.hasTalent(TALENTS.MIND_DEVOURER_TALENT) &&
          modules.mindDevourer.guideSubsection}
        {info.combatant.hasTalent(TALENTS.MIND_FLAY_INSANITY_TALENT) &&
          modules.mindFlayInsanity.guideSubsection}
        {info.combatant.hasTalent(TALENTS.SURGE_OF_DARKNESS_TALENT) &&
          modules.surgeOfDarkness.guideSubsection}
        {info.combatant.hasTalent(TALENTS.UNFURLING_DARKNESS_TALENT) &&
          modules.unfurlingDarkness.guideSubsection}
        {info.combatant.hasTalent(TALENTS.DEATHSPEAKER_TALENT) &&
          modules.deathspeaker.guideSubsection}
      </Section>

      <Section title="Action Priority List">
        <SubSection>Coming Soon!</SubSection>
      </Section>

      <PreparationSection />
    </>
  );
}
