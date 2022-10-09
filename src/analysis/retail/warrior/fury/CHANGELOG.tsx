import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import { Adoraci, Abelito75, Tyndi, AndreasAlbert, Listefano } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 10, 1), 'Dragonflight initial cleanup', Listefano),
  change(date(2022, 7, 17), <>Fixed suggestion text for Signet of Tormented Kings legendary to suggest the proper ability.</>, Tyndi),
  change(date(2022, 4, 7), <>Fixed suggestion text for <SpellLink id={SPELLS.WHIRLWIND_FURY_CAST.id} /> </>, AndreasAlbert),
  change(date(2022, 3, 30), <>Added tracking for <SpellLink id={SPELLS.NATURES_FURY.id} /> and <SpellLink id={SPELLS.SPEAR_OF_BASTION.id} /></>, Tyndi),
  change(date(2022, 3, 26), <>Added support for <SpellLink id={SPELLS.SIGNET_OF_TORMENTED_KINGS.id} /> and <SpellLink id={SPELLS.MERCILESS_BONEGRINDER.id} /></>, Tyndi),
  change(date(2022, 3, 12), 'Updated Raging Blow for 2 piece tier set bonus', Tyndi),
  change(date(2022, 3, 8), 'Added Condemn for Venthyr', Tyndi),
  change(date(2020, 12, 17), 'Added some shadowlandisms.', Abelito75),
  change(date(2020, 12, 17), 'Removed all BFAisms.', Abelito75),
  change(date(2020, 12, 14), <>Fixed rage tracker.</>, Abelito75),
  change(date(2020, 10, 15), <>Fix <SpellLink id={talents.WARPAINT_TALENT.id} /> not calculating properly.</>, Adoraci),
  change(date(2020, 10, 12), <>Updated specialization to TypeScript</>, Adoraci),
];
