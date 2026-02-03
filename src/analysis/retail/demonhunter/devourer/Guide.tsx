import { GuideProps } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';
import { Section } from 'interface/guide';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSection />
      <PreparationSection />
    </>
  );
}

function CoreSection() {
  return (
    <Section title="Core">
      <FoundationDowntimeSection />
    </Section>
  );
}
