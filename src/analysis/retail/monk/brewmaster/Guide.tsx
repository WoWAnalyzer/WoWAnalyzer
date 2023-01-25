import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import ShuffleSection from './modules/spells/Shuffle/GuideSection';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CombatLogParser from './CombatLogParser';
import { GuideProps, Section, SubSection } from 'interface/guide';
import { PurifySection } from './modules/problems/PurifyingBrew';
import talents from 'common/TALENTS/monk';
import * as AplCheck from './modules/core/AplCheck';
import { AplSectionData } from 'interface/guide/components/Apl';
import { ImprovedInvokeNiuzaoSection } from './modules/problems/InvokeNiuzao';
import MajorDefensivesSection from './modules/core/MajorDefensives';
import { defaultExplainers } from 'interface/guide/components/Apl/violations/claims';
import explainSCK, { filterSCK } from './modules/core/AplCheck/explainSCK';
import AplChoiceDescription from './modules/core/AplCheck/AplChoiceDescription';

const explainers = {
  explainSCK,
  overcast: defaultExplainers.overcastFillers,
  // rethinking the lack of explainer priority here. we want to show custom text explaining the change to SCK, but doing so requires post-processing of the droppedRule results
  dropped: filterSCK(defaultExplainers.droppedRule),
};

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Stagger Management">
        <p>
          Brewmaster's core defensive loop uses <SpellLink id={SPELLS.STAGGER} /> plus{' '}
          <SpellLink id={SPELLS.SHUFFLE} /> to convert 60-70% of burst damage into a much less
          dangerous damage-over-time effect (the <em>Stagger pool</em>). We have a variety of ways
          to reduce the damage of this DoT&mdash;the most important of which is{' '}
          <SpellLink id={talents.PURIFYING_BREW_TALENT} />, which reduces the remaining DoT damage
          by 50%.
        </p>
        <p>
          This section covers both, and is by far the most important one when it comes to mastering
          the basics of Brewmaster gameplay.
        </p>
        <ShuffleSection />
        <PurifySection module={modules.purifyProblems} events={events} info={info} />
      </Section>
      <MajorDefensivesSection />
      <Section title="Core Rotation">
        <p>
          The Brewmaster rotation is driven by a <em>priority list</em>. When using an ability, you
          should try to use the one that is <em>highest</em> on the list. Doing this improves your
          damage by prioritizing high-damage, high-impact spells like{' '}
          <SpellLink id={talents.RISING_SUN_KICK_TALENT.id} /> and{' '}
          <SpellLink id={talents.KEG_SMASH_TALENT.id} /> over low-priority "filler" spells like{' '}
          <SpellLink id={SPELLS.TIGER_PALM.id} />.
        </p>
        <AplChoiceDescription aplChoice={AplCheck.chooseApl(info)} />
        <SubSection>
          <AplSectionData
            checker={AplCheck.check}
            apl={AplCheck.apl(info)}
            violationExplainers={explainers}
          />
        </SubSection>
      </Section>
      <ImprovedInvokeNiuzaoSection
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
