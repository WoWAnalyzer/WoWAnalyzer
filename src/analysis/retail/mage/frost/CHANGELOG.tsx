import { change, date } from 'common/changelog';
import { Sharrq, Earosselot, Dambroda, KushGene } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2026, 7, 25), <>Bumped patch compatibility to 12.0.7. No spell changes were needed for Frost Mage this patch.</>, KushGene),
  change(date(2026, 3, 29), <>Updated feedback for Ice Lance and Flurry usage. Added Glaciate and Spellfrost Teachings CDR statistics.</>, Dambroda),
  change(date(2026, 3, 6), <>Removed myself as a maintainer.</>, Sharrq),
  change(date(2026, 2, 22), <>Ray of Frost update.</>, Earosselot),
  change(date(2026, 1, 20), <>Delete Winter's Chill.</>, Earosselot),
  change(date(2025, 11, 22), <>Enable Frost Mage for Midnight.</>, Sharrq),
];
