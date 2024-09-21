import { GuideProps, Section, SubSection } from 'interface/guide';
import { GapHighlight } from 'parser/ui/CooldownBar';

import CombatLogParser from './CombatLogParser';
import { TALENTS_PRIEST } from 'common/TALENTS';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';

export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Healing Cooldowns">
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
      </Section>
      <Section title="Core Spells">
        {/* This section should cover effective usage of Holy's core spells */}
        {/* Divine Word Casts, idk how to explore this.  */}
        {modules.prayerOfMending.guideSubsection}
        {modules.Lightweaver.guideSubsection}
        {/* Surge of Light Stacks Capped */}
        {modules.circleOfHealing.guideSubsection}
        {modules.prayerOfHealing.guideSubsection}
        {modules.DivineStar.guideSubsectionHoly}
      </Section>
      <Section title="Holy Words">
        {/* This section should cover effective usage of our holy words. */}
        {/* Can have three sections, one for each holy words cast effectiveness */}
        {/* A third section for going over wasted CDR */}
        {modules.holyWordSerenity.guideSubsection}
        {modules.holyWordSanctify.guideSubsection}
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
      whole extra use of the cooldown.<br></br>
      <br></br>
      These cooldowns are our strongest healing abilities, and using them as often as possible
      during raid damage spikes in encounters is crucial.<br></br>
      <br></br>
      {info.combatant.hasTalent(TALENTS_PRIEST.HALO_SHARED_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_PRIEST.HALO_SHARED_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_PRIEST.DIVINE_HYMN_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_PRIEST.DIVINE_HYMN_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_PRIEST.APOTHEOSIS_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_PRIEST.APOTHEOSIS_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
    </SubSection>
  );
}
