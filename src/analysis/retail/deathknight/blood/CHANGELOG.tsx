import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { Arlie, Badkad, emallson, Gazh } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2026, 9, 3), <>Fixed <SpellLink spell={talents.RAISE_DEAD_TALENT} /> cooldown</>, Badkad),

  change(date(2026, 8, 29), <>Added <SpellLink spell={talents.VISCERAL_STRENGTH_TALENT} /> tracking</>, Gazh),
  change(date(2026, 8, 28), <>Added <SpellLink spell={SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF} /> tracking</>, Gazh),
  change(date(2026, 8, 27), <>Added basic 12.1 support and <SpellLink spell={talents.ABOMINATION_LIMB_TALENT}></SpellLink> tracking</>, Badkad),
  change(date(2026, 4, 24), <>Added <SpellLink spell={talents.UMBILICUS_ETERNUS_TALENT}/> to timeline .</>, Badkad),
  change(date(2026, 4, 10), <>Enabled Changelog.</>, Badkad),
  change(date(2026, 4, 5), <>Updated cooldown of <SpellLink spell={talents.DANCING_RUNE_WEAPON_TALENT} />.</>, Badkad),
  change(date(2026, 4, 1), "Added basic support for Midnight", Badkad),
  change(date(2025, 9, 29), <>Updated cooldown and CDR of <SpellLink spell={talents.ANTI_MAGIC_ZONE_TALENT} />.</>, Arlie),
  change(date(2024, 11, 20), <>Add basic support for San'layn abilities.</>, emallson),
  change(date(2024, 10, 5), <>Added warning about repeated <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> casts.</>, emallson),
  change(date(2024, 10, 5), <>Removed Dragonflight rotational analysis.</>, emallson),
  change(date(2024, 10, 5), <>Fixed handling of <SpellLink spell={talents.EXTERMINATE_TALENT} /> cost reduction and Deathbringer cooldown reduction effects.</>, emallson),
  change(date(2024, 8, 12), <>Fixed crash when <SpellLink spell={talents.RAPID_DECOMPOSITION_TALENT} /> was not selected.</>, emallson),
  change(date(2024, 7, 28), 'Basic updates for The War Within', emallson),
];
