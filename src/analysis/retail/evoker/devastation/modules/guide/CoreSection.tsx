import CombatLogParser from '../../CombatLogParser';
import { GuideProps, Section, SubSection } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import PerformancePercentage from './PerformancePercentage';
import { ResourceLink, SpellLink, Tooltip } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { TIERS } from 'game/TIERS';
import { InformationIcon } from 'interface/icons';
import SPELLS from 'common/SPELLS/evoker';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';

export function CoreSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const hasT31 = info.combatant.has4PieceByTier(TIERS.DF3);
  const percentAtCap = modules.essenceTracker.percentAtCap;
  const essenceWasted = modules.essenceTracker.wasted;

  const perfectTimeAtEssenceCap = 0.1 + (hasT31 ? 0.05 : 0);
  const goodTimeAtEssenceCap = 0.15 + (hasT31 ? 0.05 : 0);
  const okTimeAtEssenceCap = 0.2 + (hasT31 ? 0.05 : 0);

  const percentAtCapPerformance =
    percentAtCap <= perfectTimeAtEssenceCap
      ? QualitativePerformance.Perfect
      : percentAtCap <= goodTimeAtEssenceCap
        ? QualitativePerformance.Good
        : percentAtCap <= okTimeAtEssenceCap
          ? QualitativePerformance.Ok
          : QualitativePerformance.Fail;

  return (
    <Section title="Core">
      <SubSection title="Essence Graph">
        <p>
          Your primary resource is <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} />. You should avoid
          overcapping <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> - lost{' '}
          <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> generation is lost DPS. Sometimes it will
          be impossible to avoid overcapping <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> - due
          to handling mechanics, high rolling <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} />{' '}
          procs or during intermission phases.
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
          {hasT31 && (
            <>
              {' '}
              <Tooltip
                content={
                  <div>
                    Since you have T31 4pc an extra 5% grace period is added, as it is expected that
                    more <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> will go to waste, due to
                    the extra amount of <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} />{' '}
                    generated.
                  </div>
                }
              >
                <div style={{ display: 'inline' }}>
                  <InformationIcon style={{ fontSize: '1.4em' }} />
                </div>
              </Tooltip>
            </>
          )}
        </p>
        {modules.essenceGraph.plot}
      </SubSection>
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
    </Section>
  );
}
