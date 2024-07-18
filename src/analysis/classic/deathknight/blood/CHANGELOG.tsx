import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS/classic';
import { emallson } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2024, 7, 5), <>Fixed <SpellLink spell={SPELLS.ARMY_OF_THE_DEAD} /> pre-pull cast detection.</>, emallson),
  change(date(2024, 6, 17), 'Added basic ability list for Cataclysm', emallson),
];
