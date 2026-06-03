import CombatLogParser from './CombatLogParser';
import { GuideProps } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { CooldownSection } from './modules/guide/Cooldown';
import { CoreRotation } from './modules/guide/CoreRotation';
import { DamageEfficiency } from './modules/guide/DamageEfficiencySection';
import { CoreSection } from './modules/guide/CoreSection';
import { DragonRageSection } from './modules/guide/DragonRageSection';
import { IntroSection } from './modules/guide/IntroSection';
import MajorDefensives from '../shared/modules/MajorDefensives/DefensivesGuide';
import { Disintegrate } from './modules/guide/DisintegrateSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IntroSection />
      <CoreSection modules={modules} info={info} events={events} />
      <CooldownSection modules={modules} info={info} events={events} />
      <DragonRageSection modules={modules} info={info} events={events} />
      <Disintegrate modules={modules} info={info} events={events}></Disintegrate>
      <DamageEfficiency modules={modules} info={info} events={events} />
      <CoreRotation />
      <MajorDefensives />
      <PreparationSection />
    </>
  );
}
