import { change, date } from 'common/changelog';
import { Harrek, Texleretour } from 'CONTRIBUTORS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2026, 3, 26), <>Updated guide, added <SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT} /> and <SpellLink spell={TALENTS.HEALING_STREAM_TOTEM_RESTORATION_TALENT} /> modules</>, Harrek),
  change(date(2026, 3, 20), "Updates for raid launch", Texleretour),
  change(date(2026, 1, 11), <>Initial support for 12.0</>, Harrek)
];
