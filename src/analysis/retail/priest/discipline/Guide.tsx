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
        When using effects which extend <SpellLink spell={SPELLS.ATONEMENT_BUFF} /> such as{' '}
        <SpellLink spell={TALENTS_PRIEST.EVANGELISM_TALENT} />, it is critical to your success as a
        Discipline Priest to correctly apply atonements, extend them and follow the appropriate DPS
        rotation.
        <SubSection title="Applicators">
          The first step of an <SpellLink spell={TALENTS_PRIEST.EVANGELISM_TALENT} /> ramp is to
          apply <strong> 7-9 </strong> of atonements using{' '}
          <SpellLink spell={SPELLS.POWER_WORD_SHIELD} />,{' '}
          <SpellLink spell={TALENTS_PRIEST.RENEW_TALENT} /> or{' '}
          <SpellLink spell={SPELLS.FLASH_HEAL} />, followed by two casts of{' '}
          <SpellLink spell={TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT} />. Below are your main ramps
          with the most important issues highlighted.
          {modules.evangelismAnalysis.guideCastBreakdown}
        </SubSection>
      </Section>
      <Section title="Rapture Ramp">
        When planning ramps for a raid encounter, the second most important ramp to plan for is one
        using <SpellLink spell={TALENTS_PRIEST.RAPTURE_TALENT} />. Rapture should be used separately
        to <SpellLink spell={TALENTS_PRIEST.EVANGELISM_TALENT} /> and also involve applying{' '}
        <SpellLink spell={TALENTS_PRIEST.ATONEMENT_TALENT} /> in its buff duration.
        <SubSection title="Applicators">
          The first step of an <SpellLink spell={TALENTS_PRIEST.RAPTURE_TALENT} /> ramp is to apply{' '}
          <strong> 7-9 </strong> atonements using <SpellLink spell={SPELLS.POWER_WORD_SHIELD} />,{' '}
          followed by one or two casts of{' '}
          <SpellLink spell={TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT} />. Below are your rapture
          ramps with the most important issues highlighted.
          {modules.raptureAnalysis.guideCastBreakdown}
        </SubSection>
      </Section>
    </>
  );
}
