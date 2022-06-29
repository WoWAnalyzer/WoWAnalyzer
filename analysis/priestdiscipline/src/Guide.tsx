import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Section, GuideProps } from 'interface/guide';

import type CombatLogParser from './CombatLogParser';

export default function Guide({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>): JSX.Element {
  const result = 'Test';
  return (
    <>
      <Section title="Main Ramp">
        {result}
        When using effects which extend <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> such as{' '}
        <SpellLink id={SPELLS.EVANGELISM_TALENT.id} /> or{' '}
        <SpellLink id={SPELLS.SPIRIT_SHELL_TALENT.id} />, it is critical to your success as a
        Discipline priest to correctly apply atonemnets, extend them and follow the appropriate DPS
        rotation.
      </Section>
    </>
  );
}
