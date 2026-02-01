import { GuideProps } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CoreSection from './guide/CoreSection';
import ProcsAndBuffsSection from './guide/ProcsAndBuffsSection';
import DefensivesSection from './modules/majordefensives/DefensivesGuideSection';
import CooldownSection from './guide/CooldownSection';

export const GUIDE_CORE_EXPLANATION_PERCENT = 50;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSection modules={modules} events={events} info={info} />
      <ProcsAndBuffsSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
      <DefensivesSection />
      <PreparationSection />
    </>
  );
}
