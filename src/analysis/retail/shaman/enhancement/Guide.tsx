import { GuideProps } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import MaelstromUsage from './modules/guide/MaelstromUsage';
import Rotation from './modules/guide/Rotation';
import Cooldowns from './modules/guide/Cooldowns';

export default function Guide(props: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Rotation {...props} />
      <Cooldowns {...props} />
      <MaelstromUsage {...props} />
      <PreparationSection />
    </>
  );
}
