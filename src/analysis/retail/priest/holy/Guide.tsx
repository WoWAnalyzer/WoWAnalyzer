import SPELLS from 'common/SPELLS';
import { GuideProps, Section, SubSection } from 'interface/guide';
import { GapHighlight } from 'parser/ui/CooldownBar';

import CombatLogParser from './CombatLogParser';
import { TALENTS_PRIEST } from 'common/TALENTS';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';

export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Holy Words">
        {/* This section should cover effective usage of our holy words. */}
        {/* Can have three sections, one for each holy words cast effectiveness */}
        {/* A third section for going over wasted CDR */}
      </Section>
      <Section title="Core Spells">
        {/* This section should cover effective usage of Holy's core spells */}
        {/* Lightweaver section that highlights casts of heal with no LW buff, and casts of flash heal with 1 or 2 stacks of LW. */}
        {/* PoH casts section that highlights good and bad casts of PoH. 
          Good cast would be sanctify off cd, 5 targets hit, no full overheal, Prayer Circle buff active
          Green if all are true, yellow if one is true
          Red if more than one is true */}
        {/* Circle of Healing Casts, check targets hit  */}
        {/* PoM casted on cooldown, use castefficiency bar maybe? */}
        {modules.prayerOfHealing.guideSubsection}
      </Section>
      <Section title="Healing Cooldowns">
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
      </Section>
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
      {info.combatant.hasTalent(TALENTS_PRIEST.DIVINE_WORD_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_PRIEST.DIVINE_WORD_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_PRIEST.DIVINE_HYMN_TALENT.id) && (
        <CastEfficiencyBar
          spellId={SPELLS.DIVINE_HYMN_HEAL.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_PRIEST.APOTHEOSIS_TALENT.id) && (
        <CastEfficiencyBar
          spellId={TALENTS_PRIEST.APOTHEOSIS_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT.id) && (
        <CastEfficiencyBar
          spellId={TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
    </SubSection>
  );
}
