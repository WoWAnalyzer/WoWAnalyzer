import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Sharrq } from 'CONTRIBUTORS';

const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />
const arcaneOrb = <SpellLink spell={TALENTS.ARCANE_ORB_TALENT} />
const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />
const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />
const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />
const arcaneSalvo = <SpellLink spell={TALENTS.ARCANE_SALVO_TALENT} />
const presenceOfMind = <SpellLink spell={TALENTS.PRESENCE_OF_MIND_TALENT} />
const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />

export default [
  change(date(2026, 4, 21), <>Updated Spec Compatability to 12.0.5.</>, Sharrq),
  change(date(2026, 4, 4), <>Updated Spec Compatability to 12.0.1.</>, Sharrq),
  change(date(2026, 4, 4), <>Removed {clearcasting} expiration and overcap checks.</>, Sharrq),
  change(date(2026, 4, 4), <>Updated {arcaneBarrage}, {arcaneOrb}, {arcaneMissiles}, {touchOfTheMagi}, {arcaneSurge}, and {presenceOfMind} to support the Spellslinger Missiles, Spellslinger Orbs, and Sunfury builds and rotations.</>, Sharrq),
  change(date(2026, 2, 5), <>Adjusted {arcaneOrb} performance metrics.</>, Sharrq),
  change(date(2026, 1, 23), <>Adjusted {arcaneMissiles} to include overcaped {arcaneSalvo} stacks.</>, Sharrq),
  change(date(2026, 1, 22), <>Adjusted {arcaneBarrage} to accomodate the updated Sunfury and Spellslinger conditions.</>, Sharrq),
  change(date(2026, 1, 8), <>Rework {arcaneBarrage}, {arcaneOrb}, {touchOfTheMagi}, {arcaneSurge}.</>, Sharrq),
  change(date(2025, 11, 22), <>Enable Arcane Mage for Midnight.</>, Sharrq),
  change(date(2025, 10, 21), <>Redesign Arcane Mage Code Structure.</>, Sharrq),
  change(date(2025, 10, 8), <>Remove Arcane Bombardment, Intuition, Arcane Harmony, Nether Precision, and various class spells.</>, Sharrq),
  change(date(2025, 10, 8), <>Completely Redesign Arcane Mage Analysis, Guide, Charts, etc.</>, Sharrq),
];
