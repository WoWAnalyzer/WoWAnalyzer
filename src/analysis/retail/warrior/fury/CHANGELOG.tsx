import { change, date } from 'common/changelog';
import { Listefano, CodersKitchen, ToppleTheNun, Ahri, nullDozzer } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/warrior';

export default [
  change(date(2023, 8, 24), 'Massive rewrite to support fury warrior', nullDozzer),
  change(date(2023, 7, 23), <>Normalize extra casts from <SpellLink spell={TALENTS.BERSERKERS_TORMENT_TALENT}/>.</>, ToppleTheNun),
  change(date(2023, 7, 22), 'Update default Fury Warrior log.', Ahri),
  change(date(2023, 7, 8), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 6, 25), 'Reduce CD of Raging Blow, when Honed Reflexes is skilled.', CodersKitchen),
  change(date(2022, 10, 1), 'Dragonflight initial cleanup', Listefano),
];
