import { t } from '@lingui/core/macro';
import CombatLogParser from 'analysis/retail/hunter/survival/CombatLogParser';
import {
  RESOURCES_HUNTER_AVERAGE_THRESHOLD,
  RESOURCES_HUNTER_MAJOR_THRESHOLD,
  RESOURCES_HUNTER_MINOR_THRESHOLD,
} from 'analysis/retail/hunter/shared/constants';
import TALENTS from 'common/TALENTS/hunter';
import { formatNumber, formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, TooltipElement } from 'interface';
import { ModulesOf, PerformanceMark, Section, SubSection } from 'interface/guide';
import PerformanceStrongWithTooltip from 'interface/PerformanceStrongWithTooltip';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';

export default function ResourceUseSection(modules: ModulesOf<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.hunter.survival.sections.resources.title',
        message: 'Resource Use',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.hunter.survival.sections.resources.focus.title',
          message: 'Focus',
        })}
      >
        <p>
          With proper <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} /> management, you should
          avoid most issues with focus and waste will be minimal to non-existant. It will
          occasionally be impossible to avoid capping <ResourceLink id={RESOURCE_TYPES.FOCUS.id} />
          {'. '}
          As Pack Leader, it is occasionally impossible to avoid running out of focus. Sentinel does
          not have this issue.{' '}
          <TooltipElement
            content={
              <>
                Sentinel gains 5 extra focus per{' '}
                <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> and uses{' '}
                <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} /> more often than Pack Leader,
                which only costs 10 focus. Pack Leader largely ignores Bomb in favour of Raptor
                Strike and so spends focus faster. This is offset by Pack Leader&apos;s{' '}
                <SpellLink spell={TALENTS.LETHAL_BARBS_TALENT} /> talent which generates 2 focus per
                auto attack, but it is still not enough to completely avoid downtime. It is however
                minimal with proper play: as low as a total of 3s in a 5 minute fight.
              </>
            }
          >
            (?)
          </TooltipElement>
        </p>
        The chart below shows your <ResourceLink id={RESOURCE_TYPES.FOCUS.id} /> over the course of
        the encounter. You wasted{' '}
        <PerformanceStrongWithTooltip
          performance={modules.focusTracker.percentAtCapPerformance}
          tooltip={
            <>
              <p>
                <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect usage &lt;={' '}
                {formatPercentage(RESOURCES_HUNTER_MINOR_THRESHOLD, 0)}%
              </p>
              <p>
                <PerformanceMark perf={QualitativePerformance.Good} /> Good usage &lt;={' '}
                {formatPercentage(RESOURCES_HUNTER_AVERAGE_THRESHOLD, 0)}%
              </p>
              <p>
                <PerformanceMark perf={QualitativePerformance.Ok} /> OK usage &lt;={' '}
                {formatPercentage(RESOURCES_HUNTER_MAJOR_THRESHOLD, 0)}%
              </p>
            </>
          }
        >
          {formatNumber(modules.focusTracker.wasted)} (
          {formatPercentage(modules.focusTracker.percentAtCap, 1)}%)
        </PerformanceStrongWithTooltip>{' '}
        <ResourceLink id={RESOURCE_TYPES.FOCUS.id} />.{modules.focusGraph.plot}
      </SubSection>
    </Section>
  );
}
