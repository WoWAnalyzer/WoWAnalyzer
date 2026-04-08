import { GuideProps, Section, SubSection } from 'interface/guide';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import CombatLogParser from '../../CombatLogParser';
import { ResourceLink, SpellLink } from 'interface';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import { HideGoodCastsToggle } from 'interface/guide/components/HideGoodCastsToggle';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import PerformancePercentage from 'analysis/retail/evoker/devastation/modules/guide/PerformancePercentage';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';

export function CoreRotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core Rotation">
      <p>
        Augmentation's core rotation revolves around proper upkeep of your buffs:{' '}
        <SpellLink spell={TALENTS_EVOKER.EBON_MIGHT_TALENT} />,{' '}
        <SpellLink spell={TALENTS_EVOKER.PRESCIENCE_TALENT} />,{' '}
        <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />, and{' '}
        <SpellLink spell={TALENTS_EVOKER.DUPLICATE_1_AUGMENTATION_TALENT} />. While using your
        empowers: <SpellLink spell={SPELLS.FIRE_BREATH} /> and <SpellLink spell={SPELLS.UPHEAVAL} />{' '}
        on cooldown, along with spending essence on{' '}
        <SpellLink spell={TALENTS_EVOKER.ERUPTION_TALENT} />; using{' '}
        <SpellLink spell={SPELLS.LIVING_FLAME_CAST} /> to fill in the gaps.
      </p>
      <p>
        Your main cooldown, <SpellLink spell={TALENTS_EVOKER.BREATH_OF_EONS_TALENT} />, should be
        used when enemies will survive its full duration, favouring high damage phases.
      </p>

      <HideExplanationsToggle id="hide-explanations-rotations" />
      <HideGoodCastsToggle id="hide-good-casts-rotations" />

      {modules.sandsOfTime.guideSubsection()}

      <AlwaysBeCastingSection modules={modules} events={events} info={info} />

      <EssenceGraphSection modules={modules} events={events} info={info} />

      <SubSection title="Buff Graph">
        This graph shows your uptime of <SpellLink spell={TALENTS_EVOKER.EBON_MIGHT_TALENT} /> and{' '}
        <SpellLink spell={TALENTS_EVOKER.DUPLICATE_1_AUGMENTATION_TALENT} />, as well as how many{' '}
        <SpellLink spell={TALENTS_EVOKER.PRESCIENCE_TALENT} /> buffs you had active over the course
        of the encounter. Use this to ensure that you are properly upkeeping your buffs.
        {modules.buffTrackerGraph.plot}
      </SubSection>

      {modules.moltenEmbers.guideSubsection()}

      <BlisteringScalesSection modules={modules} events={events} info={info} />
    </Section>
  );
}

function BlisteringScalesSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  if (
    !info.combatant.hasTalent(TALENTS_EVOKER.BLISTERING_SCALES_TALENT) ||
    info.combatant.hasTalent(TALENTS_EVOKER.REGENERATIVE_CHITIN_TALENT)
  ) {
    return null;
    //To-do: Possibly have a simpler uptime tracker here for Chitin?
  }
  return (
    <SubSection title="Blistering Scales">
      <ExplanationRow>
        <Explanation>
          <p>
            <strong>
              <SpellLink spell={TALENTS_EVOKER.BLISTERING_SCALES_TALENT} />
            </strong>{' '}
            provides your target with 20% of your armor.
          </p>
          <p>This should be kept up on the currently actively tanking player.</p>
        </Explanation>
        <RoundedPanel>
          <p>
            <strong>
              <SpellLink spell={TALENTS_EVOKER.BLISTERING_SCALES_TALENT} />
            </strong>{' '}
            uptime
          </p>
          {modules.blisteringScalesGraph.plot}
        </RoundedPanel>
      </ExplanationRow>
    </SubSection>
  );
}

function EssenceGraphSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const percentAtCap = modules.essenceTracker.percentAtCap;
  const essenceWasted = modules.essenceTracker.wasted;

  const perfectTimeAtEssenceCap = 0.1;
  const goodTimeAtEssenceCap = 0.15;
  const okTimeAtEssenceCap = 0.2;

  const percentAtCapPerformance =
    percentAtCap <= perfectTimeAtEssenceCap
      ? QualitativePerformance.Perfect
      : percentAtCap <= goodTimeAtEssenceCap
        ? QualitativePerformance.Good
        : percentAtCap <= okTimeAtEssenceCap
          ? QualitativePerformance.Ok
          : QualitativePerformance.Fail;

  return (
    <SubSection title="Essence Graph">
      <p>
        Your primary resource is <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} />. You should avoid
        overcapping <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> - lost{' '}
        <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> generation is lost DPS. Sometimes it will be
        impossible to avoid overcapping <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> - due to
        handling mechanics, high rolling <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> procs
        or during intermission phases.
      </p>
      <p>
        The chart below shows your <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> over the course
        of the encounter. You wasted{' '}
        <PerformancePercentage
          performance={percentAtCapPerformance}
          perfectPercentage={perfectTimeAtEssenceCap}
          goodPercentage={goodTimeAtEssenceCap}
          okPercentage={okTimeAtEssenceCap}
          percentage={percentAtCap}
          flatAmount={essenceWasted}
        />{' '}
        of your <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} />.
      </p>
      {modules.essenceGraph.plot}
    </SubSection>
  );
}

function AlwaysBeCastingSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection title="Always be Casting">
      <p>
        <em>
          <b>
            Continuously chaining casts throughout an encounter is the single most important thing
            for achieving good DPS as a caster.
          </b>
        </em>
      </p>
      <p>
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
      <ActiveTimeGraph
        activeTimeSegments={modules.alwaysBeCasting.activeTimeSegments}
        fightStart={info.fightStart}
        fightEnd={info.fightEnd}
      />
    </SubSection>
  );
}
