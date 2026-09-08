import { change, date } from 'common/changelog';
import { TALENTS_PALADIN } from 'common/TALENTS';
import { Texleretour } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2026, 9, 3), <>Add <SpellLink spell={TALENTS_PALADIN.ART_OF_WAR_TALENT} /> guide section</>, Texleretour),
  change(date(2026, 4, 28), 'Timeline updates', Texleretour),
  change(date(2026, 4, 6), 'Statistics update', Texleretour),
  change(date(2026, 1, 27), 'Initial Midnight support', Texleretour),
];
