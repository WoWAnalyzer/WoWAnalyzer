import { change, date } from 'common/changelog';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/demonhunter';
import { ToppleTheNun } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2022, 11, 26), 'Improve talent checking in checklist.', ToppleTheNun),
  change(date(2022, 11, 21), <>Correctly handle <SpellLink id={TALENTS.THE_HUNT_TALENT} /> pre-casts.</>, ToppleTheNun),
];
