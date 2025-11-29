import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink, TooltipElement } from 'interface';
import CombatLogParser from './CombatLogParser';
import { GuideProps, Section, SubSection, useAnalyzer } from 'interface/guide';
import { PurifySection } from './modules/problems/PurifyingBrew';
import talents from 'common/TALENTS/monk';
import spells from './spell-list_Monk_Brewmaster.retail';

import MajorDefensivesSection from './modules/core/MajorDefensives';
import AplChoiceDescription from './modules/core/AplCheck/AplChoiceDescription';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Explanation from 'interface/guide/components/Explanation';
import { Highlight } from 'interface/Highlight';
import BlackoutComboSection from './modules/spells/BlackoutCombo/BlackoutComboSection';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import AspectOfHarmony from './modules/talents/AspectOfHarmony';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Skills">
        <FoundationDowntimeSection />
      </Section>
      <Section title="Stagger Management">
        <p>
          Brewmaster's core defensive loop uses <SpellLink spell={SPELLS.STAGGER} /> plus{' '}
          <SpellLink spell={SPELLS.SHUFFLE} /> to convert 60-70% of burst damage into a much less
          dangerous damage-over-time effect (the <em>Stagger pool</em>). We have a variety of ways
          to reduce the damage of this DoT&mdash;the most important of which is{' '}
          <SpellLink spell={talents.PURIFYING_BREW_TALENT} />, which reduces the remaining DoT
          damage by 50%.
        </p>
        <p>
          This section covers both, and is by far the most important one when it comes to mastering
          the basics of Brewmaster gameplay.
        </p>
        <PurifySection module={modules.purifyProblems} events={events} info={info} />
      </Section>
      <Section title="Core Rotation">
        <AplChoiceDescription />
        <BlackoutComboSection />
        <SubSection title="Major Cooldowns">
          <Explanation>
            <p>
              Major cooldowns like <SpellLink spell={spells.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} />{' '}
              are a major contributor to your overall damage. As a tank, they are also key to
              establishing threat on pull and when new enemies spawn or are pulled.
            </p>
            <p>
              It is generally correct to hold your cooldowns by a small amount in order to line up
              with fight mechanics, so they aren't a part of the overall rotation listed in the
              previous section. However, holding them too long can hurt your damage
              significantly&mdash;especially if you outright skip a cast (shown in{' '}
              <Highlight color="#834c4a">red</Highlight>).
            </p>
          </Explanation>
          {info.combatant.hasTalent(talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT) && (
            <CastEfficiencyBar
              spell={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT}
              gapHighlightMode={GapHighlight.FullCooldown}
              useThresholds
            />
          )}
          {info.combatant.hasTalent(talents.EXPLODING_KEG_TALENT) && (
            <CastEfficiencyBar
              spell={talents.EXPLODING_KEG_TALENT}
              gapHighlightMode={GapHighlight.FullCooldown}
              useThresholds
            />
          )}
        </SubSection>
      </Section>
      <MasterOfHarmonySection />
      <MajorDefensivesSection />
      <PreparationSection />
    </>
  );
}

function MasterOfHarmonySection(): JSX.Element | null {
  const aoh = useAnalyzer(AspectOfHarmony);

  if (!aoh || !aoh.active) {
    return null;
  }

  return (
    <Section title="Master of Harmony">
      <SpellUsageSubSection
        explanation={
          <>
            <p>
              <SpellLink spell={talents.ASPECT_OF_HARMONY_TALENT} /> causes you to accumulate{' '}
              <strong>Vitality</strong> by doing damage. <strong>Vitality</strong> is spent by using{' '}
              <SpellLink spell={aoh.activeSpender} /> <em>and then</em> doing damage (or healing).
            </p>
            <p>
              This means it is important to use <SpellLink spell={aoh.activeSpender} /> periodically{' '}
              <em>even if you aren't taking much damage</em> in order to spend the Vitality before
              you reach the{' '}
              <TooltipElement content={'Vitality is capped at 100% of your maximum HP.'}>
                cap.
              </TooltipElement>
            </p>
          </>
        }
        uses={aoh.uses}
        noCastsTexts={{
          noCastsOverride: (
            <>
              You did not cast <SpellLink spell={aoh.activeSpender} />. This means you gained almost
              nothing from your Hero Tree!
            </>
          ),
        }}
        title="Aspect of Harmony"
        castBreakdownSmallText={
          '- These boxes represent each time you spent Vitality, colored by how good the usage was.'
        }
      />
    </Section>
  );
}
