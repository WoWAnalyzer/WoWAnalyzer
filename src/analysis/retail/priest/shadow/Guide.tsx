import { GuideProps, Section, SubSection } from 'interface/guide';
import talents from 'common/TALENTS/priest';
//import spells from 'common/SPELLS/priest';
import CombatLogParser from './CombatLogParser';
//import { CooldownBar, GapHighlight } from 'parser/ui/CooldownBar';
//import { SpellLink } from 'interface';

import CooldownGraphSubsection from './modules/guide/CooldownGraphSubSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Insanity Use">
        <SubSection title="Devouring Plague">
          <p>
            Spend insanity on devouring plague
            {/*TODO: {modules.devouringPlague.plot}*/}
          </p>
        </SubSection>
        <SubSection title="Insanity">
          <p>
            Gain Insanity by using abilities. Spend it on devouring plague or mind sear
            {/TODO: *modules.insanityGuide.plot*/}
          </p>
        </SubSection>
      </Section>

      <Section title="Dot Uptimes">{modules.dotUptimes.guideSubsection}</Section>

      <Section title="Proc Usage">
        {info.combatant.hasTalent(talents.MIND_DEVOURER_TALENT) && (
          <SubSection>{modules.mindDevourer.guideSubsection}</SubSection>
        )}
        {info.combatant.hasTalent(talents.SHADOWY_INSIGHT_TALENT) && (
          <SubSection>{modules.shadowyInsight.guideSubsection}</SubSection>
        )}
        {info.combatant.hasTalent(talents.SURGE_OF_DARKNESS_TALENT) && (
          <SubSection>{modules.surgeOfDarkness.guideSubsection}</SubSection>
        )}
        {info.combatant.hasTalent(talents.UNFURLING_DARKNESS_TALENT) && (
          <SubSection>{modules.unfurlingDarkness.guideSubsection}</SubSection>
        )}
        {info.combatant.hasTalent(talents.DEATHSPEAKER_TALENT) && (
          <SubSection>{modules.deathspeaker.guideSubsection}</SubSection>
        )}
        {info.combatant.hasTalent(talents.MIND_FLAY_INSANITY_TALENT) && (
          <SubSection>{modules.mindFlayInsanity.guideSubsection}</SubSection>
        )}
      </Section>

      <Section title="Cooldowns">
          <CooldownGraphSubsection />
        </Section>
    </>
  );
}
