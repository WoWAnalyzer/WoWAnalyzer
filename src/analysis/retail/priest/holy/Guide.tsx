import { GuideProps, Section, SubSection } from 'interface/guide';
import { GapHighlight } from 'parser/ui/CooldownBar';

import CombatLogParser from './CombatLogParser';
import { TALENTS_PRIEST } from 'common/TALENTS';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import DefensivesGuide from '../shared/Defensives';
import DesperatePrayer from '../shared/spells/DesperatePrayer';
import Fade from '../shared/spells/Fade';

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
        {modules.Lightweaver.guideSubsection}
        {modules.prayerOfHealing.guideSubsection}
        {modules.prayerOfMending.guideSubsection}
        {modules.Halo.guideSubsectionHoly}
      </Section>
      <Section title="Healing Cooldowns">
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
      </Section>
      <DefensivesGuide analyzers={[DesperatePrayer, Fade]} />
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
      {info.combatant.hasTalent(TALENTS_PRIEST.DIVINE_HYMN_TALENT) && (
        <CastEfficiencyBar
          spell={TALENTS_PRIEST.DIVINE_HYMN_TALENT}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_PRIEST.APOTHEOSIS_TALENT) && (
        <CastEfficiencyBar
          spell={TALENTS_PRIEST.APOTHEOSIS_TALENT}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_PRIEST.HALO_HOLY_TALENT) && (
        <CastEfficiencyBar
          spell={TALENTS_PRIEST.HALO_HOLY_TALENT}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
    </SubSection>
  );
}
