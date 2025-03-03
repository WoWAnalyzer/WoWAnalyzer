import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Durpn, emallson } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2025, 2, 6), <>Correct spell data for <SpellLink spell={SPELLS.FORTIFYING_BREW_CAST} /></>, emallson),
  change(date(2024, 10, 26), <>Drop Mastery tracking for <SpellLink spell={SPELLS.FLYING_SERPENT_KICK} /></>, Durpn),
  change(date(2024, 10, 26), <>Fix Mastery tracking for <SpellLink spell={TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT} /> and <SpellLink spell={TALENTS_MONK.STORM_EARTH_AND_FIRE_TALENT} /></>, Durpn),
  change(date(2024, 9, 15), <>Initial Update for The War Within</>, Durpn),
];
