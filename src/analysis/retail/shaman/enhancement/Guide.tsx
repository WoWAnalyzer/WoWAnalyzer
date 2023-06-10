import { GuideProps } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
// import IntroSection from "./modules/guide/IntroSection";
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import MaelstromUsage from './modules/guide/MaelstromUsage';
import Rotation from './modules/guide/Rotation';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      {/* <IntroSection /> */}
      {/* <CooldownSection modules={modules} events={events} info={info} /> */}
      <MaelstromUsage modules={modules} events={events} info={info} />
      <Rotation modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

// function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
//     return (
//         <Section
//             title={t({
//                 id: `${GUIDE_SECTION_PREFIX}.cooldowns.title`,
//                 message: 'Cooldowns'
//             })}
//         >
//         </Section>
//     )
// }
