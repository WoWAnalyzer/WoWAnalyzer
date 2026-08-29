import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Sharrq } from 'CONTRIBUTORS';

const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />
const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />
const arcaneOrb = <SpellLink spell={TALENTS.ARCANE_ORB_TALENT} />
const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />
const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />
const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />
const arcaneSalvo = <SpellLink spell={TALENTS.ARCANE_SALVO_TALENT} />
const presenceOfMind = <SpellLink spell={TALENTS.PRESENCE_OF_MIND_TALENT} />
const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />
const prismaticBolt = <SpellLink spell={SPELLS.PRISMATIC_BOLT} />
const cumulativePower = <SpellLink spell={SPELLS.CUMULATIVE_POWER_BUFF} />;

export default [
  change(date(2026, 8, 29), <>Fixed the logic that determined how many targets {arcaneOrb} hit.</>, Sharrq),
  change(date(2026, 8, 29), <>Fixed {prismaticBolt}, again. It now correctly identifies munched procs that were actually munched.</>, Sharrq),
  change(date(2026, 8, 26), <>Removed guidance about holding {arcaneBarrage} if {touchOfTheMagi} is coming soon.</>, Sharrq),
  change(date(2026, 8, 26), <>Fixed a tooltip on {prismaticBolt} that listed targets hit instead of {cumulativePower} stacks.</>, Sharrq),
  change(date(2026, 8, 22), <>Adjusted {arcaneOrb} conditions for Sunfury to mark casts with without 4 Arcane Charges as good.</>, Sharrq),
  change(date(2026, 8, 22), <>Added {prismaticBolt} to the ability spellbook.</>, Sharrq),
  change(date(2026, 8, 22), <>Update {prismaticBolt} logic to be cleaner and to check for munched procs.</>, Sharrq),
  change(date(2026, 8, 15), <>Updated spec compatability to 12.1.</>, Sharrq),
  change(date(2026, 8, 15), <>Added support for {prismaticBolt}.</>, Sharrq),
  change(date(2026, 8, 15), <>Replaced the Arcane Mana Management chart with a new heatmap visualization.</>, Sharrq),
  change(date(2026, 8, 15), <>Updated the {arcaneBarrage}, {arcaneMissiles}, {arcaneOrb}, {arcaneSurge}, and {touchOfTheMagi} conditions for 12.1.</>, Sharrq),
  change(date(2026, 4, 26), <>Removed {arcaneCharge}s check from {touchOfTheMagi} for Spellslinger.</>, Sharrq),
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
