import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import ResourceUsage from './modules/guide/ResourceUsage';
import CooldownSubsection from './modules/guide/CooldownSubsection';
import DefensivesGuide from '../shared/Defensives';
import { HavocGuide } from './modules/guide/HavocGuide';
import { DemonicHealthstoneGuide } from '../shared/DHSGuide';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      {/* Core Section */}
      <Section title="Core">
        <Section title="DoT Uptime">{modules.immolateUptime.guideSubsection}</Section>

        <Section title="Cooldown Usage">
          <CooldownSubsection />
        </Section>
      </Section>

      {/* Havoc Section */}
      {modules.havocAnalyzer?.active && (
        <Section title="Havoc">
          <HavocGuide
            havocAnalyzer={modules.havocAnalyzer}
            formatTimestamp={modules.havocAnalyzer.getFormatTimestamp()}
          />
        </Section>
      )}

      {/* Defensives Section */}
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
      <Section title="Preparation">
        <PreparationSection />
      </Section>
    </>
  );
}
