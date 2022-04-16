import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Juko8, Abelito75, Talby, Hursti, nullDozzer } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 4, 15), 'Updated all conduit statistics to show correct itemlevel and rank.', nullDozzer),
  change(date(2022, 1, 2), <>Changed the <SpellLink id={SPELLS.COORDINATED_OFFENSIVE.id} /> module to work with <SpellLink id={SPELLS.SERENITY_TALENT.id} />.</>, Hursti),
  change(date(2021, 12, 21), <>Added <SpellLink id={SPELLS.COORDINATED_OFFENSIVE.id} /> module.</>, Hursti),
  change(date(2021, 12, 21), <>Added Data for <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE.id} /> Clones for further usage.</>, Hursti),
  change(date(2021, 12, 21), <>Added missing ticks of <SpellLink id={SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id} /> for calculations in the statistics.</>, Hursti),
  change(date(2021, 12, 18), <>Added <SpellLink id={SPELLS.CALCULATED_STRIKES.id} /> module. </>, Hursti),
  change(date(2021, 12, 13), <>Added <SpellLink id={SPELLS.XUENS_BOND.id} /> module. </>, Hursti),
  change(date(2021, 12, 13), <>Added <SpellLink id={SPELLS.INNER_FURY.id} /> module. </>, Hursti),
  change(date(2021, 12, 12), <>Added <SpellLink id={SPELLS.FAELINE_HARMONY_BUFF.id} /> module and added existing Venthyr modules to the statistics</>, Hursti),
  change(date(2021, 12, 9), <>Updated constants for <SpellLink id={SPELLS.MARK_OF_THE_CRANE.id} /> and marked as 9.1.5 compatible</>, Juko8),
  change(date(2021, 8, 18), 'Marked as 9.1 compatible', Juko8),
  change(date(2021, 6, 17), <>Fixed <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> not counting marks applied/refreshed by <SpellLink id={SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT.id} />.</>, Juko8),
  change(date(2021, 5, 17), <>Added <SpellLink id={SPELLS.XUENS_BATTLEGEAR.id} /> module.</>, Juko8),
  change(date(2021, 5, 11), <>Added <SpellLink id={SPELLS.FAELINE_STOMP_CAST.id} /> module to Windwalker analyzer as well</>, Juko8),
  change(date(2021, 4, 1), <>Updated <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> module.</>, Juko8),
  change(date(2021, 3, 17), 'Added tracker for Dance of Chiji Bonus damage', Talby),
  change(date(2020, 3, 16), 'Marked as 9.0.5 compatible', Juko8),
  change(date(2020, 12, 22), <>Added <SpellLink id={SPELLS.INVOKERS_DELIGHT.id} /> haste buff.</>, Abelito75),
  change(date(2020, 12, 13), <>Added <SpellLink id={SPELLS.WEAPONS_OF_ORDER_CAST.id} /></>, Juko8),
  change(date(2020, 12, 10), <>Fixed crash with <SpellLink id={SPELLS.DANCE_OF_CHI_JI_TALENT.id} /></>, Juko8),
  change(date(2020, 12, 6), 'Converted most Windwalker modules to TypeScript', Juko8),
  change(date(2020, 11, 25), <>Added <SpellLink id={SPELLS.JADE_IGNITION.id} /></>, Juko8),
  change(date(2020, 10, 20), <>Added <SpellLink id={SPELLS.EXPEL_HARM.id} icon /> cast efficiency to checklist</>, Juko8),
  change(date(2020, 10, 19), <>Added <SpellLink id={SPELLS.LAST_EMPERORS_CAPACITOR.id} /></>, Juko8),
  change(date(2020, 10, 17), <>Minor changes, <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} icon /> GCD removed, <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon /> CDR during Serenity updated, and cast efficiency for <SpellLink id={SPELLS.EXPEL_HARM.id} icon /> added </>, Juko8 ),
  change(date(2020, 10, 6), <>Added <SpellLink id={SPELLS.FALLEN_ORDER_CAST.id} /> statistic.</>, Abelito75),
  change(date(2020, 9, 9), 'Updated for 9.0 Shadowlands', Juko8),
];
