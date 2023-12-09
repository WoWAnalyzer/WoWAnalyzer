import { change, date } from 'common/changelog';
import { jazminite } from 'CONTRIBUTORS';

export default [
  change(date(2023, 12, 5), 'Add Shadow Trance and Eradication buffs', jazminite),
  change(date(2023, 4, 2), 'Remove static entries for Healthstone use in favor of HealthstoneChecker.', jazminite),
  change(date(2022, 12, 30), 'Add trinkets to Buffs for timeline highlight.', jazminite),
  change(date(2022, 11, 14), 'Add channeling spells to improve downtime detection.', jazminite),
  change(date(2022, 11, 13), 'Separate out Classic Affliction Warlock.', jazminite),
];
