import { change, date } from 'common/changelog';
import talents from 'common/TALENTS/deathknight';
import { Khazak } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 3, 24), `Improved ${<SpellLink id={talents.RIME_TALENT.id} />} and ${<SpellLink id={talents.KILLING_MACHINE_TALENT.id} />} stats`, Khazak),
  change(date(2022, 3, 21), 'Update for 10.0.7', Khazak),
  change(date(2022, 2, 17), 'Added basic Guide view', Khazak),
  change(date(2022, 11, 1), 'Published basic guide with info on procs, resources, and cooldowns', Khazak),
  change(date(2022, 10, 17), 'Add support for Dragonflight analysis', Khazak),
];
