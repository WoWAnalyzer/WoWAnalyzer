import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';

import CombatLogParser from './CombatLogParser';

export default function Guide({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Stagger Management">
        <p>
          <SpellLink id={SPELLS.STAGGER.id} /> spreads a portion of damage taken over a 10 second
          window. In doing so, it makes Brewmasters easy to heal&mdash;as long as you manage it
          well. There are two key elements to managing <SpellLink id={SPELLS.STAGGER.id} />:
          <ul>
            <li>
              Maintaining <SpellLink id={SPELLS.SHUFFLE.id} /> to improve the amount of damage that
              is Staggered.
            </li>
            <li>
              Using <SpellLink id={SPELLS.PURIFYING_BREW.id} /> to keep the damage dealt by{' '}
              <SpellLink id={SPELLS.STAGGER.id} /> from getting too high.
            </li>
          </ul>
        </p>
        <SubSection title="Shuffle">
          <SpellLink id={SPELLS.SHUFFLE.id} /> provides a significant increase to the amount of
          damage you <SpellLink id={SPELLS.STAGGER.id} />. Getting hit without{' '}
          <SpellLink id={SPELLS.SHUFFLE.id} /> active is very dangerous&mdash;and in many cases
          lethal.
        </SubSection>
      </Section>
      <Section title="Celestial Brew"></Section>
    </>
  );
}
