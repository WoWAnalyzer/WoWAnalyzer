import { GuideProps, Section } from 'interface/guide';
import TALENTS, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import CombatLogParser from '../CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { FlameShockSubSection } from './FlameShockSubSection';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';
import SPELLS from 'common/SPELLS';

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
      {(info.combatant.hasTalent(TALENTS_SHAMAN.STORMKEEPER_1_ELEMENTAL_TALENT) ||
        info.combatant.hasTalent(TALENTS_SHAMAN.STORMKEEPER_2_ELEMENTAL_TALENT)) &&
        modules.stormkeeper.guideSubsection()}
      {modules.spenderWindow.active && modules.spenderWindow.guideSubsection()}
      {modules.electrifiedShocks.active && modules.electrifiedShocks.guideSubsection}
      <FlameShockSubSection {...props} />
    </Section>
  );
};

const cooldownTalents: Cooldown[] = [
  {
    spell: SPELLS.STORMKEEPER_BUFF_AND_CAST,
    isActive: (c) => c.hasTalent(TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT),
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
  { spell: TALENTS.ICEFURY_TALENT, isActive: (c) => c.hasTalent(TALENTS.ICEFURY_TALENT) },
];

const defensiveTalents: Cooldown[] = [
  { spell: TALENTS.ASTRAL_SHIFT_TALENT, isActive: (c) => c.hasTalent(TALENTS.ASTRAL_SHIFT_TALENT) },
  {
    spell: TALENTS.EARTH_ELEMENTAL_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.EARTH_ELEMENTAL_TALENT),
  },
  {
    spell: TALENTS.NATURES_SWIFTNESS_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.NATURES_SWIFTNESS_TALENT),
  },
  {
    spell: TALENTS.ANCESTRAL_GUIDANCE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.ANCESTRAL_GUIDANCE_TALENT),
  },
  {
    spell: TALENTS.EARTHEN_WALL_TOTEM_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.EARTHEN_WALL_TOTEM_TALENT),
  },
  {
    spell: TALENTS.SPIRITWALKERS_GRACE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.SPIRITWALKERS_GRACE_TALENT),
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
        <CooldownGraphSubsection cooldowns={cooldownTalents} />
      </Section>
      <CoreSection {...props} />
      <Section title="Defensive and utility">
        <CooldownGraphSubsection
          cooldowns={defensiveTalents}
          description={
            <p>
              <strong>Defensives and utility</strong> - Defensive and utility talent usage may vary
              from fight to fight. They may need to be delayed for specific mechanics. In general,
              any amount of usage is good, but anywhere you could fit in another usage is a
              theoretical loss.
            </p>
          }
        />
      </Section>
      <PreparationSection />
    </>
  );
}
