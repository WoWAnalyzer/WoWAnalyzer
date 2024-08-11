import { GoodColor, GuideProps, Section, SubSection, useAnalyzers } from 'interface/guide';
import CombatLogParser from 'analysis/retail/druid/guardian/CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import IronfurSection from 'analysis/retail/druid/guardian/modules/spells/IronfurGuideSection';
import { ResourceLink, SpellLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import PerformancePercentage from 'analysis/retail/demonhunter/shared/guide/PerformancePercentage';
import {
  PERFECT_RAGE_WASTED,
  GOOD_RAGE_WASTED,
  OK_RAGE_WASTED,
  RAGE_SCALE_FACTOR,
} from 'analysis/retail/druid/guardian/modules/core/rage/RageTracker';
import { Highlight } from 'interface/Highlight';
import Explanation from 'interface/guide/components/Explanation';
import { TooltipElement } from 'interface';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import AllCooldownUsagesList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import { PerformanceStrong } from 'analysis/retail/priest/shadow/modules/guide/ExtraComponents';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import Barkskin from 'analysis/retail/druid/guardian/modules/spells/Barkskin';
import Pulverize from 'analysis/retail/druid/guardian/modules/spells/Pulverize';
import SurvivalInstincts from 'analysis/retail/druid/guardian/modules/spells/SurvivalInstincts';
import RageOfTheSleeper from 'analysis/retail/druid/guardian/modules/spells/RageOfTheSleeper';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { cdSpell } from 'analysis/retail/druid/guardian/constants';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IronfurSection />
      <RageSection modules={modules} events={events} info={info} />
      <RotationSection modules={modules} events={events} info={info} />
      <MajorDefensivesSection />
      <OffensiveCooldownsSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

// TODO move to own Rage class?
function RageSection({ modules }: GuideProps<typeof CombatLogParser>): JSX.Element {
  return (
    <Section title="Rage">
      <p>
        Guardian's primary resource is <ResourceLink id={RESOURCE_TYPES.RAGE.id} />. It's generated
        as part of your normal rotation, and can be consumed either defensively (with{' '}
        <SpellLink spell={SPELLS.IRONFUR} /> / <SpellLink spell={SPELLS.FRENZIED_REGENERATION} />)
        or offesnively (with <SpellLink spell={SPELLS.MAUL} /> /{' '}
        <SpellLink spell={TALENTS_DRUID.RAZE_TALENT} />
        ). You should always spend your Rage before capping, as lost generation is lost
        effectiveness. <SpellLink spell={SPELLS.IRONFUR} /> is not on the GCD - excess rage can
        always be instantly turned into extra stacks.
      </p>
      <p>
        The chart below shows your Rage over the course of the encounter. You wasted{' '}
        <PerformancePercentage
          performance={modules.rageTracker.wastedPerformance}
          perfectPercentage={PERFECT_RAGE_WASTED}
          goodPercentage={GOOD_RAGE_WASTED}
          okPercentage={OK_RAGE_WASTED}
          percentage={modules.rageTracker.percentAtCap}
          flatAmount={modules.rageTracker.wasted * RAGE_SCALE_FACTOR}
        />{' '}
        of your <ResourceLink id={RESOURCE_TYPES.RAGE.id} />.
      </p>
      {modules.rageGraph.plot}
    </Section>
  );
}

function RotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Rotation">
      <p>
        The basics of Guardian's damage / rage-building rotation is to use{' '}
        <SpellLink spell={SPELLS.MANGLE_BEAR} /> and <SpellLink spell={SPELLS.THRASH_BEAR} /> on
        cooldown while maintaining <SpellLink spell={SPELLS.MOONFIRE_DEBUFF} /> on enemies. Fill any
        empty GCDs with <SpellLink spell={SPELLS.SWIPE_BEAR} />. For more detail on the specifics
        and priorities at play, refer to the{' '}
        <a
          href="https://www.wowhead.com/guide/classes/druid/guardian/rotation-cooldowns-pve-tank"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wowhead rotation guide
        </a>
      </p>
      <p>
        Guardian is absolutely a GCD-capped spec and you should be constantly using abilities.
        Active time shows the percentage of time you were spamming abilities - get as close to 100%
        as you can.
      </p>
      <p>
        <strong>
          Active Time:{' '}
          <PerformanceStrong performance={modules.alwaysBeCasting.DowntimePerformance}>
            {formatPercentage(modules.alwaysBeCasting.activeTimePercentage, 1)}%
          </PerformanceStrong>{' '}
        </strong>
      </p>
      <p>
        <ActiveTimeGraph
          activeTimeSegments={modules.alwaysBeCasting.activeTimeSegments}
          fightStart={info.fightStart}
          fightEnd={info.fightEnd}
        />
      </p>
      {modules.mangle.guideSubsection}
      {modules.thrash.guideSubsection}
      {modules.moonfire.guideSubsection}
      {modules.swipe.guideSubsection}
    </Section>
  );
}

function OffensiveCooldownsSection({
  modules,
  info,
}: GuideProps<typeof CombatLogParser>): JSX.Element | null {
  return (
    <Section title="Offensive Cooldowns">
      <Explanation>
        While your first priority should always be to stay alive, prompt and proper use of your
        offensive cooldowns can increase your damage contribution.
      </Explanation>
      <SubSection>
        <CastEfficiencyBar
          spellId={cdSpell(info.combatant).id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
        {info.combatant.hasTalent(TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS_DRUID.RAGE_OF_THE_SLEEPER_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
        {info.combatant.hasTalent(TALENTS_DRUID.LUNAR_BEAM_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS_DRUID.LUNAR_BEAM_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
            useThresholds
          />
        )}
      </SubSection>
      {modules.berserk.guideCastBreakdown}
      {modules.rageOfTheSleeper.active && modules.rageOfTheSleeper.guideCastBreakdown}
    </Section>
  );
}

function MajorDefensivesSection(): JSX.Element | null {
  const analyzers = useAnalyzers([Barkskin, RageOfTheSleeper, Pulverize, SurvivalInstincts]);
  return (
    <Section title="Major Defensives">
      <Explanation>
        <p>
          Effectively using your defensive cooldowns is a core part of playing tank well. Guardian
          in particular must use cooldowns to effectively mitigate big magic damage.
        </p>
        <p>There are two things you should look for in your cooldown usage:</p>
        <ol>
          <li>
            You should cover as many{' '}
            <TooltipElement
              content={
                <>
                  A <strong>damage spike</strong> is when you take much more damage than normal in a
                  small amount of time. These are visible on the Timeline below as tall spikes.
                </>
              }
            >
              damage spikes
            </TooltipElement>{' '}
            as possible, and use any left over to cover periods of heavy, consistent damage.
            <br />
            <small>
              In the damage chart below, a spike highlighted in{' '}
              <Highlight color={GoodColor} textColor="black">
                green
              </Highlight>{' '}
              was covered by a defensive.
            </small>
          </li>
          <li>
            You should <em>use</em> your cooldowns. This may seem silly&mdash;but not using major
            defensives is a common problem! For Guardian, it is also likely to be fatal.
            <br />
            <small>
              Below the damage chart, your cooldowns are shown. Large gaps may indicate that you
              could get more uses&mdash;but remember that covering spikes is more important than
              maximizing total casts!
            </small>
          </li>
        </ol>
      </Explanation>
      <SubSection title="Timeline">
        <Timeline analyzers={analyzers} yScale={0.4} />
      </SubSection>
      <AllCooldownUsagesList analyzers={analyzers} />
    </Section>
  );
}
