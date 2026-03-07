import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import ResourceUsage from './modules/guide/ResourceUsage';
import CooldownSubsection from './modules/guide/CooldownSubsection';
import DefensivesGuide from '../shared/Defensives';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core">
        <Section title="DoT Uptime">{modules.immolateUptime.guideSubsection}</Section>
        <Section title="Cooldown Usage">
          <CooldownSubsection />
        </Section>
        {modules.havocAnalyzer?.active && (
          <Section title="Havoc">{modules.havocGuide.guideSubsection}</Section>
        )}
      </Section>
      <DefensivesGuide modules={modules} events={events} info={info} />
      <ResourceUsage modules={modules} events={events} info={info} />

      <PreparationSection />
    </>
  );
}
