import { t, Trans } from '@lingui/macro';
import { ModulesOf, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/hunter/beastmastery/CombatLogParser';

export default function RotationSection(modules: ModulesOf<typeof CombatLogParser>) {
  //
  return (
    <Section
      title={t({
        id: 'guide.gunter.beastmastery.sections.rotation.title',
        message: 'Rotation',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.hunter.beastmastery.sections.rotation.corerotation.title',
          message: 'Core Rotation',
        })}
      ></SubSection>
      <SubSection
        title={t({
          id: 'guide.hunter.beastmastery.sections.rotation.cooldowns.title',
          message: 'Cooldowns',
        })}
      ></SubSection>
      <SubSection
        title={t({
          id: 'guide.hunter.beastmastery.sections.rotation.frenzy.title',
          message: 'Frenzy Graph',
        })}
      >
        <p>
          <Trans id="guide.hunter.beastmastery.sections.rotation.frenzy.summary">
            This graph shows the number of stacks of Frenzy you had
          </Trans>
        </p>
        {modules.frenzyBuffStackGraph.plot}
      </SubSection>
    </Section>
  );
}
