import { change, date } from 'common/changelog';
import { emallson, jazminite } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import CLASSIC_SPELLS from 'common/SPELLS/classic';

// prettier-ignore
export default [
  change(date(2024, 8, 9), <>Correct some GCD / Channeling issues with <SpellLink spell={CLASSIC_SPELLS.ARCANE_MISSILES} /> and <SpellLink spell={CLASSIC_SPELLS.ARCANE_EXPLOSION} /></>, emallson),
  change(date(2024, 7, 23), 'Add foundation guide for Cata Classic Mage Arcane spec.', jazminite),
];
