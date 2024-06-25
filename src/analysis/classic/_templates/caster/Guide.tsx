import { GuideProps, Section } from 'interface/guide';
import { CLASSIC_EXPANSION } from 'game/Expansion';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core" />
      {/* For Spells, DoTs, Debuffs, Procs, Curses, etc */}

      <Section title="Cooldowns" />

      <Section title="Resource Use" />
      {/* For Mana, Energy, Combo Points, Rage, etc */}

      <PreparationSection expansion={CLASSIC_EXPANSION} />
      {/* This shows Enchants and Consumables */}
    </>
  );
}
