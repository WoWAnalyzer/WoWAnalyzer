import { change, date } from 'common/changelog';
import { SpellLink } from 'interface';
import { Sharrq, Earosselot, Soulhealer95 } from 'CONTRIBUTORS';
import TALENTS from 'common/TALENTS/mage';

// prettier-ignore
export default [
  change(date(2025, 2, 27), <>Apls: Updated for Spell Slinger and Frostfire for patch 11.1</>, Earosselot),
  change(date(2024, 11, 22), <>Fixed a typo in the comet storm hit description</>, Soulhealer95),
  change(date(2024, 10, 18), <>Apls: Updated for Spell Slinger and added for Frostfire for patch 11.0.5</>, Earosselot),
  change(date(2024, 10, 17), <>Fixed Frostfire Bolt on Winters Chill module for Frostfire.</>, Earosselot),
  change(date(2024, 9, 18), <>Updated the Warning Banner explaining the current state of Frost Mage.</>, Sharrq),
  change(date(2024, 8, 25), <>Added support for <SpellLink spell={TALENTS.SPELLFROST_TEACHINGS_TALENT} />.</>, Earosselot),
  change(date(2024, 8, 23), <>Adding APL for Spellslinger Frost.</>, Earosselot),
  change(date(2024, 7, 30), <>Solved bug when not taking <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} />.</>, Earosselot),
  change(date(2024, 7, 30), <>Added Icy Veins to guides on About Section.</>, Earosselot),
  change(date(2024, 7, 30), <>Initial The War Within support</>, Earosselot),
];
