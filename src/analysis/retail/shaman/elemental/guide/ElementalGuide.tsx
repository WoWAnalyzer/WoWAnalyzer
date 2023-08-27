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
      <PrefaceSection />
      <CoreSection {...props} />
      <CooldownSection {...props} />
      <ResourceSection {...props} />
      <DefensiveSection {...props} />
      <PreparationSection />
    </>
  );
}

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

/** A section for the core combo, abilities and buffs. */
const CoreSection = (props: GuideProps<typeof CombatLogParser>) => {
  const { info, modules } = props;
  return (
    <Section title="Core Abilities">
      {info.combatant.hasTalent(TALENTS_SHAMAN.STORMKEEPER_1_ELEMENTAL_TALENT) &&
        modules.stormkeeper.guideSubsection()}
      {modules.spenderWindow.active && modules.spenderWindow.guideSubsection()}
      {modules.maelstromDetails.guideSubsection}
      {modules.alwaysBeCasting.guideSubsection}
      {modules.icefury.guideSubsection}
      {info.combatant.hasTalent(TALENTS_SHAMAN.MASTER_OF_THE_ELEMENTS_TALENT) &&
        modules.masterOfTheElements.guideSubsection()}
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
