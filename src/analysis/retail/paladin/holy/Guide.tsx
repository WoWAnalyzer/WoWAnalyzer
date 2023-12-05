import { GuideProps, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from 'analysis/retail/paladin/holy/CombatLogParser';
import talents from 'common/TALENTS/paladin';
import spells from 'common/SPELLS/paladin';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells and Buffs">{modules.holyShock.guideSubSection}</Section>
      <Section title="Healing Cooldowns">
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
      </Section>
      <PreparationSection />
    </>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const avengingWrathId = info.combatant.hasTalent(talents.AVENGING_CRUSADER_TALENT)
    ? talents.AVENGING_CRUSADER_TALENT.id
    : spells.AVENGING_WRATH.id;

  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      <CastEfficiencyBar
        spellId={avengingWrathId}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
      <CastEfficiencyBar
        spellId={spells.AURA_MASTERY.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
      {info.combatant.hasTalent(talents.DAYBREAK_TALENT) && (
        <CastEfficiencyBar
          spellId={talents.DAYBREAK_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(talents.DIVINE_TOLL_TALENT) && (
        <CastEfficiencyBar
          spellId={talents.DIVINE_TOLL_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(talents.HAND_OF_DIVINITY_TALENT) && (
        <CastEfficiencyBar
          spellId={talents.HAND_OF_DIVINITY_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(talents.DIVINE_FAVOR_TALENT) && (
        <CastEfficiencyBar
          spellId={talents.DIVINE_FAVOR_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(talents.TYRS_DELIVERANCE_TALENT) && (
        <CastEfficiencyBar
          spellId={talents.TYRS_DELIVERANCE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
    </SubSection>
  );
}
