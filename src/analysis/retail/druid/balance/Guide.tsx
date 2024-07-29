import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/druid/balance/CombatLogParser';
import { ResourceLink, SpellLink } from 'interface';
import { TALENTS_DRUID } from 'common/TALENTS';
import { formatPercentage } from 'common/format';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import SPELLS from 'common/SPELLS';
import { PerformanceStrong } from 'analysis/retail/priest/shadow/modules/guide/ExtraComponents';
import PerformancePercentage from 'analysis/retail/demonhunter/shared/guide/PerformancePercentage';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import {
  GOOD_ASP_WASTED,
  OK_ASP_WASTED,
  PERFECT_ASP_WASTED,
} from 'analysis/retail/druid/balance/modules/core/astralpower/AstralPowerTracker';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import { ASTRAL_POWER_SCALE_FACTOR, cdSpell } from 'analysis/retail/druid/balance/constants';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSection modules={modules} events={events} info={info} />
      <RotationSection modules={modules} events={events} info={info} />
      <CooldownsSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function CoreSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core">
      <SubSection title="Always be Casting">
        <p>
          <em>
            <b>
              Continuously chaining casts throughout an encounter is the single most important thing
              for achieving good DPS as a caster.
            </b>
          </em>
          <br />
          There should be no delay at all between your spell casts, it's better to start casting the
          wrong spell than to think for a few seconds and then cast the right spell. You should be
          able to handle a fight's mechanics with the minimum possible interruption to your casting.
          Some fights have unavoidable downtime due to phase transitions and the like, so in these
          cases 0% downtime will not be possible - do the best you can.
        </p>
        <p>
          Active Time:{' '}
          <PerformanceStrong performance={modules.alwaysBeCasting.DowntimePerformance}>
            {formatPercentage(modules.alwaysBeCasting.activeTimePercentage, 1)}%
          </PerformanceStrong>{' '}
          Cancelled Casts:{' '}
          <PerformanceStrong performance={modules.cancelledCasts.CancelledPerformance}>
            {formatPercentage(modules.cancelledCasts.cancelledPercentage, 1)}%
          </PerformanceStrong>{' '}
        </p>
        <p>
          <ActiveTimeGraph
            activeTimeSegments={modules.alwaysBeCasting.activeTimeSegments}
            fightStart={info.fightStart}
            fightEnd={info.fightEnd}
          />
        </p>
      </SubSection>
      <SubSection title="Astral Power">
        <p>
          Your primary resource is <ResourceLink id={RESOURCE_TYPES.ASTRAL_POWER.id} />. Most of
          your spells generate Astral Power, which can be spent to cast{' '}
          <SpellLink spell={TALENTS_DRUID.STARSURGE_SHARED_TALENT} /> or{' '}
          <SpellLink spell={TALENTS_DRUID.STARFALL_TALENT} />. Avoid capping Astral Power!
        </p>
        The chart below shows your Astral Power over the course of the encounter. You wasted{' '}
        <PerformancePercentage
          performance={modules.astralPowerTracker.wastedPerformance}
          perfectPercentage={PERFECT_ASP_WASTED}
          goodPercentage={GOOD_ASP_WASTED}
          okPercentage={OK_ASP_WASTED}
          percentage={modules.astralPowerTracker.percentWasted}
          flatAmount={modules.astralPowerTracker.wasted * ASTRAL_POWER_SCALE_FACTOR}
        />{' '}
        of your <ResourceLink id={RESOURCE_TYPES.ASTRAL_POWER.id} />.
      </SubSection>
      {modules.astralPowerGraph.plot}
    </Section>
  );
}

function RotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Rotation">
      <p>
        Balance's core rotation involves maximizing time spent in{' '}
        <SpellLink spell={TALENTS_DRUID.ECLIPSE_TALENT} />, maximizing DoT uptimes, and spending
        Astral Power to avoid overcapping. After fulfilling these priorities, open GCDs are filled
        with <SpellLink spell={SPELLS.WRATH} /> or <SpellLink spell={SPELLS.STARFIRE} /> depending
        on Eclipse type and target count. Refer to the spec guide for more{' '}
        <a
          href="https://www.wowhead.com/guide/classes/druid/balance/rotation-cooldowns-pve-dps"
          target="_blank"
          rel="noopener noreferrer"
        >
          rotation details
        </a>
        .
      </p>
      {modules.dotUptimes.guideSubsection}
      {modules.eclipse.guideSubsection}
      {modules.fillerUsage.guideSubsection}
      {modules.spenderUsage.guideSubsection}
      {info.combatant.hasTalent(TALENTS_DRUID.STARLORD_TALENT) && modules.starlord.guideSubsection}
      {info.combatant.hasTalent(TALENTS_DRUID.NEW_MOON_TALENT) && modules.newMoon.guideSubsection}
      {info.combatant.hasTalent(TALENTS_DRUID.WILD_MUSHROOM_TALENT) &&
        modules.wildMushroom.guideSubsection}
    </Section>
  );
}

function CooldownsSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <p>
        Balance's cooldowns are moderately powerful and as with most DPS specs they should not be
        held for long. In order to maximize usages over the course of an encounter, aim to send the
        cooldown as soon as it becomes available (as long as you can be active on target over its
        duration).
      </p>
      <CooldownGraphSubsection modules={modules} events={events} info={info} />
      <CooldownBreakdownSubsection modules={modules} events={events} info={info} />
    </Section>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      {info.combatant.hasTalent(TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT) && (
        <CastEfficiencyBar
          spellId={cdSpell(info.combatant).id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) && (
        <CastEfficiencyBar
          spellId={SPELLS.CONVOKE_SPIRITS.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_DRUID.FURY_OF_ELUNE_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_DRUID.FURY_OF_ELUNE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {info.combatant.hasTalent(TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
    </SubSection>
  );
}

function CooldownBreakdownSubsection({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      {info.combatant.hasTalent(TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT) &&
        modules.celestialAlignment.guideCastBreakdown}
    </SubSection>
  );
}
