import { change, date } from 'common/changelog';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { Seriousnes } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [  
  change(date(2026, 2, 3), <>Updating <SpellLink spell={TALENTS_SHAMAN.STORMKEEPER_TALENT} /> sources of CDR</>, Seriousnes),
  change(date(2025, 12, 17), <>Updated for Midnight</>, Seriousnes)
];
