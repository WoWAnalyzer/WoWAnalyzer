import { GuideProps } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from '../../CombatLogParser';
import ResourceUseSection from './sections/resources/ResourceUseSection';

export default function Guide({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUseSection {...modules} />
      <PreparationSection />
    </>
  );
}
