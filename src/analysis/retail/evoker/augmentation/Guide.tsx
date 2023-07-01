import CombatLogParser from './CombatLogParser';
import { GuideProps, Section } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { CooldownSection } from './modules/guide/Cooldown';
import { IntroSection } from './modules/guide/IntroSection';

import HideGoodCastsToggle from 'interface/guide/components/HideGoodCastsToggle';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import { t } from '@lingui/macro';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IntroSection />
      <CoreRotationSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} info={info} events={events} />
      <PreparationSection />
    </>
  );
}

function CoreRotationSection({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.evoker.augmentation.sections.coreRotation.title',
        message: 'Core Rotation',
      })}
    >
      <HideExplanationsToggle id="hide-explanations-rotations" />
      <HideGoodCastsToggle id="hide-good-casts-rotations" />
      {modules.sandsOfTime.guideSubsection()}
    </Section>
  );
}
