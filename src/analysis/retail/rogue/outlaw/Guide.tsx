import { GuideProps, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

import EnergyCapWaste from 'analysis/retail/rogue/shared/guide/EnergyCapWaste';
import TALENTS from 'common/TALENTS/rogue';
import { ResourceLink, SpellLink } from 'interface';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CombatLogParser from './CombatLogParser';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as AplCheck from './modules/apl/AplCheck';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <CoreRotationSection modules={modules} events={events} info={info} />
      <ActionPriorityList modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function ResourceUsageSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const percentAtCap = modules.energyTracker.percentAtCap;
  const energyWasted = modules.energyTracker.wasted;

  return (
    <Section title="Resource Use">
      <SubSection title="Energy">
        <p>
          <>
            Your primary resource is <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />. Typically,
            ability use will be limited by <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />, not time.
            Avoid capping <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> - lost{' '}
            <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> regeneration is lost DPS. It will
            occasionally be impossible to avoid capping{' '}
            <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> - like while handling mechanics or during
            intermission phases.
          </>
        </p>
        <EnergyCapWaste
          percentAtCap={percentAtCap}
          perfectTimeAtCap={0.05}
          goodTimeAtCap={0.1}
          okTimeAtCap={0.15}
          wasted={energyWasted}
        />
        {modules.energyGraph.plot}
        <p></p>
        {info.combatant.hasTalent(TALENTS.BLADE_RUSH_TALENT) && modules.bladeRush.guide}
      </SubSection>
      <SubSection title="Combo Points">
        <p>
          <>
            Most of your abilities either <strong>build</strong> or <strong>spend</strong>{' '}
            <ResourceLink id={RESOURCE_TYPES.COMBO_POINTS.id} />. Never use a builder at 6 or 7 CPs,
            and always wait until 6 or more cps to use a spender.
          </>
        </p>
        <SideBySidePanels>
          <RoundedPanel>{modules.builderUse.chart}</RoundedPanel>
          <RoundedPanel>{modules.finisherUse.chart}</RoundedPanel>
        </SideBySidePanels>
        <p></p>
        <p>
          <>-- WIP section -- Higlight which builders the user is commonly overcapping with.</>
        </p>
      </SubSection>
    </Section>
  );
}

function CoreRotationSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return <Section title="Core rotation">{modules.finisherUse.guide}</Section>;
}

function ActionPriorityList({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Action Priority List">
      <p>
        Outlaw has a fast paced rotation that is constantly reacting to buffs and procs. The spec
        doesn't burst but makes up for it in consistent output. Should be thought as a chaining
        priority list:
        <ol>
          <li>Cooldowns, according to the priorities below.</li>
          <li>Finishers, if you are at 6cp or higher, according to the priorities below.</li>
          <li>Builders, according to the priorities below.</li>
        </ol>
      </p>
      <p>
        This Action Priority List (APL) is a simplified version off the simc APL that can be found{' '}
        <a href="https://github.com/simulationcraft/simc/blob/dragonflight/engine/class_modules/apl/rogue/outlaw_df.simc">
          here
        </a>
        .
      </p>
      <AplSectionData checker={AplCheck.check} apl={AplCheck.apl()} />
      <hr />
      <p>
        <strong>Disclaimer:</strong> (Currently unsuported spells/talents)
        <ul>
          <li>
            {' '}
            <SpellLink id={TALENTS.GHOSTLY_STRIKE_TALENT} />
          </li>
          <li>
            {' '}
            <SpellLink id={TALENTS.THISTLE_TEA_TALENT} />
          </li>
          <li>
            {' '}
            <SpellLink id={TALENTS.KEEP_IT_ROLLING_TALENT} /> builds
          </li>
          <li>
            {' '}
            <SpellLink id={TALENTS.BLADE_FLURRY_TALENT} />
          </li>
        </ul>
      </p>
      <p>You can use the accuracy here as a reference point to compare to other logs.</p>
    </Section>
  );
}
