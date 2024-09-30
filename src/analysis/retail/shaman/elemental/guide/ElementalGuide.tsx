import { GuideProps, Section } from 'interface/guide';
import TALENTS, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import CombatLogParser from '../CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { FlameShockSubSection } from './FlameShockSubSection';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';
import SPELLS from 'common/SPELLS';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as AplCheck from 'analysis/retail/shaman/elemental/apl/AplCheck';
import Cooldowns from 'analysis/retail/shaman/elemental/guide/Cooldowns';
import DefensiveAndUtility from '../../shared/guide/DefensiveAndUtility';

const PrefaceSection = () => {
  return (
    <Section title="Preface">
      <p>
        Hi, and welcome to the Elemental shaman WowAnalyzer page. The information on this page is
        mostly on how you can improve your DPS, however you must not put yourself in high risk of
        dying to do so. Always ensure you do appropriate mechanics correctly first, then focus on
        DPS as #2.
      </p>
      <p>
        The performance indicated here are <strong className="ok-mark">guidelines</strong>, and will
        vary from fight to fight and pull to pull. You should use the information here as a
        foundation for your own analysis.
      </p>
      <p>
        If you have any questions on the spec, rotation or this guide in general, you can find us in
        the <code>#elemental</code> channel in the{' '}
        <a href="https://discord.gg/earthshrine">Earthshrine Discord server</a>.
      </p>
    </Section>
  );
};

const ResourcesSection = (props: GuideProps<typeof CombatLogParser>) => {
  const { modules } = props;
  return (
    <Section title="Resource usage">
      {modules.maelstromDetails.guideSubsection}
      {modules.alwaysBeCasting.guideSubsection}
    </Section>
  );
};

/** A section for the core combo, abilities and buffs. */
const CoreSection = (props: GuideProps<typeof CombatLogParser>) => {
  const { info, modules } = props;
  return (
    <Section title="Core Abilities">
      {info.combatant.hasTalent(TALENTS_SHAMAN.STORMKEEPER_TALENT) &&
        modules.stormkeeper.guideSubsection()}
      {info.combatant.hasTalent(TALENTS.CALL_OF_THE_ANCESTORS_TALENT) &&
        modules.callOfTheAncestors.guideSubsection()}
      {modules.spenderWindow.active && modules.spenderWindow.guideSubsection()}
      {modules.primalStormElemental.active && modules.primalStormElemental.guideSubsection()}
      {modules.primalFireElemental.active && modules.primalFireElemental.guideSubsection()}
      <FlameShockSubSection {...props} />
    </Section>
  );
};

const enableRotation = false; // currently disabled due to unlogged Icefury buffs. Hidden buff to enable Icefury is not logged, so unable to check if Icefury is castable.

const RotationSection = ({ modules, info }: GuideProps<typeof CombatLogParser>) => {
  return (
    (enableRotation && (
      <Section title="Single Target Rotation">
        <AplSectionData checker={AplCheck.check} apl={AplCheck.apl(info)} />
      </Section>
    )) ||
    null
  );
};

const cooldownTalents: Cooldown[] = [
  {
    spell: SPELLS.STORMKEEPER_BUFF_AND_CAST,
    isActive: (c) => c.hasTalent(TALENTS.STORMKEEPER_TALENT),
  },
  {
    spell: TALENTS.LIQUID_MAGMA_TOTEM_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.LIQUID_MAGMA_TOTEM_TALENT),
  },
  {
    spell: TALENTS.STORM_ELEMENTAL_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT),
  },
  {
    spell: TALENTS.FIRE_ELEMENTAL_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.FIRE_ELEMENTAL_TALENT),
  },
];

/**
 */

/** The guide for Elemental Shamans. */
export default function ElementalGuide(props: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <PrefaceSection />
      <ResourcesSection {...props} />
      <Section title="Cooldown">
        <Cooldowns {...props} />
        <CooldownGraphSubsection cooldowns={cooldownTalents} />
      </Section>
      <CoreSection {...props} />
      <RotationSection {...props} />
      <DefensiveAndUtility />
      <PreparationSection />
    </>
  );
}
