import { GuideProps, Section } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import FoundationDowntimeSectionV2 from 'interface/guide/foundation/FoundationDowntimeSectionV2';
import CombatLogParser from '../CombatLogParser';
import CooldownGraphSubsection from './CooldownGraphSubsection';
import talents from 'common/TALENTS/paladin';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Always Be Casting">
        <FoundationDowntimeSectionV2 />
      </Section>
      <CoreSection modules={modules} info={info} events={events} />
      <InfusionOfLightSection modules={modules} info={info} events={events} />
      <Section title="Healing cooldowns">
        <CooldownGraphSubsection />
      </Section>
      <PreparationSection />
    </>
  );
}

const CoreSection = ({ modules, info, events }: GuideProps<typeof CombatLogParser>) => {
  return (
    <Section title="Core">
      {modules.holyShock.guideSubsection}
      {modules.judgment.guideSubsection}
      {info.combatant.hasTalent(talents.HOLY_PRISM_TALENT) && modules.holyPrism.guideSubsection}
      {info.combatant.hasTalent(talents.BEACON_OF_VIRTUE_TALENT)
        ? modules.beaconOfVirtue.guideSubsection
        : modules.beaconUptime.guideSubsection}
      {modules.holyPowerOverview.guideSubsection}
    </Section>
  );
};

/** Infusion of Light and the spells it empowers, which only make sense read together. */
const InfusionOfLightSection = ({ modules, info }: GuideProps<typeof CombatLogParser>) => {
  if (!info.combatant.hasTalent(talents.INFUSION_OF_LIGHT_TALENT)) {
    return null;
  }

  return (
    <Section title="Infusion of Light">
      {modules.infusionOfLight.guideSubsection}
      {modules.flashOfLightUsage.guideSubsection}
    </Section>
  );
};
