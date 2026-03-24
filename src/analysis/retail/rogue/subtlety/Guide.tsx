import { GuideProps, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import EnergyCapWaste from 'analysis/retail/rogue/shared/guide/EnergyCapWaste';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import { ResourceLink, SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CombatLogParser from './CombatLogParser';
import CooldownGraphSubsection from './guide/CooldownGraphSubsection';

export const GUIDE_CORE_EXPLANATION_PERCENT = 50;

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
          Your primary resource is <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />. Avoid energy
          capping, as it results in lost DPS.
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
          Subtlety Rogue builds and spends <ResourceLink id={RESOURCE_TYPES.COMBO_POINTS.id} />{' '}
          strategically. Ensure you never waste combo points.
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
        Subtlety’s core rotation involves generating combo points with builders and spending them on
        finishers. Cooldowns like <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} /> and{' '}
        <SpellLink spell={SPELLS.SHADOW_DANCE} /> should be optimized.
      </p>
      <HideExplanationsToggle id="hide-explanations-rotation" />
      {modules.shadowDance.guideSubsection}
      {modules.symbolsOfDeath.guideSubsection}
      {modules.ruptureUptime.guideSubsection}
      {modules.flagellationAnalysis.guideSubsection}
      {modules.shadowBlades.guideSubsection}
    </Section>
  );
}

function CooldownSection({ info, modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <p>Subtlety Rogue’s cooldowns should be used efficiently to maximize burst damage.</p>
      <HideExplanationsToggle id="hide-explanations-rotation" />
      <CooldownGraphSubsection />
    </Section>
  );
}
