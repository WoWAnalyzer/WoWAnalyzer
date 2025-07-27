import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS/classic';
import { emallson } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2024, 7, 27), <>Added support for Will of the Necropolis.</>, emallson),
  change(date(2025, 7, 27), 'Added basic support for Mists', emallson),
];
