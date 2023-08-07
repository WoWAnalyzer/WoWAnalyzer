import { change, date } from 'common/changelog';
import { TALENTS_WARRIOR } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { Abelito75, Greedyhugs, ToppleTheNun, CodersKitchen } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';

// prettier-ignore
export default [
  change(date(2023, 8, 7), <>Updated Rage Tracker to more accurately track <SpellLink spell={TALENTS_WARRIOR.HEAVY_REPERCUSSIONS_TALENT} /> and <SpellLink spell={TALENTS_WARRIOR.IMPENETRABLE_WALL_TALENT}/> while also adding <SpellLink spell={TALENTS_WARRIOR.UNNERVING_FOCUS_TALENT}/> </>, Abelito75),
  change(date(2023, 8, 6), <>Updated <SpellLink spell={TALENTS_WARRIOR.HEAVY_REPERCUSSIONS_TALENT}/> rage generation</>, Abelito75),
  change(date(2023, 8, 6), <>Added <SpellLink spell={TALENTS_WARRIOR.RAVAGER_TALENT}/> hit checker</>, Abelito75),
  change(date(2023, 8, 6), <>Hide <SpellLink spell={TALENTS_WARRIOR.BATTLE_STANCE_TALENT}/>, <SpellLink spell={SPELLS.HEROIC_THROW}/>, <SpellLink spell={SPELLS.HAMSTRING}/>, <SpellLink spell={SPELLS.BATTLE_SHOUT}/>, <SpellLink spell={TALENTS_WARRIOR.HEROIC_LEAP_TALENT}/> and <SpellLink spell={TALENTS_WARRIOR.CHALLENGING_SHOUT_TALENT}/> </>, Abelito75),
  change(date(2023, 7, 18), 'Update abilities', Abelito75),
  change(date(2023, 7, 8), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 6, 25), 'Reduce CD of Shield Slam, when Honed Reflexes is skilled.', CodersKitchen),
  change(date(2022, 3, 11), 'Initial pass to make sure everything is cash money. ', Abelito75),
  change(date(2022, 3, 11), 'We back. ', Abelito75),
  change(date(2023, 1, 5), <>Updated cooldown timers for accuracy and added <SpellLink spell={TALENTS_WARRIOR.SHIELD_CHARGE_TALENT}/>, <SpellLink spell={TALENTS_WARRIOR.SPEAR_OF_BASTION_TALENT}/>, and <SpellLink spell={TALENTS_WARRIOR.SHOCKWAVE_TALENT}/> (when <SpellLink spell={TALENTS_WARRIOR.SONIC_BOOM_TALENT}/> talented) to offensive cooldowns</>, Greedyhugs),
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
