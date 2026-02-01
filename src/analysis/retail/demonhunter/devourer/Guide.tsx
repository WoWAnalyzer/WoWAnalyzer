import { GuideProps } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CoreSection from './guide/CoreSection';
import ProcsAndBuffsSection from './guide/ProcsAndBuffsSection';
import DefensivesSection from './modules/majordefensives/DefensivesGuideSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSection />
      <ProcsAndBuffsSection />
      <DefensivesSection />
      <PreparationSection />
    </>
  );
}
