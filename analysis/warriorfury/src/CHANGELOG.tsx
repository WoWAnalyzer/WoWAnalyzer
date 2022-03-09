import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Adoraci, Abelito75, Tyndi } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 3, 8), 'Added Condemn for Venthyr', Tyndi),
  change(date(2020, 12, 17), 'Added some shadowlandisms.', Abelito75),
  change(date(2020, 12, 17), 'Removed all BFAisms.', Abelito75),
  change(date(2020, 12, 14), <>Fixed rage tracker.</>, Abelito75),
  change(date(2020, 10, 15), <>Fix <SpellLink id={SPELLS.WARPAINT_TALENT.id} /> not calculating properly.</>, Adoraci),
  change(date(2020, 10, 12), <>Updated specialization to TypeScript</>, Adoraci),
];
