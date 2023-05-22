import { change, date } from 'common/changelog';
import { jazminite } from 'CONTRIBUTORS';

export default [
  change(date(2023, 5, 7), 'Updates to Guide Core section + added Spells subsection.', jazminite),
  change(date(2023, 4, 23), 'Started Guide and added Core and Preparation sections.', jazminite),
  change(date(2023, 4, 2), 'Remove static entries for Healthstone use in favor of HealthstoneChecker.', jazminite),
  change(date(2022, 2, 24), 'Add Molten Core buff to timeline + GCD reduction. Track Shadow Mastery debuff uptime.', jazminite),
  change(date(2022, 12, 30), 'Add trinkets to Buffs for timeline highlight.', jazminite),
  change(date(2022, 11, 21), 'Update example report and set partial to false.', jazminite),
  change(date(2022, 11, 21), 'Add first draft of Classic Demonology Warlock spec.', jazminite),
];
