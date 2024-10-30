import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Rzial } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2024, 10, 28), <>Added The War Within Season 1 2-pieces tier set effect <SpellLink spell={SPELLS.EXPERT_STRATEGIST_BUFF}/> as <SpellLink spell={SPELLS.SHIELD_SLAM} /> reset tracker.</>, Rzial),
  change(date(2024, 10, 24), 'Initial Update for The War Within.', Rzial),
];
