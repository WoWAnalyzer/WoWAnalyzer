import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Section, GuideProps, SubSection } from 'interface/guide';

import type CombatLogParser from './CombatLogParser';
import { EvangelismApplicators } from './modules/problems/ramps';

export default function Guide({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>): JSX.Element {
  // console.log(modules.ramps.analyzeRamps);
  return (
    <>
      <Section title="Main Ramp">
        When using effects which extend <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> such as{' '}
        <SpellLink id={SPELLS.EVANGELISM_TALENT.id} />, it is critical to your success as a
        Discipline Priest to correctly apply atonements, extend them and follow the appropriate DPS
        rotation.
        <SubSection title="Applicators">
          The first step of an <SpellLink id={SPELLS.EVANGELISM_TALENT.id} /> ramp is to apply{' '}
          <strong> 7-9 </strong> of atonements using <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} />{' '}
          or <SpellLink id={SPELLS.SHADOW_MEND.id} />. Below are your main ramps with the most
          important issues highlights.
          <br />
          <EvangelismApplicators ramps={modules.ramps} />
        </SubSection>
      </Section>
    </>
  );
}
