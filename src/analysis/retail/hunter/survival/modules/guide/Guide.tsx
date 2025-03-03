import { GuideProps } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from '../../CombatLogParser';
import ResourceUseSection from './sections/resources/ResourceUseSection';
import RotationSection from './sections/rotation/RotationSection';
import ActiveTime from './sections/rotation/ActiveTime';
import Cooldown from './sections/rotation/Cooldown';
import MajorDefensives from './sections/defensives/DamageTaken';
import { IntroSection } from './sections/intro/IntroSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IntroSection />
      <ActiveTime modules={modules} events={events} info={info} />
      <ResourceUseSection {...modules} />
      <Cooldown modules={modules} events={events} info={info} />
      <RotationSection modules={modules} events={events} info={info} />
      <MajorDefensives />
      {modules.exhilarationTiming.guideSubsection}
      <PreparationSection />
    </>
  );
}
