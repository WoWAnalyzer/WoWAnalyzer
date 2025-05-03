import SPELLS from 'common/SPELLS';
import { ResourceLink, SpellLink, TooltipElement } from 'interface';
import ShuffleSection from './modules/spells/Shuffle/GuideSection';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CombatLogParser from './CombatLogParser';
import { GuideProps, Section, SubSection, useAnalyzer, useAnalyzers } from 'interface/guide';
import { PurifySection } from './modules/problems/PurifyingBrew';
import talents from 'common/TALENTS/monk';

import { ImprovedInvokeNiuzaoSection } from './modules/problems/InvokeNiuzao';
import MajorDefensivesSection from './modules/core/MajorDefensives';
import AplChoiceDescription from './modules/core/AplCheck/AplChoiceDescription';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Explanation from 'interface/guide/components/Explanation';
import { Highlight } from 'interface/Highlight';
import BlackoutComboSection from './modules/spells/BlackoutCombo/BlackoutComboSection';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatNumber, formatPercentage } from 'common/format';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import ShadowFlurryStrikes from './modules/talents/ShadowFlurryStrikes';
import EnergyTracker from './modules/core/EnergyTracker';
import EnergyGraph from './modules/core/EnergyGraph';
import AspectOfHarmony from './modules/talents/AspectOfHarmony';

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
        <ShuffleSection />
        <PurifySection module={modules.purifyProblems} events={events} info={info} />
      </Section>
      <Section title="Core Rotation">
        <AplChoiceDescription />
        <BlackoutComboSection />
        <SubSection title="Major Cooldowns">
          <Explanation>
            <p>
              Major cooldowns like <SpellLink spell={talents.WEAPONS_OF_ORDER_TALENT} /> are a major
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
                Note that <SpellLink spell={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} /> is only
                included in this list if you are using{' '}
                <SpellLink spell={talents.IMPROVED_INVOKE_NIUZAO_THE_BLACK_OX_TALENT} />. If you are
                not, it does about as much damage two{' '}
                <SpellLink spell={talents.RISING_SUN_KICK_TALENT} />
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
          {info.combatant.hasTalent(talents.IMPROVED_INVOKE_NIUZAO_THE_BLACK_OX_TALENT) && (
            <CastEfficiencyBar
              spellId={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id}
              gapHighlightMode={GapHighlight.FullCooldown}
              useThresholds
            />
          )}
        </SubSection>
      </Section>
      {info.combatant.hasTalent(talents.FLURRY_STRIKES_TALENT) && <ShadoPanSection />}
      <MasterOfHarmonySection />
      <MajorDefensivesSection />
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

function ShadoPanSection() {
  const [shadowFlurryStrikes, energyTracker, energyGraph] = useAnalyzers([
    ShadowFlurryStrikes,
    EnergyTracker,
    EnergyGraph,
  ] as const);
  return (
    <Section title="Shado-Pan">
      <SubSection title="Energy Usage">
        <Explanation>
          <p>
            <SpellLink spell={talents.FLURRY_STRIKES_TALENT} /> makes{' '}
            <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> an important resource for Brewmaster.
            Spending more Energy causes more <SpellLink spell={talents.FLURRY_STRIKES_TALENT} /> and
            more <SpellLink spell={talents.WISDOM_OF_THE_WALL_TALENT} /> buffs.
          </p>
          <p>
            You were <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> capped for{' '}
            <PerformanceStrong performance={energyTracker.performance}>
              {formatPercentage(energyTracker.percentAtCap)}%
            </PerformanceStrong>{' '}
            of the fight, wasting at least{' '}
            {formatNumber((energyTracker.timeAtCap / 1000) * energyTracker.baseRegenRate)} Energy.
          </p>
        </Explanation>
        {energyGraph.plot}
      </SubSection>
      <SpellUsageSubSection
        explanation={
          <>
            <p>
              While <SpellLink spell={talents.FLURRY_STRIKES_TALENT} /> is a mostly-passive effect,
              it is important to be aware of the{' '}
              <SpellLink spell={SPELLS.WOTW_SHADOW_BUFF}>Shadow Buff</SpellLink>. This buff lasts{' '}
              <strong>40 seconds</strong> to allow getting at least 1 additional{' '}
              <SpellLink spell={talents.FLURRY_STRIKES_TALENT} /> during the buff.
            </p>
            <p>
              It is possible to get 2 <SpellLink spell={talents.FLURRY_STRIKES_TALENT} /> within the
              buff with normal rotational play. You can get a 3rd trigger in ideal conditions with
              either <SpellLink spell={talents.BLACK_OX_BREW_TALENT} /> or{' '}
              <TooltipElement
                content={
                  <>
                    It is possible to make the{' '}
                    <SpellLink spell={talents.WISDOM_OF_THE_WALL_TALENT} /> buff be applied by the{' '}
                    <em>first</em> hit of <SpellLink spell={talents.FLURRY_STRIKES_TALENT} />{' '}
                    instead of the last one. This tech is easy to set up, but gets messed up by
                    wipes and so is not often used in practice. See{' '}
                    <a href="https://www.wowhead.com/guide/classes/monk/brewmaster/rotation-cooldowns-pve-tank#hero-talent-tips-maximizing-wisdom-of-the-wall-shado-pan">
                      Wowhead
                    </a>{' '}
                    for a full guide to this tech.
                  </>
                }
                hoverable
              >
                offsetting
              </TooltipElement>
              , but going for the 3rd trigger can be a DPS <em>loss</em> if you're not careful.
            </p>
          </>
        }
        uses={shadowFlurryStrikes.uses}
        noCastsTexts={{
          noCastsOverride: (
            <>
              You did not trigger{' '}
              <SpellLink spell={SPELLS.WOTW_SHADOW_BUFF}>Wisdom of the Wall - Shadow</SpellLink>
            </>
          ),
        }}
        title="Shadow Strikes"
        castBreakdownSmallText={
          '- These boxes represent each buff, colored by how good the usage was.'
        }
      />
    </Section>
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
              <SpellLink spell={talents.CELESTIAL_BREW_TALENT} /> <em>and then</em> doing damage (or
              healing).
            </p>
            <p>
              This means it is important to use <SpellLink spell={talents.CELESTIAL_BREW_TALENT} />{' '}
              periodically <em>even if you aren't taking much damage</em> in order to spend the
              Vitality before you reach the{' '}
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
              You did not cast <SpellLink spell={talents.CELESTIAL_BREW_TALENT} />. This means you
              gained almost nothing from your Hero Tree!
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
