import { GuideProps, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { t, Trans } from '@lingui/macro';
import EnergyCapWaste from 'analysis/retail/rogue/shared/guide/EnergyCapWaste';
import TALENTS from 'common/TALENTS/rogue';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';

import CombatLogParser from './CombatLogParser';
import CooldownGraphSubsection from './guide/CooldownGraphSubsection';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <CoreRotationSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function ResourceUsageSection({ modules }: GuideProps<typeof CombatLogParser>) {
  const percentAtCap = modules.energyTracker.percentAtCap;
  const energyWasted = modules.energyTracker.wasted;

  return (
    <Section
      title={t({
        id: 'guide.rogue.assassination.sections.resources.title',
        message: 'Resource Use',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.rogue.assassination.sections.resources.energy.title',
          message: 'Energy',
        })}
      >
        <p>
          <Trans id="guide.rogue.assassination.sections.resources.energy.summary">
            Your primary resource is Energy. Typically, ability use will be limited by energy, not
            time. Avoid capping energy - lost energy regeneration is lost DPS. It will occasionally
            be impossible to avoid capping energy - like while handling mechanics or during
            intermission phases.
          </Trans>
        </p>
        <EnergyCapWaste
          percentAtCap={percentAtCap}
          perfectTimeAtCap={0.05}
          goodTimeAtCap={0.1}
          okTimeAtCap={0.15}
          wasted={energyWasted}
        />
        {modules.energyGraph.plot}
      </SubSection>
      <SubSection
        title={t({
          id: 'guide.rogue.assassination.sections.resources.comboPoints.title',
          message: 'Combo Points',
        })}
      >
        <p>
          <Trans id="guide.rogue.assassination.sections.resources.comboPoints.summary">
            Most of your abilities either <strong>build</strong> or <strong>spend</strong> Combo
            Points. Never use a builder at max CPs, and always wait until max CPs to use a spender.
          </Trans>
        </p>
        <SideBySidePanels>
          <RoundedPanel>{modules.builderUse.chart}</RoundedPanel>
          <RoundedPanel>{modules.finisherUse.chart}</RoundedPanel>
        </SideBySidePanels>
      </SubSection>
    </Section>
  );
}

function CoreRotationSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.rogue.assassination.sections.coreRotation.title',
        message: 'Core Rotation',
      })}
    >
      <p>
        Assassination's core rotation involves performing <strong>builder</strong> abilites up to{' '}
        {modules.comboPointTracker.maxResource} combo points, then using a <strong>spender</strong>{' '}
        ability. Maintain your damage over time effects on targets, then fill with your direct
        damage abilities. Refer to the spec guide for{' '}
        <a
          href="https://www.wowhead.com/assassination-rogue-rotation-guide"
          target="_blank"
          rel="noopener noreferrer"
        >
          rotation details
        </a>
        . See below for spell usage details.
      </p>
      <HideExplanationsToggle id="hide-explanations-rotation" />
      {modules.ruptureUptimeAndSnapshots.guideSubsection}
      {modules.envenom.guideSubsection}
      {info.combatant.hasTalent(TALENTS.CRIMSON_TEMPEST_TALENT) &&
        modules.crimsonTempestUptimeAndSnapshots.guideSubsection}
      {modules.garroteUptimeAndSnapshots.guideSubsection}
      {modules.hitCountAoe.guideSubsection}
    </Section>
  );
}

function CooldownSection(_: GuideProps<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.rogue.assassination.sections.cooldowns.title',
        message: 'Cooldowns',
      })}
    >
      <p>
        Assassination's cooldowns are decently powerful but should not be held on to for long. In
        order to maximize usages over the course of an encounter, you should aim to send the
        cooldown as soon as it becomes available (as long as it can do damage on target). It is
        particularly important to use <SpellLink id={SPELLS.VANISH.id} /> as often as possible.
      </p>
      <CooldownGraphSubsection />
    </Section>
  );
}
