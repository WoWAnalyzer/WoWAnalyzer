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
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Explanation from 'interface/guide/components/Explanation';
import { Highlight } from 'interface/Highlight';

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
        <SubSection title="Major Cooldowns">
          <Explanation>
            <p>
              Major cooldowns like <SpellLink id={talents.WEAPONS_OF_ORDER_TALENT} /> are a major
              contributor to your overall damage. As a tank, they are also key to establishing
              threat on pull and when new enemies spawn or are pulled.
            </p>
            <p>
              It is generally correct to hold your cooldowns by a small amount in order to line up
              with fight mechanics, so they aren't a part of the overall rotation listed in the
              previous section. However, holding them too long can hurt your damage
              significantly&mdash;especially if you outright skip a cast (shown in{' '}
              <Highlight color="#834c4a">red</Highlight>).
            </p>
            <p>
              <small>
                Note that <SpellLink id={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} /> is only
                included in this list if you are using{' '}
                <SpellLink id={talents.IMPROVED_INVOKE_NIUZAO_THE_BLACK_OX_TALENT} />. If you are
                not, it does about as much damage two{' '}
                <SpellLink id={talents.RISING_SUN_KICK_TALENT} />
                s&mdash;not nothing, but not worth thinking much about.
              </small>
            </p>
          </Explanation>
          {info.combatant.hasTalent(talents.WEAPONS_OF_ORDER_TALENT) && (
            <CastEfficiencyBar
              spellId={talents.WEAPONS_OF_ORDER_TALENT.id}
              gapHighlightMode={GapHighlight.FullCooldown}
              useThresholds
            />
          )}
          {info.combatant.hasTalent(talents.EXPLODING_KEG_TALENT) && (
            <CastEfficiencyBar
              spellId={talents.EXPLODING_KEG_TALENT.id}
              gapHighlightMode={GapHighlight.FullCooldown}
              useThresholds
            />
          )}
          {info.combatant.hasTalent(talents.SUMMON_WHITE_TIGER_STATUE_TALENT) && (
            <CastEfficiencyBar
              spellId={talents.SUMMON_WHITE_TIGER_STATUE_TALENT.id}
              gapHighlightMode={GapHighlight.FullCooldown}
              useThresholds
            />
          )}
          {info.combatant.hasTalent(talents.IMPROVED_INVOKE_NIUZAO_THE_BLACK_OX_TALENT) && (
            <CastEfficiencyBar
              spellId={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id}
              gapHighlightMode={GapHighlight.FullCooldown}
              useThresholds
            />
          )}
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
