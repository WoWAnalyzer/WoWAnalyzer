import { GuideProps } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from '../../CombatLogParser';
import ResourceUseSection from './sections/resources/ResourceUseSection';
import RotationSection from './sections/rotation/RotationSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUseSection {...modules} />
      <RotationSection {...modules} />
      <PreparationSection />
    </>
  );
}
