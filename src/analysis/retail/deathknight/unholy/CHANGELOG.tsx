import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS/deathknight';
import { AlexanderJKremer, Khazak } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 1, 24), `Added ${<SpellLink id={SPELLS.T29_GHOULISH_INFUSION}/>}'s haste buff`, Khazak),
  change(date(2022, 12, 19), 'Initial Dragonflight version', AlexanderJKremer),
];
