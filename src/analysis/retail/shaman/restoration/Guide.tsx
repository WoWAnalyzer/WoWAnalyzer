import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from '../restoration/CombatLogParser';
import talents from 'common/TALENTS/shaman';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells and Buffs">
        {modules.riptide.guideSubsection}
        {info.combatant.hasTalent(talents.SURGING_TOTEM_TALENT)
          ? modules.surgingTotem.guideSubsection
          : modules.healingRain.guideSubsection}
        {info.combatant.hasTalent(talents.EARTH_SHIELD_TALENT) &&
          modules.earthShield.guideSubsection}
        {info.combatant.hasTalent(talents.UNLEASH_LIFE_TALENT) &&
          modules.unleashLife.guideSubsection}
      </Section>
      <Section title="Short Cooldowns">
        {info.combatant.hasTalent(talents.CLOUDBURST_TOTEM_TALENT) &&
          modules.cloudburstTotem.guideSubsection}
        {info.combatant.hasTalent(talents.WELLSPRING_TALENT) && modules.wellspring.guideSubsection}
        {info.combatant.hasTalent(talents.PRIMORDIAL_WAVE_RESTORATION_TALENT) &&
          modules.primordialWave.guideSubsection}
        {info.combatant.hasTalent(talents.EARTHEN_WALL_TOTEM_TALENT) &&
          modules.earthenWallTotem.guideSubsection}
      </Section>
      <Section title="Healing Cooldowns">
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
      </Section>

      {info.combatant.hasTalent(talents.NATURES_SWIFTNESS_TALENT) && (
        <Section title="Mana efficiency">{modules.naturesSwiftness.guideSubsection}</Section>
      )}

      <PreparationSection />
    </>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      {info.combatant.hasTalent(talents.SPIRIT_LINK_TOTEM_TALENT) && (
        <CastEfficiencyBar
          spellId={talents.SPIRIT_LINK_TOTEM_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(talents.HEALING_TIDE_TOTEM_TALENT) && (
        <CastEfficiencyBar
          spellId={talents.HEALING_TIDE_TOTEM_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(talents.ASCENDANCE_RESTORATION_TALENT) && (
        <CastEfficiencyBar
          spellId={talents.ASCENDANCE_RESTORATION_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(talents.ANCESTRAL_GUIDANCE_TALENT) && (
        <CastEfficiencyBar
          spellId={talents.ANCESTRAL_GUIDANCE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(talents.SPIRITWALKERS_TIDAL_TOTEM_TALENT) && (
        <CastEfficiencyBar
          spellId={talents.MANA_TIDE_TOTEM_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
    </SubSection>
  );
}
