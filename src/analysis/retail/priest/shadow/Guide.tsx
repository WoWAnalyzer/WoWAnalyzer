import { GuideProps, Section, SubSection } from 'interface/guide';
import TALENTS from 'common/TALENTS/priest';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CooldownGraphSubsection from './modules/guide/CooldownGraphSubsection';
import ResourceSubsection from './modules/guide/ResourceSubsection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core">
        <ResourceSubsection.ResourceSubsection modules={modules} events={events} info={info} />
        {modules.dotUptimes.guideSubsectionDP}
        {modules.dotUptimes.guideSubsection}
        {info.combatant.hasTalent(TALENTS.DARK_EVANGELISM_TALENT) &&
          modules.dotUptimes.guideSubsectionDE}

        {/* TODO: SW:D only during execute, and add Mindblast.
          <CooldownGraphSubsection.CoreCooldownsGraph />
        */}
      </Section>

      <Section title="Cooldowns">
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
        <p>
          <SubSection>Coming Soon!</SubSection>
        </p>
      </Section>

      <PreparationSection />
    </>
  );
}
