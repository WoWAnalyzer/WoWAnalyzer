import { GuideProps, Section } from 'interface/guide';
import TALENTS, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import CombatLogParser from '../CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { SpellLink } from 'interface';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from '../constants';
import { FlameShockGuide } from './FlameShockGuide';

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
      <FlameShockGuide {...props} />
    </Section>
  );
};

const cooldownTalents = [
  TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT,
  TALENTS.NATURES_SWIFTNESS_TALENT,
  TALENTS.LIQUID_MAGMA_TOTEM_TALENT,
  TALENTS.STORM_ELEMENTAL_TALENT,
  TALENTS.FIRE_ELEMENTAL_TALENT,
];

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

const ResourceSection = ({ modules }: GuideProps<typeof CombatLogParser>) => {
  const explanation = (
    <>
      <p>
        Maelstrom is the primary resource of elemental shamans. It empowers our most powerful
        spells: <SpellLink id={TALENTS.EARTH_SHOCK_TALENT} />,
        <SpellLink id={TALENTS.EARTHQUAKE_TALENT} /> and{' '}
        <SpellLink id={TALENTS.ELEMENTAL_BLAST_TALENT} />. These spells are almost always more
        powerful than the alternatives so you will want to cast them as much as possible.
      </p>
      <p>
        Maelstrom has a cap of 100 (or 150 with <SpellLink id={TALENTS.SWELLING_MAELSTROM_TALENT} />
        ). Any maelstrom generated past that cap is wasted and will not contribute to your damage.
      </p>
    </>
  );

  const data = (
    <RoundedPanel>
      <BoringResourceValue
        resource={{ id: 11 }}
        label="Wasted Maelstrom"
        value={modules.maelstromDetails.wasted}
      />
    </RoundedPanel>
  );

  return (
    <Section title="Resources">
      <ExplanationAndDataSubSection
        explanation={explanation}
        data={data}
        explanationPercent={GUIDE_EXPLANATION_PERCENT_WIDTH}
      />
    </Section>
  );
};

const defensiveTalents = [
  TALENTS.ASTRAL_SHIFT_TALENT,
  TALENTS.EARTH_ELEMENTAL_TALENT,
  TALENTS.ANCESTRAL_GUIDANCE_TALENT,
  TALENTS.EARTHEN_WALL_TOTEM_TALENT,
  TALENTS.SPIRITWALKERS_GRACE_TALENT,
];

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
