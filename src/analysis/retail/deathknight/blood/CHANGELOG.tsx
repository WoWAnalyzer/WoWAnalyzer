import { change, date } from 'common/changelog';
import talents from 'common/TALENTS/deathknight';
import { emallson } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2024, 8, 12), <>Fix crash when <SpellLink spell={talents.RAPID_DECOMPOSITION_TALENT} /> was not selected.</>, emallson),
  change(date(2024, 7, 28), 'Basic updates for The War Within', emallson),
];
