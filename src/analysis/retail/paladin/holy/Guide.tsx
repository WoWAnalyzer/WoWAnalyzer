import { GuideProps, Section } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from 'analysis/retail/paladin/holy/CombatLogParser';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells and Buffs"></Section>
      <Section title="Healing Cooldowns"></Section>
      <Section title="Core Rotation"></Section>
      <Section title="Other cooldowns, buffs, and procs"></Section>
      <PreparationSection />
    </>
  );
}
