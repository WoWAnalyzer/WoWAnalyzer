import { GuideProps, Section } from 'interface/guide';
import TALENTS from 'common/TALENTS/priest';
//import { TIERS } from 'game/TIERS';
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
          {/*modules.dotUptimes.guideSubsectionDP*/}
        </Section>
        <Section title="DoTs">{modules.dotUptimes.guideSubsection}</Section>
        {modules.shadowform.guideSubsection}
        <Section title="Active Time">
          <CastingSubsection.CastingSubsection modules={modules} events={events} info={info} />
        </Section>
      </Section>

      <Section title="Cooldowns">
        <Section title="Core Spells">
          <CooldownGraphSubsection.CoreCooldownsGraph />
        </Section>
        <Section title="Short Cooldowns">
          <CooldownGraphSubsection.ShortCooldownsGraph />
          {info.combatant.hasTalent(TALENTS.INSIDIOUS_IRE_TALENT) &&
            modules.insidiousIre.guideSubsection}
          {info.combatant.hasTalent(TALENTS.VOID_TORRENT_TALENT) &&
            modules.voidTorrent.guideSubsection}
          {/*info.combatant.hasTalent(TALENTS.VOID_VOLLEY_TALENT) &&
            modules.voidVolley.guideSubsection*/}
          {info.combatant.hasTalent(TALENTS.VOID_BLAST_TALENT) && modules.voidBlast.guideSubsection}
          {info.combatant.hasTalent(TALENTS.COLLAPSING_VOID_TALENT) &&
            modules.entropicRift.guideSubsectionCollapsingVoid}
          {info.combatant.hasTalent(TALENTS.DARKENING_HORIZON_TALENT) &&
            modules.entropicRift.guideSubsectionDarkeningHorizon}
          {info.combatant.hasTalent(TALENTS.TENTACLE_SLAM_TALENT) &&
            modules.tentacleSlam.guideSubsection}
        </Section>
        <Section title="Major Cooldowns">
          <CooldownGraphSubsection.LongCooldownsGraph />
          {info.combatant.hasTalent(TALENTS.VOIDFORM_TALENT) && modules.voidform.guideSubsection}
          {info.combatant.hasTalent(TALENTS.INESCAPABLE_TORMENT_TALENT) &&
            modules.inescapableTorment.guideSubsection}
        </Section>
      </Section>

      <Section title="Proc Usage">
        {info.combatant.hasTalent(TALENTS.SHADOWY_INSIGHT_TALENT) &&
          modules.shadowyInsight.guideSubsection}
        {info.combatant.hasTalent(TALENTS.MIND_DEVOURER_TALENT) &&
          modules.mindDevourer.guideSubsection}
        {info.combatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT) &&
          modules.surgeOfInsanity.guideSubsection}
      </Section>

      {/* TODO:
      <Section title="Action Priority List"></>
      */}

      <PreparationSection />
    </>
  );
}
