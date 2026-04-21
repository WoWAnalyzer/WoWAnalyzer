import type { JSX } from 'react';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { GuideProps, Section } from 'interface/guide';
import type CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import DefensivesGuide from '../shared/Defensives';
import DesperatePrayer from '../shared/spells/DesperatePrayer';
import Fade from '../shared/spells/Fade';

export const GUIDE_CORE_EXPLANATION_PERCENT = 30;

export default function Guide({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>): JSX.Element {
  return (
    <>
      <Section title="Short cooldowns">
        {modules.penance.guideSubsection}
        {info.combatant.hasTalent(TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT) &&
          modules.powerWordRadiance.guideSubsection}
        {info.combatant.hasTalent(TALENTS_PRIEST.BINDING_HEALS_TALENT) &&
          modules.selfAtonementAnalyzer.guideSubsection}
      </Section>
      <Section title="DoTs">{modules.dotUptimes.guideSubsection}</Section>
      <DefensivesGuide analyzers={[DesperatePrayer, Fade]} />
      <PreparationSection />
    </>
  );
}
