import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Section, GuideProps, SubSection } from 'interface/guide';

import type CombatLogParser from './CombatLogParser';
import { EvangelismApplicators } from './modules/spells/Evangelism';
export default function Guide({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>): JSX.Element {
  return (
    <>
      <Section title="Main Ramp">
        When using effects which extend <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> such as{' '}
        <SpellLink id={SPELLS.EVANGELISM_TALENT.id} /> or{' '}
        <SpellLink id={SPELLS.SPIRIT_SHELL_TALENT.id} />, it is critical to your success as a
        Discipline priest to correctly apply atonements, extend them and follow the appropriate DPS
        rotation.
        <SubSection title="Applicators">
          <br />
          <EvangelismApplicators evangelismRamps={modules.evangelism.evangelismRamps} />
          The first step of an <SpellLink id={SPELLS.EVANGELISM_TALENT.id} /> ramp is to apply{' '}
          <strong> ARBITRARY ATONEMENT NUMBER </strong> of atonements using{' '}
          <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} /> or <SpellLink id={SPELLS.SHADOW_MEND.id} />
          .{/* <RampSection module={modules.rampProblems} events={events} info={info} /> */}
        </SubSection>
      </Section>
    </>
  );
}
