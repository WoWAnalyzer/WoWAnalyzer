import { GuideProps, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from '../CombatLogParser';
import CooldownGraphSubsection from './CooldownGraphSubsection';
import { ResourceLink, SpellLink } from 'interface';
import talents from 'common/TALENTS/paladin';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSection modules={modules} info={info} events={events} />
      <Section title="Healing cooldowns">
        <CooldownGraphSubsection />
      </Section>

      {info.combatant.hasTalent(talents.BLESSING_OF_SUMMER_TALENT) && (
        <Section title="Other cooldowns and buffs">
          {modules.blessingOfTheSeasons.guideSubsection}
        </Section>
      )}
      <PreparationSection />
    </>
  );
}

const CoreSection = ({ modules, info, events }: GuideProps<typeof CombatLogParser>) => {
  const holyPowerWasted = modules.holyPowerTracker.wasted;
  return (
    <Section title="Core">
      {modules.holyShock.guideSubsection}
      {info.combatant.hasTalent(talents.HOLY_PRISM_TALENT) && modules.holyPrism.guideSubsection}
      {info.combatant.hasTalent(talents.BEACON_OF_VIRTUE_TALENT)
        ? modules.beaconOfVirtue.guideSubsection
        : modules.beaconUptime.guideSubsection}

      <SubSection title="Holy Power">
        <p>
          With <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> spenders being so powerful, you
          should make a priority of wasting as little as possible. If there is no healing to do, do
          not be afraid to spend with <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} />.
        </p>
        <p>
          You wasted <strong>{holyPowerWasted}</strong>{' '}
          <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />.
        </p>
        {modules.holyPowerGraph.plot}
      </SubSection>
    </Section>
  );
};
