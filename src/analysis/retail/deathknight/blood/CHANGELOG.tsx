import { change, date } from 'common/changelog';
import talents from 'common/TALENTS/deathknight';
import { Tialyss, Chizu, emallson } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2023, 4, 1), <>First stab at <SpellLink id={talents.DEATH_STRIKE_TALENT} /> guide section.</>, emallson),
  change(date(2022, 10, 21), 'Initial Dragonflight version', Tialyss),
  change(date(2022, 8, 21), 'Rewrote all modules to Typescript', Chizu),
];
