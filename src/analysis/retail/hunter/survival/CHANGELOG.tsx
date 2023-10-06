import { change, date } from 'common/changelog';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { Putro, Arlie, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 10, 3), 'Remove old references to Chakrams', Putro),
  change(date(2023, 9, 25), <>Fix issues with registering <SpellLink spell={TALENTS_HUNTER.COORDINATED_ASSAULT_TALENT} /> casts.</>, Putro),
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2022, 12, 16), 'Re-enable log parser.', ToppleTheNun),
  change(date(2022, 11, 11), 'Initial transition of Survival to Dragonflight', [Arlie, Putro]),
];
