import { change, date } from 'common/changelog';
import { Zerotorescue } from 'CONTRIBUTORS';

export default [
  change(date(2021, 7, 27), 'The Kill Command cast count now only includes time with the buff up, and enabled the cast efficiency suggestion for Kill Command.', Zerotorescue),
  change(date(2021, 7, 24), 'Add Kill Command buff indicator to timeline.', Zerotorescue),
  change(date(2021, 7, 20), 'Add Go for the Throat statistic.', Zerotorescue),
  change(date(2021, 7, 2), 'Add suggestions when player is casting lower rank spells.', Zerotorescue),
  change(date(2021, 6, 23), 'Show Auto Shots in a separate cast bar in the timeline and add a swing timer indicator.', Zerotorescue),
  change(date(2021, 6, 22), 'Configure abilities and buffs for the timeline.', Zerotorescue),
  change(date(2021, 6, 7), 'Initial setup', Zerotorescue),
];
