import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CooldownSubsection from './modules/guide/CooldownsSubsection';
import ResourceUsage from './modules/guide/ResourceUsage';
import DefensivesGuide from '../shared/Defensives';
import UnstableAfflictionGuide from './modules/guide/UnstableAfflictionGuide';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Dot Uptimes">
        {modules.agony.guideSubsection}
        {modules.corruptionUptime.guideSubsection}
        {modules.haunt.guideSubsection}
      </Section>
      <Section title="Unstable Affliction">
        <UnstableAfflictionGuide unstableAffliction={modules.unstableaffliction} />
      </Section>
      <Section title="Cooldown Usage">
        <CooldownSubsection />
      </Section>

      <DefensivesGuide modules={modules} events={events} info={info} />
      <ResourceUsage modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}
