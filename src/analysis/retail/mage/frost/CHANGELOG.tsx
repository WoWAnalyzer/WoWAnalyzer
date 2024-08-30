import { change, date } from 'common/changelog';
import { SpellLink } from 'interface';
import { Earosselot } from 'CONTRIBUTORS';
import TALENTS from 'common/TALENTS/mage';

// prettier-ignore
export default [
  change(date(2024, 8, 25), <>Added support for <SpellLink spell={TALENTS.SPELLFROST_TEACHINGS_TALENT} />.</>, Earosselot),
  change(date(2024, 8, 23), <>Adding APL for Spellslinger Frost.</>, Earosselot),
  change(date(2024, 7, 30), <>Solved bug when not taking <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} />.</>, Earosselot),
  change(date(2024, 7, 30), <>Added Icy Veins to guides on About Section.</>, Earosselot),
  change(date(2024, 7, 30), <>Initial The War Within support</>, Earosselot),
];
