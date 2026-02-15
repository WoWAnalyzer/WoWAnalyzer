import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Sharrq } from 'CONTRIBUTORS';

export default [
  change(date(2026, 2, 5), <>Adjusted <SpellLink spell={TALENTS.ARCANE_ORB_TALENT} /> performance metrics.</>, Sharrq),
  change(date(2026, 1, 23), <>Adjusted <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} /> to include overcaped <SpellLink spell={TALENTS.ARCANE_SALVO_TALENT} /> stacks.</>, Sharrq),
  change(date(2026, 1, 22), <>Adjusted <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> to accomodate the updated Sunfury and Spellslinger conditions.</>, Sharrq),
  change(date(2026, 1, 8), <>Rework <SpellLink spell={SPELLS.ARCANE_BARRAGE} />, <SpellLink spell={SPELLS.ARCANE_ORB} />, <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />, <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />.</>, Sharrq),
  change(date(2025, 11, 22), <>Enable Arcane Mage for Midnight.</>, Sharrq),
  change(date(2025, 10, 21), <>Redesign Arcane Mage Code Structure.</>, Sharrq),
  change(date(2025, 10, 8), <>Remove Arcane Bombardment, Intuition, Arcane Harmony, Nether Precision, and various class spells.</>, Sharrq),
  change(date(2025, 10, 8), <>Completely Redesign Arcane Mage Analysis, Guide, Charts, etc.</>, Sharrq),
];
