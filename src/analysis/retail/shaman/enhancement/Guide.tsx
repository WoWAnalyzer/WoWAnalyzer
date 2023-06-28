import { GuideProps } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import MaelstromUsage from './modules/guide/MaelstromUsage';
import Rotation from './modules/guide/Rotation';
import Cooldowns from './modules/guide/Cooldowns';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <MaelstromUsage key="maelstromusage" modules={modules} events={events} info={info} />
      <Rotation key="rotation" modules={modules} events={events} info={info} />
      <Cooldowns key="cooldowns" modules={modules} events={events} info={info} />
      <PreparationSection key="prep" />
    </>
  );
}
