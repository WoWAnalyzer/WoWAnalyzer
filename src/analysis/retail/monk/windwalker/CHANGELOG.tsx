import { change, date } from 'common/changelog';
import talents from 'common/TALENTS/monk';
import { Durpn, Hursti, Tenooki } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 5, 3), <>Fixes to cooldown tracking on various abilities</>, Tenooki),
  change(date(2023, 5, 2), <>Fixed a bug in WW reports with Chi Wave talented</>, Tenooki),
  change(date(2023, 2, 13), <>Initial APL Added</>, Durpn),
  change(date(2022, 1, 15), <>Clean up Changelog and Include <SpellLink id={talents.INNER_PEACE_TALENT.id} /> to the Energycap</>, Hursti),
  change(date(2022, 1, 14), <>Initial Update for Dragonflight</>, Durpn),
];
