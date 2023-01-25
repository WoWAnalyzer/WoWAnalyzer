import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS/deathknight';
import { AlexanderJKremer, Bicepspump, Khazak } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 1, 24), `Added ${<SpellLink id={SPELLS.T29_GHOULISH_INFUSION}/>}'s haste buff`, Khazak),
  change(date(2023, 1, 18), 'Added Plaguebringer Tracker', Bicepspump),
  change(date(2023, 1, 17), 'Added module for tracking Summon Gargoyle Empowerment', Bicepspump),
  change(date(2023, 1, 16), 'Updated Cooldowns to have proper Cooldown', Bicepspump),
  change(date(2022, 12, 19), 'Initial Dragonflight version', AlexanderJKremer),
];
