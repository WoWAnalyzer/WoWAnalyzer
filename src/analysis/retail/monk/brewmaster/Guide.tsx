import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink, TooltipElement } from 'interface';
import CombatLogParser from './CombatLogParser';
import { GuideProps, Section, SubSection, useAnalyzer } from 'interface/guide';
import talents from 'common/TALENTS/monk';
import spells from './spell-list_Monk_Brewmaster.retail';

import MajorDefensivesSection from './modules/core/MajorDefensives';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Explanation from 'interface/guide/components/Explanation';
import { Highlight } from 'interface/Highlight';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import AspectOfHarmony from './modules/talents/AspectOfHarmony';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import InvokeNiuzaoSection from './modules/talents/InvokeNiuzao/InvokeNiuzaoSection';
import StaggerPoolSection from './modules/core/StaggerPool/StaggerPoolSection';
import AplChoiceDescription from './modules/core/AplCheck/AplChoiceDescription';

export default function Guide({ info }: GuideProps<typeof CombatLogParser>) {
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
          damage by 50% or more.
        </p>
        <StaggerPoolSection />
      </Section>
      <Section title="Rotation & Cooldowns">
        <SubSection title="Rotation">
          <AplChoiceDescription />
        </SubSection>
        <SubSection title="Cooldowns">
          <Explanation>
            <p>
              Cooldowns like <SpellLink spell={spells.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} /> and{' '}
              <SpellLink spell={talents.EXPLODING_KEG_TALENT} /> are a major contributor to your
              overall damage. As a tank, they are also key to establishing threat on pull and when
              new enemies spawn or are pulled.
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
            <>
              <CastEfficiencyBar
                spell={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT}
                gapHighlightMode={GapHighlight.FullCooldown}
                useThresholds
              />
            </>
          )}
          {info.combatant.hasTalent(talents.EXPLODING_KEG_TALENT) && (
            <CastEfficiencyBar
              spell={talents.EXPLODING_KEG_TALENT}
              gapHighlightMode={GapHighlight.FullCooldown}
              useThresholds
            />
          )}
          {info.combatant.hasTalent(talents.CHI_BURST_TALENT) && (
            <CastEfficiencyBar
              spell={talents.CHI_BURST_TALENT}
              gapHighlightMode={GapHighlight.FullCooldown}
              useThresholds
            />
          )}
        </SubSection>
        <InvokeNiuzaoSection />
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
