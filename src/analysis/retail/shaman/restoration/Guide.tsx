import { GuideProps, Section, SubSection, useAnalyzers } from 'interface/guide';
import CombatLogParser from '../restoration/CombatLogParser';
import TALENTS from 'common/TALENTS/shaman';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import FoundationDowntimeSectionV2 from 'interface/guide/foundation/FoundationDowntimeSectionV2';
import AstralShift from 'src/analysis/retail/shaman/shared/talents/AstralShift';
import EarthElemental from 'src/analysis/retail/shaman/shared/talents/EarthElemental';
import Explanation from 'interface/guide/components/Explanation';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import AllCooldownUsageList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;
const DEFENSIVE_ANALYZERS = [AstralShift, EarthElemental];

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Always Be Casting">
        <FoundationDowntimeSectionV2 />
      </Section>
      <CoreSpells modules={modules} events={events} info={info} />
      <CooldownGraph modules={modules} events={events} info={info} />
      <AdvancedHoTandBufftracking modules={modules} events={events} info={info} />
      <DefensivesSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function CoreSpells({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core Spells and Buffs">
      {modules.riptide.guideSubsection}
      {info.combatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT)
        ? modules.surgingTotem.guideSubsection
        : info.combatant.hasTalent(TALENTS.HEALING_RAIN_TALENT) &&
          modules.healingRain.guideSubsection}
      {info.combatant.hasTalent(TALENTS.ANCESTRAL_SWIFTNESS_TALENT)
        ? modules.naturesSwiftness.farseerGuideSubsection
        : modules.naturesSwiftness.guideSubsection}
      {info.combatant.hasTalent(TALENTS.EARTH_SHIELD_TALENT) && modules.earthShield.guideSubsection}
      {info.combatant.hasTalent(TALENTS.UNLEASH_LIFE_TALENT) && modules.unleashLife.guideSubsection}
      {modules.healingStreamTotem.guideSubsection}
    </Section>
  );
}
function CooldownGraph({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Healing Cooldowns">
      {modules.ascendance.guideSubsection}
      <SubSection>
        <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
        you waited to use them again. Grey segments show when the spell was available, yellow
        segments show when the spell was cooling down. Red segments highlight times when you could
        have fit a whole extra use of the cooldown.
        {info.combatant.hasTalent(TALENTS.SPIRIT_LINK_TOTEM_TALENT) && (
          <CastEfficiencyBar
            spell={TALENTS.SPIRIT_LINK_TOTEM_TALENT}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
        {info.combatant.hasTalent(TALENTS.HEALING_TIDE_TOTEM_TALENT) && (
          <CastEfficiencyBar
            spell={TALENTS.HEALING_TIDE_TOTEM_TALENT}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
        {info.combatant.hasTalent(TALENTS.ASCENDANCE_RESTORATION_TALENT) && (
          <CastEfficiencyBar
            spell={TALENTS.ASCENDANCE_RESTORATION_TALENT}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
      </SubSection>
    </Section>
  );
}

function AdvancedHoTandBufftracking({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Advanced HoT and Buff tracking">
      {info.combatant.hasTalent(TALENTS.UNDERCURRENT_TALENT) && (
        <SubSection>{modules.undercurrentGraph.guideSubsection}</SubSection>
      )}
      {info.combatant.hasTalent(TALENTS.TIDAL_WAVES_TALENT) && (
        <SubSection>{modules.tidalWaves.guideSubsection}</SubSection>
      )}
      {info.combatant.hasTalent(TALENTS.COALESCING_WATER_TALENT) && (
        <SubSection>{modules.coalescingWaterGraph.guideSubsection}</SubSection>
      )}
    </Section>
  );
}

function DefensivesSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Defensives">
      <HideExplanationsToggle id="hide-explanations-major-defensives" />
      <Explanation>
        Taking less damage yourself is helping your fellow healers &mdash; or in a dungeon, healing
        you don't have to do. Using major defensive cooldowns <strong>before</strong> impact is key
        to survive on higher difficulties.
      </Explanation>
      <SubSection title="Damage Taken">
        <Timeline analyzers={useAnalyzers(DEFENSIVE_ANALYZERS)} />
      </SubSection>
      <AllCooldownUsageList analyzers={useAnalyzers(DEFENSIVE_ANALYZERS)} showTitles />
    </Section>
  );
}
