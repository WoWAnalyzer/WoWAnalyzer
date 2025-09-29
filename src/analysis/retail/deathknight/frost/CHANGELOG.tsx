import { change, date } from 'common/changelog';
import { TALENTS_DEATH_KNIGHT } from 'common/TALENTS';
import { Arlie, Boohbah, Khazak } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2025, 9, 29), <>Updated cooldown and CDR of <SpellLink spell={TALENTS_DEATH_KNIGHT.ANTI_MAGIC_ZONE_TALENT} />.</>, Arlie),
  change(date(2024, 10, 31), 'Update Deathbringer talent data for 11.0.5', Khazak),
  change(date(2024, 10, 8), 'Fix outdated analysys and bugs to complete the transition from Dragonflight to The War Within', Khazak),
  change(date(2024, 9, 21), 'Updates for 11.0.2: General bug fixes and tweaks to ensure spec matches live - Boohbah', Boohbah),
];
