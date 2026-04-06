import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Harrek } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2026, 4, 3), <>Update <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} /> analysis.</>, Harrek),
  change(date(2026, 3, 20), <>Initial Midnight support</>, Harrek),
];
