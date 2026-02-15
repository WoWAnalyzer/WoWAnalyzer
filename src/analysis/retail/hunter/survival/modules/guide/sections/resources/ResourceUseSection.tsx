import { t } from '@lingui/macro';
import CombatLogParser from 'analysis/retail/hunter/survival/CombatLogParser';
import {
  RESOURCES_HUNTER_AVERAGE_THRESHOLD,
  RESOURCES_HUNTER_MAJOR_THRESHOLD,
  RESOURCES_HUNTER_MINOR_THRESHOLD,
} from 'analysis/retail/hunter/shared/constants';
import TALENTS from 'common/TALENTS/hunter';
import { formatNumber, formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink } from 'interface';
import { ModulesOf, PerformanceMark, Section, SubSection } from 'interface/guide';
import PerformanceStrongWithTooltip from 'interface/PerformanceStrongWithTooltip';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';

// The current design of Survival makes it so that Tip of the Spear is a more important resource to manage than Focus.
// Particularly for Sentinel, but this applies to Pack Leader as well. This will become more solidified once
// Apex Talent's are available and Strike as One proc's from every consumption of Tip.

export default function ResourceUseSection(modules: ModulesOf<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.hunter.survival.sections.resources.title',
        message: 'Resource Use',
      })}
    >
      <SubSection title="Tip of the Spear">
        <p>
          Your <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> <strong>builds</strong>{' '}
          <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} /> stacks. These stacks are consumed
          one per cast of your <strong>Direct Damage</strong> dealing abilities. It is essential to
          good play to avoid wasting stacks by only generating when you have 0 stacks of{' '}
          <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} />.
        </p>
        <p>
          You wasted {modules.tipOfTheSpear.totalWastedStacks} stacks of{' '}
          <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} />.
        </p>
        {modules.tipOfTheSpear.guideSubsection}
        <p>
          <strong>
            {' '}
            Tip of the Spear does not buff the periodic damage of abilities like{' '}
            <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} />, or{' '}
            <SpellLink spell={TALENTS.FLAMEFANG_PITCH_TALENT} />.
          </strong>
        </p>
      </SubSection>
      <hr />
      <SubSection
        title={t({
          id: 'guide.hunter.survival.sections.resources.focus.title',
          message: 'Focus',
        })}
      >
        <p>
          <ResourceLink id={RESOURCE_TYPES.FOCUS.id} /> in Midnight for Survival Hunters has been
          relegated to a secondary resource. With proper{' '}
          <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} /> management, you should not run out
          of focus and waste will be minimal to non-existant. It will occasionally be impossible to
          avoid capping <ResourceLink id={RESOURCE_TYPES.FOCUS.id} /> but that is ok with the
          current design of the spec. You should be fitting 2-3 abilities between each cast of Kill
          Command which will maintain a health buffer between capping and running out of focus.
        </p>
        The chart below shows your <ResourceLink id={RESOURCE_TYPES.FOCUS.id} /> over the course of
        the encounter. You wasted{' '}
        <PerformanceStrongWithTooltip
          performance={modules.focusTracker.percentAtCapPerformance}
          tooltip={
            <>
              <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect usage &lt;={' '}
              {formatPercentage(RESOURCES_HUNTER_MINOR_THRESHOLD, 0)}%
              <br />
              <PerformanceMark perf={QualitativePerformance.Good} /> Good usage &lt;={' '}
              {formatPercentage(RESOURCES_HUNTER_AVERAGE_THRESHOLD, 0)}%
              <br />
              <PerformanceMark perf={QualitativePerformance.Ok} /> OK usage &lt;={' '}
              {formatPercentage(RESOURCES_HUNTER_MAJOR_THRESHOLD, 0)}%{' '}
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
