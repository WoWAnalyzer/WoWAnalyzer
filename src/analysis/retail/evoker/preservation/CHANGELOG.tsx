import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { Harrek } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2026, 4, 23), <>Update <SpellLink spell={TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT} /> module, implement <SpellLink spell={TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT} /> analysis.</>, Harrek),
  change(date(2026, 4, 3), <>Update <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} /> analysis.</>, Harrek),
  change(date(2026, 3, 20), <>Initial Midnight support</>, Harrek),
];
