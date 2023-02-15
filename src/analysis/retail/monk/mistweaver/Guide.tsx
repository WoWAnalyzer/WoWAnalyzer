import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import SPELLS from 'common/SPELLS';
import CombatLogParser from '../mistweaver/CombatLogParser';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells">
        {modules.renewingMist.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.RISING_SUN_KICK_TALENT) &&
          modules.risingSunKick.guideSubsection}
        {modules.thunderFocusTea.guideSubsection}
        <HotGraphSubsection modules={modules} events={events} info={info} />
      </Section>
      <Section title="Short cooldowns">
        {modules.essenceFont.guideSubsection}
        {modules.chiBurst.guideSubsection}
      </Section>
      <Section title="Healing Cooldowns">
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
        {info.combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)
          ? modules.invokeChiJi.guideCastBreakdown
          : modules.invokeYulon.guideCastBreakdown}
      </Section>
      <PreparationSection />
    </>
  );
}

function HotGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>HoT Graph</strong> - this graph shows how many{' '}
      <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} /> you have over the course of the fight in
      relation to your <SpellLink id={TALENTS_MONK.RISING_SUN_KICK_TALENT.id} /> and{' '}
      <SpellLink id={SPELLS.VIVIFY} /> casts.
      {modules.remGraph.plot}
    </SubSection>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const invokeId = info.combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)
    ? TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id
    : TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id;
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      <CastEfficiencyBar
        spellId={invokeId}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
      <CastEfficiencyBar
        spellId={TALENTS_MONK.REVIVAL_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
    </SubSection>
  );
}
