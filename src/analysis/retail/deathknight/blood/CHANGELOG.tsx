import { change, date } from 'common/changelog';
import talents from 'common/TALENTS/deathknight';
import { Tialyss, Chizu, emallson, ToppleTheNun, Yajinni } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2023, 8, 11), <><SpellLink spell={talents.RUNE_TAP_TALENT} /> Updated it to show cast efficiency only if the talent was taken.</>,Yajinni),
  change(date(2023, 6, 19), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 4, 8), <><SpellLink spell={talents.DEATH_STRIKE_TALENT} /> casts while not tanking within the next 6 seconds now count as dumping RP.</>, emallson),
  change(date(2023, 4, 8), <><SpellLink spell={talents.DEATH_STRIKE_TALENT} /> problems are now ordered by amount of damage taken.</>, emallson),
  change(date(2023, 4, 1), <>First stab at <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> guide section.</>, emallson),
  change(date(2022, 10, 21), 'Initial Dragonflight version', Tialyss),
  change(date(2022, 8, 21), 'Rewrote all modules to Typescript', Chizu),
];
