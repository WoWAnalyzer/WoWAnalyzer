import CombatLogParser from './CombatLogParser';
import { GuideProps } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { CooldownSection } from './modules/guide/Cooldown';
import { IntroSection } from './modules/guide/IntroSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IntroSection />
      <CooldownSection modules={modules} info={info} events={events} />
      <PreparationSection />
    </>
  );
}
