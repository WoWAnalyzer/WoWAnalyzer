import CombatLogParser from '../CombatLogParser';
import { GuideProps } from 'interface/guide';
import { IntroSection } from './guide/IntroSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IntroSection />
    </>
  );
}
