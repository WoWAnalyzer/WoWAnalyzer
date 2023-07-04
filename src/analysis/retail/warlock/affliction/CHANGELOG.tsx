import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { Arlie, Jonfanz, Meldris, ToppleTheNun, dodse } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 6, 29), "Updated ABOUT with current guide links", Meldris),
  change(date(2023, 3, 9), "Update Soul Conduit to take into account being a 2 rank talent and different scaling", dodse),
  change(date(2023, 3, 9), 'Update Vile Taint to track the right debuff id and rework hit tracking', dodse),
  change(date(2023, 3, 9), 'Add statistics for Pandemic Invocation, Inevitable Demise, Malefic Affliction and Wrath of Consumption', dodse),
  change(date(2023, 3, 9), 'Update Darkglare, Nightfall, Shadow Embrace for Dragonflight changes', dodse),
  change(date(2022, 11, 10), <>Fix <SpellLink id={TALENTS.DRAIN_SOUL_TALENT.id} /> not showing as intended and add <SpellLink id={SPELLS.IMP_SINGE_MAGIC} />.</>, Arlie),
  change(date(2022, 11, 9), 'Remove Shadowlands covenant abilities from checklist.', ToppleTheNun),
  change(date(2022, 10, 20), <>Fix <SpellLink id={TALENTS.DRAIN_SOUL_TALENT.id} /> damage calculations and add initial support for <SpellLink id={TALENTS.DREAD_TOUCH_TALENT.id} />.</>, Jonfanz),
  change(date(2022, 10, 14), 'Begin working on support for Dragonflight.', Jonfanz),
];
