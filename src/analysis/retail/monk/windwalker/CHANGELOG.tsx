import { change, date } from 'common/changelog';
import { TALENTS_MONK } from 'common/TALENTS';
import { Durpn } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2024, 10, 16), <>Fix Mastery tracking for <SpellLink spell={TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT} /> and <SpellLink spell={TALENTS_MONK.STORM_EARTH_AND_FIRE_TALENT} /></>, Durpn),
  change(date(2024, 9, 15), <>Initial Update for The War Within</>, Durpn),
];
