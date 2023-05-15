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
          {modules.dotUptimes.guideSubsectionDP}
        </Section>
        <Section title="DoTs">{modules.dotUptimes.guideSubsection}</Section>

        <Section title="Spells">
          <CooldownGraphSubsection.CoreCooldownsGraph />
          {/* TODO: Add Active Time graph*/}
          <CastingSubsection.CastingSubsection modules={modules} events={events} info={info} />
        </Section>
      </Section>

      <Section title="Cooldowns">
        <Section title="Short Cooldowns">
          <CooldownGraphSubsection.ShortCooldownsGraph />
          {info.combatant.hasTalent(TALENTS.VOID_TORRENT_TALENT) &&
            modules.voidTorrent.guideSubsection}
          {info.combatant.hasTalent(TALENTS.SHADOW_CRASH_TALENT) &&
            modules.shadowCrash.guideSubsection}
        </Section>
        <Section title="Major Cooldowns">
          <CooldownGraphSubsection.LongCooldownsGraph />
          {info.combatant.hasTalent(TALENTS.VOID_ERUPTION_TALENT) &&
            modules.voidform.guideSubsection}
          {info.combatant.hasTalent(TALENTS.TWINS_OF_THE_SUN_PRIESTESS_TALENT) &&
            modules.twinsOfTheSunPriestess.guideSubsection}
        </Section>
      </Section>

      <Section title="Proc Usage">
        {info.combatant.hasTalent(TALENTS.SHADOWY_INSIGHT_TALENT) &&
          modules.shadowyInsight.guideSubsection}
        {info.combatant.hasTalent(TALENTS.MIND_DEVOURER_TALENT) &&
          modules.mindDevourer.guideSubsection}

        {info.combatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT) &&
          !info.combatant.hasTalent(TALENTS.MIND_SPIKE_TALENT) &&
          modules.mindFlayInsanity.guideSubsection}
        {info.combatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT) &&
          info.combatant.hasTalent(TALENTS.MIND_SPIKE_TALENT) &&
          modules.mindSpikeInsanity.guideSubsection}

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
