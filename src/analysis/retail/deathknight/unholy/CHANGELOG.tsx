import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import { AlexanderJKremer, Bicepspump, Khazak, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 6, 19), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 3, 3), `Updated suggestion text for ${<SpellLink spell={TALENTS.COMMANDER_OF_THE_DEAD_TALENT}/>}`, Khazak),
  change(date(2023, 2, 7), 'Fixed multiple SpellUsable errors', Khazak),
  change(date(2023, 1, 27), 'Added tracker for Vile Infusion', Bicepspump),
  change(date(2023, 1, 24), `Added ${<SpellLink spell={SPELLS.T29_GHOULISH_INFUSION}/>}'s haste buff`, Khazak),
  change(date(2023, 1, 18), 'Added Commander of the Dead Tracker', Bicepspump),
  change(date(2023, 1, 18), 'Moved from partial to full support', Bicepspump),
  change(date(2023, 1, 18), 'Added Plaguebringer Tracker', Bicepspump),
  change(date(2023, 1, 17), 'Added module for tracking Summon Gargoyle Empowerment', Bicepspump),
  change(date(2023, 1, 16), 'Updated Cooldowns to have proper Cooldown', Bicepspump),
  change(date(2022, 12, 19), 'Initial Dragonflight version', AlexanderJKremer),
];
