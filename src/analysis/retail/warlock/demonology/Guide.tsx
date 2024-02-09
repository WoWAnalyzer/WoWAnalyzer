import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
// import Rotation from './modules/guide/Rotation';
import CooldownSubsection from './modules/guide/CooldownsSubsection';
import ResourceUsage from './modules/guide/ResourceUsage';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CooldownSection />
      <ResourceUsage modules={modules} events={events} info={info} />
      {/* <Rotation modules={modules} events={events} info={info} /> */}
      <PreparationSection />
    </>
  );
}

function CooldownSection() {
  return (
    <Section title="Cooldowns">
      <CooldownSubsection />
    </Section>
  );
}
