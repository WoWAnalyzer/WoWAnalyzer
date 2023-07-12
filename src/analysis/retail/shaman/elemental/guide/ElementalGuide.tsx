import { GuideProps, Section } from 'interface/guide';
import TALENTS, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import CombatLogParser from '../CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { FlameShockSubSection } from './FlameShockSubSection';
import { MaelstromSubSection } from './MaelstromSubSection';

/** The guide for Elemental Shamans. */
export default function ElementalGuide(props: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSection {...props} />
      <CooldownSection {...props} />
      <ResourceSection {...props} />
      <DefensiveSection {...props} />
      <PreparationSection />
    </>
  );
}

/** A section for the core combo, abilities and buffs. */
const CoreSection = (props: GuideProps<typeof CombatLogParser>) => {
  const { info, modules } = props;
  return (
    <Section title="Core Abilities">
      {info.combatant.hasTalent(TALENTS_SHAMAN.STORMKEEPER_1_ELEMENTAL_TALENT) &&
        modules.stormkeeper.guideSubsection()}
      {info.combatant.hasTalent(TALENTS_SHAMAN.MASTER_OF_THE_ELEMENTS_TALENT) &&
        modules.masterOfTheElements.guideSubsection()}
      {info.combatant.hasTalent(TALENTS_SHAMAN.SURGE_OF_POWER_TALENT) &&
        modules.surgeOfPower.guideSubsection()}
      <FlameShockSubSection {...props} />
    </Section>
  );
};

/** The list of cooldowns to show. */
const cooldownTalents = [
  TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT,
  TALENTS.NATURES_SWIFTNESS_TALENT,
  TALENTS.LIQUID_MAGMA_TOTEM_TALENT,
  TALENTS.STORM_ELEMENTAL_TALENT,
  TALENTS.FIRE_ELEMENTAL_TALENT,
];

/** A section with basic cooldown efficiency information. */
const CooldownSection = ({ info }: GuideProps<typeof CombatLogParser>) => (
  <Section title="Cooldowns">
    <p>
      You should endeavor to use your offensive cooldowns whenever possible as they will increase
      your overall DPS.
    </p>
    {cooldownTalents.map(
      (talent) =>
        info.combatant.hasTalent(talent) && (
          <CastEfficiencyBar
            spellId={talent.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        ),
    )}
  </Section>
);

/** A section for information on resource usage. */
const ResourceSection = (props: GuideProps<typeof CombatLogParser>) => {
  return (
    <Section title="Resources">
      <MaelstromSubSection {...props} />
    </Section>
  );
};

/** The list of defensive/utility cooldowns to track. */
const defensiveTalents = [
  TALENTS.ASTRAL_SHIFT_TALENT,
  TALENTS.EARTH_ELEMENTAL_TALENT,
  TALENTS.ANCESTRAL_GUIDANCE_TALENT,
  TALENTS.EARTHEN_WALL_TOTEM_TALENT,
  TALENTS.SPIRITWALKERS_GRACE_TALENT,
];

/** A section with basic defensives efficiency information. */
const DefensiveSection = ({ info }: GuideProps<typeof CombatLogParser>) => (
  <Section title="Defensives">
    <p>
      Defensive talent usage may vary from fight to fight. They may need to be delayed for specific
      mechanics. In general, any amount of usage is good, but anywhere you could fit in another
      usage is a loss.
    </p>
    {defensiveTalents.map(
      (talent) =>
        info.combatant.hasTalent(talent) && (
          <CastEfficiencyBar
            spellId={talent.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        ),
    )}
  </Section>
);
