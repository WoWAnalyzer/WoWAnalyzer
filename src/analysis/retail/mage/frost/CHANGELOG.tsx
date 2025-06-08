import { change, date } from 'common/changelog';
import { SpellLink } from 'interface';
import { Sharrq, Earosselot, Soulhealer95, Vollmer, Brigadoon } from 'CONTRIBUTORS';
import TALENTS from 'common/TALENTS/mage';

// prettier-ignore
export default [
  change(date(2025, 6, 7), <>Update Patch Compatibility Version</>, Brigadoon),
  change(date(2025, 4, 21), <>Update example log.</>, Vollmer),
  change(date(2025, 4, 20), <>Added Defensives to Guide</>, Earosselot),
  change(date(2025, 4, 11), <>Fixed <SpellLink spell={TALENTS.GLACIAL_SPIKE_TALENT} /> shattered evaluation</>, Earosselot),
  change(date(2025, 3, 18), <> Frostfire APL: Updated to new simplified 11.1</>, Earosselot),
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
