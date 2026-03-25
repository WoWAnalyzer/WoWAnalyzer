import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CooldownSubsection from './modules/guide/CooldownsSubsection';
import ResourceUsage from './modules/guide/ResourceUsage';
import DefensivesGuide from '../shared/Defensives';
import DemonicTyrantGuide from './modules/guide/DemonicTyrantGuide';
import { DemonicHealthstoneGuide } from '../shared/DHSGuide';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
      <DefensivesSection modules={modules} events={events} info={info} />
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
      <DemonicTyrantGuide />
    </Section>
  );
}

// ✅ New Defensives Section including Healthstone Tracker
function DefensivesSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
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
  );
}
