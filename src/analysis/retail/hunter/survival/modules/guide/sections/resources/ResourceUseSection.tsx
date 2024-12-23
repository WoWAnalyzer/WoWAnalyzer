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
          Your primary resource is <ResourceLink id={RESOURCE_TYPES.FOCUS.id} />. Typically, ability
          use will be limited by <ResourceLink id={RESOURCE_TYPES.FOCUS.id} />, not time. Avoid
          capping <ResourceLink id={RESOURCE_TYPES.FOCUS.id} /> - lost{' '}
          <ResourceLink id={RESOURCE_TYPES.FOCUS.id} /> regeneration is lost DPS. It will
          occasionally be impossible to avoid capping <ResourceLink id={RESOURCE_TYPES.FOCUS.id} />{' '}
          - like while handling mechanics or during intermission phases or during Coordinated
          Assault with Relentless Primal Ferocity talented.
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
      <SubSection title="Tip of the Spear">
        <p>
          Your <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> ,{' '}
          <SpellLink spell={TALENTS.FLANKING_STRIKE_TALENT} /> <strong>build</strong>{' '}
          <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} />
          Stacks. These stacks are consumed one per cast of your <strong>Direct Damage</strong>{' '}
          dealing abilities.
          <br></br>
          <strong>
            {' '}
            Tip of the Spear does not buff the damage of abilities like{' '}
            <SpellLink spell={TALENTS.SPEARHEAD_TALENT} />, or{' '}
            <SpellLink spell={TALENTS.MERCILESS_BLOW_TALENT} />.
          </strong>
          <br></br>
          It is preferable to spend these stacks on high value abilities like{' '}
          <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} />,{' '}
          <SpellLink spell={TALENTS.FLANKING_STRIKE_TALENT} />, and when talented,
          <SpellLink spell={TALENTS.FURY_OF_THE_EAGLE_TALENT} />.<br></br>
          It is beneficial to tip <SpellLink spell={TALENTS.EXPLOSIVE_SHOT_TALENT} /> but not at the
          cost of generating a stack prior to casting the ability.
          <br></br>
          <SpellLink spell={TALENTS.KILL_SHOT_SURVIVAL_TALENT} /> should be tipped if playing
          Packleader because of <SpellLink spell={TALENTS.CULL_THE_HERD_TALENT} />
          , but can be treated the same as <SpellLink spell={TALENTS.EXPLOSIVE_SHOT_TALENT} /> if
          playing Sentinel.
        </p>
      </SubSection>
    </Section>
  );
}
