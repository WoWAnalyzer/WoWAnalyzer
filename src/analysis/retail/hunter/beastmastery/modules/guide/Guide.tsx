import { GuideProps } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from '../../CombatLogParser';
import { IntroSection } from './sections/intro/IntroSection';
import RotationSection from './sections/rotation/RotationSection';
import NaturesAllySection from './sections/resources/NaturesAllySection';
import CooldownGraphSection from './sections/resources/CooldownGraphSection';
import BestialWrathSection from './sections/cooldowns/BestialWrathSection';
import ExhilarationSection from './sections/cooldowns/ExhilarationSection';
import MajorDefensives from '../../../shared/guide/defensives/DamageTaken';

export default function Guide({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IntroSection />
      <NaturesAllySection {...modules} />
      <BestialWrathSection />
      <RotationSection />
      <CooldownGraphSection />
      <MajorDefensives />
      <ExhilarationSection />
      <PreparationSection />
    </>
  );
}
