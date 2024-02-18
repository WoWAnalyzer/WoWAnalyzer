import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
// import Rotation from './modules/guide/Rotation';
import CooldownSubsection from './modules/guide/CooldownsSubsection';
import ResourceUsage from './modules/guide/ResourceUsage';
// import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CooldownSection modules={modules} events={events} info={info} />
      <ResourceUsage modules={modules} events={events} info={info} />
      {/* <Rotation modules={modules} events={events} info={info} /> */}
      <PreparationSection />
    </>
  );
}

function CooldownSection({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <CooldownSubsection />
      {/* <CooldownUsage analyzer={modules.summonDemonicTyrant} title="Summon Demonic Tyrant"/> */}
      {modules.summonDemonicTyrant.guideSubsection}
    </Section>
  );
}
