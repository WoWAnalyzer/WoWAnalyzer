import { t } from '@lingui/macro';
import CombatLogParser from 'analysis/retail/hunter/beastmastery/CombatLogParser';
import { formatPercentage } from 'common/format';
import { ModulesOf, Section, SubSection } from 'interface/guide';

export default function ResourceUseSection(modules: ModulesOf<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.hunter.beastmastery.sections.resources.title',
        message: 'Resource Use',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.hunter.beastmastery.sections.resources.focus.title',
          message: 'Focus',
        })}
      >
        <p>
          Your primary resource is Focus. Typically, ability use will be limited by focus, not time.
          Avoid capping focus - lost focus regeneration is lost DPS. It will occasionally be
          impossible to avoid capping focus - like while handling mechanics or during intermission
          phases.
        </p>
        The chart below shows your focus over the course of the encounter. You spent{' '}
        <strong>{formatPercentage(modules.focusTracker.percentAtCap, 1)}%</strong> of the encounter
        capped on focus.
        {modules.focusGraph.plot}
      </SubSection>
    </Section>
  );
}
