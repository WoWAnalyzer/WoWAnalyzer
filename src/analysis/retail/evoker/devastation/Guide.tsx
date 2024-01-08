import CombatLogParser from './CombatLogParser';
import { GuideProps } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { CooldownSection } from './modules/guide/Cooldown';
import { CoreRotation } from './modules/guide/CoreRotation';
import { DamageEfficiency } from './modules/guide/DamageEfficiencySection';
import { EssenceGraphSection } from './modules/guide/EssenceGraphSection';
import { DragonRageSection } from './modules/guide/DragonRageSection';
import { IntroSection } from './modules/guide/IntroSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IntroSection />
      <EssenceGraphSection modules={modules} info={info} events={events} />
      <CooldownSection modules={modules} info={info} events={events} />
      <DragonRageSection modules={modules} info={info} events={events} />
      <DamageEfficiency modules={modules} info={info} events={events} />
      <CoreRotation modules={modules} info={info} events={events} />
      <PreparationSection />
    </>
  );
}
