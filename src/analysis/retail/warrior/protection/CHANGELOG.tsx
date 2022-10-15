import { change, date } from 'common/changelog';
import { Abelito75, ToppleTheNun } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2022, 10, 12), 'Compilation pass for Dragonflight.', ToppleTheNun),
  change(date(2022, 7, 30), 'Fixed timefiltering for bighit graph. Reworked Bad Defensive Casts statistic.', Abelito75),
  change(date(2022, 6, 22), 'Added a Beautiful big hit graph.', Abelito75),
  change(date(2022, 6, 21), 'Ignore Pain Overcap Stat added.', Abelito75),
  change(date(2022, 6, 21), 'Ignore Pain Expired Stat added.', Abelito75),
  change(date(2022, 6, 8), 'Dynamic suggestion for Block Check and fixed a bug with Glory.', Abelito75),
  change(date(2022, 5, 12), 'Formatted expected shield slams.', Abelito75),
  change(date(2022, 4, 22), 'Fixed Charge and Intervene\'s cooldown and updated the example log.', Abelito75),
  change(date(2022, 3, 30), 'Added a stat to show average time between Outburst procs.', Abelito75),
  change(date(2022, 3, 30), 'Added a FourSet ratio stat.', Abelito75),
  change(date(2022, 3, 30), 'Glory Stat Added.', Abelito75),
  change(date(2022, 3, 29), 'Some prettying up of stats.', Abelito75),
  change(date(2022, 3, 18), 'Corrected thresholds for BlockCheck', Abelito75),
  change(date(2022, 3, 17), 'File Clean up and abilities updated. Bumping to 9.2 and supported', Abelito75),
  change(date(2022, 3, 16), 'Converted BlockCheck and ShieldBlock to typescript.', Abelito75),
  change(date(2022, 3, 16), 'Updated Avatar\'s statistic box.', Abelito75),
  change(date(2022, 3, 16), 'Corrected Into The Fray haste buff tracking.', Abelito75),
];
