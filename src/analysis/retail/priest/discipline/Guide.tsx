import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { Section, GuideProps, SubSection } from 'interface/guide';
import type CombatLogParser from './CombatLogParser';

export const GUIDE_CORE_EXPLANATION_PERCENT = 30;

export default function Guide({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>): JSX.Element {
  return (
    <>
      <Section title="Short cooldowns">
        {info.combatant.hasTalent(TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT) &&
          modules.powerWordRadiance.guideSubsection}
        {info.combatant.hasTalent(TALENTS_PRIEST.PURGE_THE_WICKED_TALENT) &&
          modules.purgeTheWicked.guideSubsection}
        {info.combatant.hasTalent(TALENTS_PRIEST.BINDING_HEALS_TALENT) &&
          modules.selfAtonementAnalyzer.guideSubsection}
      </Section>
      <Section title="Main Ramp">
        When using effects which extend <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> such as{' '}
        <SpellLink id={TALENTS_PRIEST.EVANGELISM_TALENT.id} />, it is critical to your success as a
        Discipline Priest to correctly apply atonements, extend them and follow the appropriate DPS
        rotation.
        <SubSection title="Applicators">
          The first step of an <SpellLink id={TALENTS_PRIEST.EVANGELISM_TALENT.id} /> ramp is to
          apply <strong> 7-9 </strong> of atonements using{' '}
          <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} />,{' '}
          <SpellLink id={TALENTS_PRIEST.RENEW_TALENT.id} /> or{' '}
          <SpellLink id={SPELLS.FLASH_HEAL.id} />, followed by two casts of{' '}
          <SpellLink id={TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id} />. Below are your main ramps
          with the most important issues highlighted.
          {modules.evangelismAnalysis.guideCastBreakdown}
        </SubSection>
      </Section>
      <Section title="Rapture Ramp">
        When planning ramps for a raid encounter, the second most important ramp to plan for is one
        using <SpellLink id={TALENTS_PRIEST.RAPTURE_TALENT.id} />. Rapture should be used separately
        to <SpellLink id={TALENTS_PRIEST.EVANGELISM_TALENT.id} /> and also involve applying{' '}
        <SpellLink id={TALENTS_PRIEST.ATONEMENT_TALENT.id} /> in its buff duration.
        <SubSection title="Applicators">
          The first step of an <SpellLink id={TALENTS_PRIEST.RAPTURE_TALENT.id} /> ramp is to apply{' '}
          <strong> 7-9 </strong> atonements using <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} />,{' '}
          followed by one or two casts of{' '}
          <SpellLink id={TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id} />. Below are your rapture
          ramps with the most important issues highlighted.
          {modules.raptureAnalysis.guideCastBreakdown}
        </SubSection>
      </Section>
    </>
  );
}
