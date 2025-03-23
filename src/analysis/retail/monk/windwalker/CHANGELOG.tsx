import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Durpn, emallson } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2025, 3, 21), <>Add <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_TALENT} /> clip analysis</>, Durpn),
  change(date(2025, 3, 21), <>Add <SpellLink spell={TALENTS_MONK.LAST_EMPERORS_CAPACITOR_TALENT} /> tracking</>, Durpn),
  change(date(2025, 3, 20), <>Update cooldowns of <SpellLink spell={TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT} /> and <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} /> based on talents</>, Durpn),
  change(date(2025, 3, 9), <>Update Season 2 APL</>, Durpn),
  change(date(2025, 3, 3), <>Add <SpellLink spell={SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF} /> tracking</>, Durpn),
  change(date(2025, 2, 6), <>Correct spell data for <SpellLink spell={SPELLS.FORTIFYING_BREW_CAST} /></>, emallson),
  change(date(2024, 10, 26), <>Drop Mastery tracking for <SpellLink spell={SPELLS.FLYING_SERPENT_KICK} /></>, Durpn),
  change(date(2024, 10, 26), <>Fix Mastery tracking for <SpellLink spell={TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT} /> and <SpellLink spell={TALENTS_MONK.STORM_EARTH_AND_FIRE_TALENT} /></>, Durpn),
  change(date(2024, 9, 15), <>Initial Update for The War Within</>, Durpn),
];
