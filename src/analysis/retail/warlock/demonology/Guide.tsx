import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CooldownSubsection from './modules/guide/CooldownsSubsection';
import ResourceUsage from './modules/guide/ResourceUsage';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CooldownSection modules={modules} events={events} info={info} />
      <ResourceUsage modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function CooldownSection({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <CooldownSubsection />
      {modules.summonDemonicTyrant.guideSubsection}
    </Section>
  );
}
