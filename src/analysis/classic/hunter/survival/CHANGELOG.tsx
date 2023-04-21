import { change, date } from 'common/changelog';
import { Zerotorescue, bdfreeman1421 } from 'CONTRIBUTORS';

export default [
  change(date(2023, 3, 3), 'Cleanup from Marksman changes to add shared files', bdfreeman1421),
  change(date(2023, 2, 22), 'Initial WOTLK Classic Support for Survival', bdfreeman1421),
  change(date(2022, 6, 6), 'Removed myself as maintainer since I quit some time ago.', Zerotorescue),
  change(date(2021, 9, 30), 'Added Distracting Shot and Berserking Haste tracking.', Zerotorescue),
  change(date(2021, 8, 15), 'Cleaned up info, disclaimers and about spec.', Zerotorescue),
  change(date(2021, 8, 15), 'Removed "partial" label.', Zerotorescue),
  change(date(2021, 8, 15), 'Add current attack speed to swing cooldown tooltip in the timeline.', Zerotorescue),
  change(date(2021, 8, 2), 'Add mana graph to statistics.', Zerotorescue),
  change(date(2021, 7, 30), 'Move Kill Command castable indicator to the Kill Command cooldown bar in the timeline.', Zerotorescue),
  change(date(2021, 7, 29), 'Fix bug where Auto Shot cast time overlapping with the GCD counted twice for active time.', Zerotorescue),
  change(date(2021, 7, 27), 'Add low rank pet ability suggestions.', Zerotorescue),
  change(date(2021, 7, 27), 'The Kill Command cast count now only includes time with the buff up, and enabled the cast efficiency suggestion for Kill Command.', Zerotorescue),
  change(date(2021, 7, 24), 'Add Kill Command buff indicator to timeline.', Zerotorescue),
  change(date(2021, 7, 20), 'Add Go for the Throat statistic.', Zerotorescue),
  change(date(2021, 7, 2), 'Add suggestions when player is casting lower rank spells.', Zerotorescue),
  change(date(2021, 6, 23), 'Show Auto Shots in a separate cast bar in the timeline and add a swing timer indicator.', Zerotorescue),
  change(date(2021, 6, 22), 'Configure abilities and buffs for the timeline.', Zerotorescue),
  change(date(2021, 6, 7), 'Initial setup', Zerotorescue),
];
