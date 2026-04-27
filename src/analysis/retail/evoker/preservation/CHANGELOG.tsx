import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { Harrek, KYZ } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2026, 4, 27), <>Update <SpellLink spell={TALENTS_EVOKER.LEAPING_FLAMES_TALENT} /> modules to include <SpellLink spell={SPELLS.CHRONO_FLAME_CAST} /> damage and healing.</>, KYZ),
  change(date(2026, 4, 23), <>Update <SpellLink spell={TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT} /> module, implement <SpellLink spell={TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT} /> analysis.</>, Harrek),
  change(date(2026, 4, 3), <>Update <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} /> analysis.</>, Harrek),
  change(date(2026, 3, 20), <>Initial Midnight support</>, Harrek),
];
