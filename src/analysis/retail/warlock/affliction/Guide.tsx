import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CooldownSubsection from './modules/guide/CooldownsSubsection';
import ResourceUsage from './modules/guide/ResourceUsage';
import DefensivesGuide from '../shared/Defensives';
import UnstableAfflictionGuide from './modules/guide/UnstableAfflictionGuide';
import { DemonicHealthstoneGuide } from '../shared/DHSGuide';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      {/* Always Be Casting Section */}
      <Section title="Always Be Casting">{modules.alwaysBeCasting.guideSubsection}</Section>

      {/* DoT Uptime Section */}
      <Section title="Dot Uptimes">{modules.dotUptimesGuide.guideSubsection}</Section>

      {/* Unstable Affliction Section */}
      <Section title="Unstable Affliction">
        <UnstableAfflictionGuide unstableAffliction={modules.unstableaffliction} />
      </Section>

      {/* Cooldowns Section */}
      <Section title="Cooldown Usage">
        <CooldownSubsection />
      </Section>

      {/* Defensives Section with Healthstone Tracker */}
      <Section title="Defensives">
        <Section title="Healthstone Tracker">
          {modules.demonicHealthstone?.active && (
            <DemonicHealthstoneGuide
              analyzer={modules.demonicHealthstone}
              fightStart={info.fightStart}
              fightEnd={info.fightEnd}
            />
          )}
        </Section>

        <DefensivesGuide modules={modules} events={events} info={info} />
      </Section>

      {/* Resource Usage Section */}
      <Section title="Resource Usage">
        <ResourceUsage modules={modules} events={events} info={info} />
      </Section>

      {/* Preparation Section */}
      <PreparationSection />
    </>
  );
}
