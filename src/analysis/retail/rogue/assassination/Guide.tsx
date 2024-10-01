import { GuideProps, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import EnergyCapWaste from 'analysis/retail/rogue/shared/guide/EnergyCapWaste';
import TALENTS from 'common/TALENTS/rogue';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import { ResourceLink, SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import CombatLogParser from './CombatLogParser';
import CooldownGraphSubsection from './guide/CooldownGraphSubsection';
import { HideGoodCastsToggle } from 'interface/guide/components/HideGoodCastsToggle';
import { getTargetComboPoints } from 'analysis/retail/rogue/assassination/constants';
import {
  ExperimentalKingsbaneContextProvider,
  ExperimentalKingsbaneToggle,
} from 'analysis/retail/rogue/assassination/guide/ExperimentalKingsbaneContext';

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

function ResourceUsageSection({ info, modules }: GuideProps<typeof CombatLogParser>) {
  const percentAtCap = modules.energyTracker.percentAtCap;
  const energyWasted = modules.energyTracker.wasted;

  return (
    <Section title="Resource Use">
      <SubSection title="Energy">
        <p>
          Your primary resource is <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />. Typically,
          ability use will be limited by <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />, not time.
          Avoid capping <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> - lost{' '}
          <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> regeneration is lost DPS. It will
          occasionally be impossible to avoid capping <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />{' '}
          - like while handling mechanics or during intermission phases.
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
      <SubSection title="Combo Points">
        <p>
          Most of your abilities either <strong>build</strong> or <strong>spend</strong>{' '}
          <ResourceLink id={RESOURCE_TYPES.COMBO_POINTS.id} />. Never use a builder at max CPs, and
          always wait until {getTargetComboPoints(info.combatant)}+ CPs to use a spender.
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
    <Section title="Core Rotation">
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
      <HideGoodCastsToggle id="hide-good-casts-rotation" />
      {modules.mutilate.guideSubsection}
      {modules.garroteUptimeAndSnapshots.guideSubsection}
      {modules.ruptureUptimeAndSnapshots.guideSubsection}
      {modules.envenom.guideSubsection}
      {info.combatant.hasTalent(TALENTS.CRIMSON_TEMPEST_TALENT) &&
        modules.crimsonTempestUptimeAndSnapshots.guideSubsection}
      {info.combatant.hasTalent(TALENTS.THISTLE_TEA_TALENT) && modules.thistleTea.guideSubsection}
      {modules.hitCountAoe.guideSubsection}
    </Section>
  );
}

function CooldownSection({ info, modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <ExperimentalKingsbaneContextProvider>
      <Section title="Cooldowns">
        <p>
          Assassination's cooldowns are decently powerful but should not be held on to for long. In
          order to maximize usages over the course of an encounter, you should aim to send the
          cooldown as soon as it becomes available (as long as it can do damage on target). It is
          particularly important to use <SpellLink spell={SPELLS.VANISH} /> as often as possible.
        </p>
        <HideExplanationsToggle id="hide-explanations-rotation" />
        <HideGoodCastsToggle id="hide-good-casts-rotation" />
        <ExperimentalKingsbaneToggle />
        <CooldownGraphSubsection />
        {info.combatant.hasTalent(TALENTS.KINGSBANE_TALENT) && modules.kingsbane.guideSubsection}
      </Section>
    </ExperimentalKingsbaneContextProvider>
  );
}
