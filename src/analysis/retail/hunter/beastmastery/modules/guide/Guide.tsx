import { GuideProps } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from '../../CombatLogParser';
import ResourceUseSection from './sections/resources/ResourceUseSection';
import RotationSection from './sections/rotation/RotationSection';
import TALENTS from 'common/TALENTS/hunter';
import DarkRangerGraphSection from 'analysis/retail/hunter/shared/guide/sections/graphs/DarkRangerBuffSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUseSection {...modules} />
      <RotationSection modules={modules} events={events} info={info} />
      {info.combatant.hasTalent(TALENTS.BLACK_ARROW_TALENT) && (
        <DarkRangerGraphSection modules={modules} events={events} info={info} />
      )}
      <PreparationSection />
    </>
  );
}
