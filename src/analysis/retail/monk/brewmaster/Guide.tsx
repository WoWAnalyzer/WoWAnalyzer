import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import ShuffleSection from './modules/spells/Shuffle/GuideSection';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CombatLogParser from './CombatLogParser';
import { GuideProps, Section } from 'interface/guide';
import { PurifySection } from './modules/problems/PurifyingBrew';
import talents from 'common/TALENTS/monk';
import * as AplCheck from './modules/core/AplCheck';
import { AplSectionData } from 'interface/guide/components/Apl';
import { InvokeNiuzaoSection } from './modules/problems/InvokeNiuzao';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
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
              Using <SpellLink id={talents.PURIFYING_BREW_TALENT.id} /> to keep the damage dealt by{' '}
              <SpellLink id={SPELLS.STAGGER.id} /> from getting too high.
            </li>
          </ul>
        </p>
        <ShuffleSection />
        <PurifySection module={modules.purifyProblems} events={events} info={info} />
      </Section>
      <Section title="Rotation">
        <p>
          The Brewmaster rotation is driven by a <em>priority list</em>. When you are ready to use
          an ability, you should use the highest-priority ability that is available. Doing this
          improves your damage by prioritizing high-damage, high-impact spells like{' '}
          <SpellLink id={talents.RISING_SUN_KICK_TALENT.id} /> and{' '}
          <SpellLink id={talents.KEG_SMASH_TALENT.id} /> over low-priority "filler" spells like{' '}
          <SpellLink id={SPELLS.TIGER_PALM.id} />.
        </p>
        <AplSectionData checker={AplCheck.check} apl={AplCheck.apl} />
      </Section>
      <InvokeNiuzaoSection
        events={events}
        info={info}
        module={modules.invokeNiuzao}
        // this cast is necessary because the defaultModules are not properly indexed.
        // combination of static methods + inheritance issues.
        castEfficiency={modules.CastEfficiency as CastEfficiency}
      />
    </>
  );
}
