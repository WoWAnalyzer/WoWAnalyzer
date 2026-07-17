import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_PALADIN } from 'common/TALENTS/paladin';
import { swirl, Taleria } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import { ResourceLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

export default [
  change(date(2026, 7, 17), <>Fixed <SpellLink spell={TALENTS_PALADIN.GREATER_JUDGMENT_HOLY_TALENT} /> healing not being tracked. It is logged under <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} />'s own spell ID rather than one of its own, so nothing was matching it.</>, Taleria),
  change(date(2026, 7, 17), <>Expanded the Beacons section beyond uptime: it now shows how much of your healing landed on a beacon target directly, and how much beacon healing was lost to line of sight or to a beacon not being up.</>, Taleria),
  change(date(2026, 7, 17), <>Added a Core Rotation section to the overview, checking your casts against the Holy Power priority list and showing where you deviated from it.</>, Taleria),
  change(date(2026, 7, 17), <>Reworked the <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> section. It is a filler cast for damage and <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> rather than a high priority heal, so it now reports those, along with <SpellLink spell={TALENTS_PALADIN.GREATER_JUDGMENT_HOLY_TALENT} /> healing, instead of being graded on cast efficiency.</>, Taleria),
  change(date(2026, 7, 17), <>Added a <SpellLink spell={SPELLS.HOLY_LIGHT} /> section to the overview, covering its overhealing, how many extra allies each cast reached through <SpellLink spell={TALENTS_PALADIN.RESPLENDENT_LIGHT_TALENT} />, and your <SpellLink spell={TALENTS_PALADIN.HAND_OF_DIVINITY_TALENT} /> proc usage.</>, Taleria),
  change(date(2026, 7, 17), <>Gave <SpellLink spell={TALENTS_PALADIN.INFUSION_OF_LIGHT_TALENT} /> its own section in the overview, covering both its procs and the <SpellLink spell={SPELLS.FLASH_OF_LIGHT} /> casts that spend them. Each cast is graded on whether it spent a proc and, with <SpellLink spell={TALENTS_PALADIN.MOMENT_OF_COMPASSION_TALENT} /> talented, whether it landed on your <SpellLink spell={TALENTS_PALADIN.BEACON_OF_THE_SAVIOR_1_HOLY_TALENT} /> target.</>, Taleria),
  change(date(2026, 7, 17), <>Fixed <SpellLink spell={TALENTS_PALADIN.INFUSION_OF_LIGHT_TALENT} /> proc counts. Procs were being inferred from <SpellLink spell={TALENTS_PALADIN.HOLY_SHOCK_TALENT} /> critical strikes, which the talent no longer has anything to do with, and <SpellLink spell={SPELLS.HOLY_LIGHT} /> was counted as spending procs it can no longer consume. Both made wasted procs wrong; they are now counted from the buff itself.</>, Taleria),
  change(date(2026, 7, 17), <>Reworked the Holy Power part of the overview to show graded statistics for wasted and spent Holy Power alongside the graph, rather than a plain count, plus a breakdown of which spells you spent it on and how much each of them overhealed.</>, Taleria),
  change(date(2026, 7, 17), <>Added an Always Be Casting section to the overview, showing downtime and cancelled casts.</>, Taleria),
  change(date(2026, 7, 16), <>Reworked <SpellLink spell={TALENTS_PALADIN.HAND_OF_DIVINITY_TALENT} />, which always reported 0% cast efficiency. It is a buff rather than something you cast, so it now shows how many of its procs you used and the healing those <SpellLink spell={SPELLS.HOLY_LIGHT} /> casts did.</>, Taleria),
  change(date(2026, 7, 16), <>Fixed <SpellLink spell={TALENTS_PALADIN.LIGHT_OF_DAWN_TALENT} /> healing not being tracked at all, which also restores its beacon transfer, overhealing, mastery contribution and healing per Holy Power.</>, Taleria),
  change(date(2026, 7, 16), <>Fixed <SpellLink spell={TALENTS_PALADIN.RECLAMATION_TALENT} /> reporting no healing.</>, Taleria),
  change(date(2026, 7, 16), <>Removed the <SpellLink spell={TALENTS_PALADIN.SOLAR_GRACE_TALENT} />, <SpellLink spell={TALENTS_PALADIN.BLESSING_OF_ANSHE_TALENT} /> and <SpellLink spell={TALENTS_PALADIN.SECOND_SUNRISE_TALENT} /> statistics, as they no longer reflect how those talents work in Midnight.</>, Taleria),
  change(date(2026, 1, 26), <>Updated <SpellLink spell={TALENTS_PALADIN.RISING_SUNLIGHT_TALENT} />, <SpellLink spell={TALENTS_PALADIN.CRUSADERS_MIGHT_TALENT} />, and added initial <SpellLink spell={TALENTS_PALADIN.BEACON_OF_THE_SAVIOR_1_HOLY_TALENT} /> setup.</>, swirl),
  change(date(2026, 1, 3), <>Initial Holy Paladin support for Midnight.</>, swirl),
];
