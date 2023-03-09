import { GuideProps, Section, SubSection } from 'interface/guide';

import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import Expansion from 'game/Expansion';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      { console.log(modules, events, info) }
      <Section title="Healing Cooldowns">
        <PreparationSection expansion={Expansion.WrathOfTheLichKing} />
      </Section>
    </>
  );
}
