import { GuideProps, Section, SubSection } from 'interface/guide';
import { GapHighlight } from 'parser/ui/CooldownBar';

import CombatLogParser from './CombatLogParser';
import { TALENTS_PRIEST } from 'common/TALENTS';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';

export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      {/* TODO: HOLY WORD GUIDE SECTION */}
      {/* <Section title="Holy Words"> */}
      {/* This section should cover effective usage of our holy words. */}
      {/* Can have three sections, one for each holy words cast effectiveness */}
      {/* A third section for going over wasted CDR */}
      {/* </Section> */}
      <Section title="Core Spells">
        {/* This section should cover effective usage of Holy's core spells */}
        {/* Divine Word Casts, idk how to explore this.  */}
        {modules.Lightweaver.guideSubsection}
        {modules.resonantWords.guideSubsection}
        {modules.prayerOfHealing.guideSubsection}
        {modules.prayerOfMending.guideSubsection}
        {modules.DivineStar.guideSubsectionHoly}
        {modules.Halo.guideSubsectionHoly}
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
      {info.combatant.hasTalent(TALENTS_PRIEST.HALO_SHARED_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_PRIEST.HALO_SHARED_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
    </SubSection>
  );
}
