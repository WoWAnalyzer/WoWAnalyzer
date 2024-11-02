import { change, date } from 'common/changelog';
import { emallson } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2024, 11, 2), 'Added compensation for unavoidable rotational downtime to Active Time estimation', emallson),
  change(date(2024, 11, 2), 'Adjust GCDs for Arms Warrior to ignore Haste', emallson),
  change(date(2024, 8, 8), 'Adjust active time section of the Arms Warrior guide', emallson),
  change(date(2024, 8, 4), 'Added foundational support for Arms Warrior', emallson),
];
