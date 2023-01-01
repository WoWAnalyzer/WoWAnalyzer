import { GuideProps, Section, SubSection } from 'interface/guide';
import talents from 'common/TALENTS/priest';
//import spells from 'common/SPELLS/priest';
import CombatLogParser from './CombatLogParser';
//import { CooldownBar, GapHighlight } from 'parser/ui/CooldownBar';
//import { SpellLink } from 'interface';

import LongCooldownGraphSubsection from './modules/guide/LongCooldownGraphSubSection';
import ShortCooldownGraphSubsection from './modules/guide/ShortCooldownGraphSubSection';
import CoreGraphSubsection from './modules/guide/CoreGraphSubSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core">
        {modules.dotUptimes.guideSubsectionDP}
        {modules.dotUptimes.guideSubsection}
        {/* This information does not alter the rotation, maybe should be taken out.
          {info.combatant.hasTalent(talents.DARK_EVANGELISM_TALENT) && (
            <SubSection title="Dark Evangelism">{modules.dotUptimes.guideSubsectionDE}</SubSection>
          )}  
        */}
      </Section>

      <Section title="Cooldowns">
        <CoreGraphSubsection />
        <ShortCooldownGraphSubsection />
        <LongCooldownGraphSubsection />
      </Section>

      <Section title="Proc Usage">
        {info.combatant.hasTalent(talents.SHADOWY_INSIGHT_TALENT) &&
          modules.shadowyInsight.guideSubsection}
        {info.combatant.hasTalent(talents.MIND_DEVOURER_TALENT) &&
          modules.mindDevourer.guideSubsection}
        {info.combatant.hasTalent(talents.MIND_FLAY_INSANITY_TALENT) &&
          modules.mindFlayInsanity.guideSubsection}
        {info.combatant.hasTalent(talents.SURGE_OF_DARKNESS_TALENT) &&
          modules.surgeOfDarkness.guideSubsection}
        {info.combatant.hasTalent(talents.UNFURLING_DARKNESS_TALENT) &&
          modules.unfurlingDarkness.guideSubsection}
        {info.combatant.hasTalent(talents.DEATHSPEAKER_TALENT) &&
          modules.deathspeaker.guideSubsection}
      </Section>

      <Section title="Action Priority List">
        <p>
          {' '}
          <SubSection>Coming Soon!</SubSection>{' '}
        </p>
      </Section>
    </>
  );
}
