import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 6, 19), <>Widened <SpellLink id={SPELLS.CONVOKE_SPIRITS.id}/> statistic for better viewing, and added per-cast damage number.</>, Sref),
];
