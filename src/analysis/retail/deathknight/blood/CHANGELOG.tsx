import { change, date } from 'common/changelog';
import talents from 'common/TALENTS/deathknight';
import { emallson } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2024, 10, 5), <>Added warning about repeated <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> casts.</>, emallson),
  change(date(2024, 10, 5), <>Removed Dragonflight rotational analysis.</>, emallson),
  change(date(2024, 10, 5), <>Fixed handling of <SpellLink spell={talents.EXTERMINATE_TALENT} /> cost reduction and Deathbringer cooldown reduction effects.</>, emallson),
  change(date(2024, 8, 12), <>Fixed crash when <SpellLink spell={talents.RAPID_DECOMPOSITION_TALENT} /> was not selected.</>, emallson),
  change(date(2024, 7, 28), 'Basic updates for The War Within', emallson),
];
