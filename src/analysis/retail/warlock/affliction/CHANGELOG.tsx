import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { Arlie, Jonfanz, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 11, 10), <>Fix <SpellLink id={TALENTS.DRAIN_SOUL_TALENT.id} /> not showing as intended and add <SpellLink id={SPELLS.IMP_SINGE_MAGIC} />.</>, Arlie),
  change(date(2022, 11, 9), 'Remove Shadowlands covenant abilities from checklist.', ToppleTheNun),
  change(date(2022, 10, 20), <>Fix <SpellLink id={TALENTS.DRAIN_SOUL_TALENT.id} /> damage calculations and add initial support for <SpellLink id={TALENTS.DREAD_TOUCH_TALENT.id} />.</>, Jonfanz),
  change(date(2022, 10, 14), 'Begin working on support for Dragonflight.', Jonfanz),
];
