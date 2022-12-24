import { change, date } from 'common/changelog';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/demonhunter';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS/demonhunter';

// prettier-ignore
export default [
  change(date(2022, 12, 7), 'Fix cast breakdowns showing "[object Object]" in summary.', ToppleTheNun),
  change(date(2022, 12, 5), 'Make time spent capped on fury more visible.', ToppleTheNun),
  change(date(2022, 12, 5), <>Hide <SpellLink id={TALENTS.THE_HUNT_TALENT} /> statistic when it hasn't been casted.</>, ToppleTheNun),
  change(date(2022, 12, 4), <>Stop treating <SpellLink id={SPELLS.THE_HUNT_CHARGE}/> as a castable ability.</>, ToppleTheNun),
  change(date(2022, 11, 26), 'Improve talent checking in checklist.', ToppleTheNun),
  change(date(2022, 11, 21), <>Correctly handle <SpellLink id={TALENTS.THE_HUNT_TALENT} /> pre-casts.</>, ToppleTheNun),
];
