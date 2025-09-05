import { change, date } from 'common/changelog';
import { TALENTS_PALADIN } from 'common/TALENTS';
import { Texleretour, Vetyst } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2025, 9, 4), <>Add ability/melee uptime graph and add/fix a few stats</>, Texleretour),
  change(date(2025, 8, 22), <>Add {<SpellLink spell={TALENTS_PALADIN.WAKE_OF_ASHES_TALENT} />} cast analysis.</>, Texleretour),
  change(date(2025, 8, 22), 'Add Expurgation uptime bar and add Divine Hammer to the Cooldown Graph', Texleretour),
  change(date(2025, 8, 4), 'Few bugfixes and old modules cleaning', Texleretour),
  change(date(2025, 6, 9), 'Basic 11.1.5 support', Vetyst),
];
