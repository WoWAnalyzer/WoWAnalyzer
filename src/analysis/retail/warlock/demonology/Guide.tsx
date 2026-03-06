import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CooldownSubsection from './modules/guide/CooldownsSubsection';
import ResourceUsage from './modules/guide/ResourceUsage';
import DefensivesGuide from '../shared/Defensives';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Disclaimer">
        <>
          Information in this guide is partially out of date. Currently, the Demonic Tyrant section
          is using the information from previous expansions where you had to extend as many pets as
          possible. Tyrant no longer works that way, instead, when you cast Summon Demonic Tyrant,
          each active pet increases the damage of your Tyrant.
        </>
      </Section>
      <CoreSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
      <DefensivesGuide modules={modules} events={events} info={info} />
      <ResourceUsage modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function CoreSection({ modules }: GuideProps<typeof CombatLogParser>) {
  return <Section title="Core">{modules.alwaysBeCasting.guideSubsection}</Section>;
}

function CooldownSection({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <CooldownSubsection />
    </Section>
  );
}
