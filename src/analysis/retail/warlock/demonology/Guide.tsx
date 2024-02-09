import { GuideProps } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
// import Rotation from './modules/guide/Rotation';
import Cooldowns from './modules/guide/Cooldowns';
import ResourceUsage from './modules/guide/ResourceUsage';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Cooldowns />
      <ResourceUsage modules={modules} events={events} info={info} />
      {/* <Rotation modules={modules} events={events} info={info} /> */}
      <PreparationSection />
    </>
  );
}
