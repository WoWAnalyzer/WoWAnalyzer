import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { Durpn, Hursti } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 1, 15), <>Clean up Changelog and Include <SpellLink id={talents.INNER_PEACE_TALENT.id} /> to the Energycap</>, Hursti),
  change(date(2022, 1, 14), <>Initial Update for Dragonflight</>, Durpn),
];
