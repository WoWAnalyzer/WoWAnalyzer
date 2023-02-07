import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS/deathknight';
import { AlexanderJKremer, Bicepspump, Khazak } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 1, 27), 'Added tracker for Vile Infusion', Bicepspump),
  change(date(2023, 1, 24), `Added ${<SpellLink id={SPELLS.T29_GHOULISH_INFUSION.id}/>}'s haste buff`, Khazak),
  change(date(2023, 1, 18), 'Added Commander of the Dead Tracker', Bicepspump),
  change(date(2023, 1, 18), 'Moved from partial to full support', Bicepspump),
  change(date(2023, 1, 18), 'Added Plaguebringer Tracker', Bicepspump),
  change(date(2023, 1, 17), 'Added module for tracking Summon Gargoyle Empowerment', Bicepspump),
  change(date(2023, 1, 16), 'Updated Cooldowns to have proper Cooldown', Bicepspump),
  change(date(2022, 12, 19), 'Initial Dragonflight version', AlexanderJKremer),
];
