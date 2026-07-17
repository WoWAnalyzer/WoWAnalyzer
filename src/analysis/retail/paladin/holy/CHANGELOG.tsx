import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_PALADIN } from 'common/TALENTS/paladin';
import { swirl, Taleria } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2026, 7, 17), <>Added a <SpellLink spell={TALENTS_PALADIN.RESPLENDENT_LIGHT_TALENT} /> section to the overview, showing how many extra allies each <SpellLink spell={SPELLS.HOLY_LIGHT} /> reached and what that healed for.</>, Taleria),
  change(date(2026, 7, 17), <>Gave <SpellLink spell={TALENTS_PALADIN.INFUSION_OF_LIGHT_TALENT} /> its own section in the overview, covering both its procs and the <SpellLink spell={SPELLS.FLASH_OF_LIGHT} /> casts that spend them. Each cast is graded on whether it spent a proc and, with <SpellLink spell={TALENTS_PALADIN.MOMENT_OF_COMPASSION_TALENT} /> talented, whether it landed on your <SpellLink spell={TALENTS_PALADIN.BEACON_OF_THE_SAVIOR_1_HOLY_TALENT} /> target.</>, Taleria),
  change(date(2026, 7, 17), <>Fixed <SpellLink spell={TALENTS_PALADIN.INFUSION_OF_LIGHT_TALENT} /> proc counts. Procs were being inferred from <SpellLink spell={TALENTS_PALADIN.HOLY_SHOCK_TALENT} /> critical strikes, which the talent no longer has anything to do with, and <SpellLink spell={SPELLS.HOLY_LIGHT} /> was counted as spending procs it can no longer consume. Both made wasted procs wrong; they are now counted from the buff itself.</>, Taleria),
  change(date(2026, 7, 17), <>Reworked the Holy Power part of the overview to show graded statistics for wasted and spent Holy Power alongside the graph, rather than a plain count, plus a breakdown of which spells you spent it on and how much each of them overhealed.</>, Taleria),
  change(date(2026, 7, 17), <>Added an Always Be Casting section to the overview, showing downtime and cancelled casts.</>, Taleria),
  change(date(2026, 7, 16), <>Fixed <SpellLink spell={TALENTS_PALADIN.LIGHT_OF_DAWN_TALENT} /> healing not being tracked at all, which also restores its beacon transfer, overhealing, mastery contribution and healing per Holy Power.</>, Taleria),
  change(date(2026, 7, 16), <>Fixed <SpellLink spell={TALENTS_PALADIN.RECLAMATION_TALENT} /> reporting no healing.</>, Taleria),
  change(date(2026, 7, 16), <>Removed the <SpellLink spell={TALENTS_PALADIN.SOLAR_GRACE_TALENT} />, <SpellLink spell={TALENTS_PALADIN.BLESSING_OF_ANSHE_TALENT} /> and <SpellLink spell={TALENTS_PALADIN.SECOND_SUNRISE_TALENT} /> statistics, as they no longer reflect how those talents work in Midnight.</>, Taleria),
  change(date(2026, 1, 26), <>Updated <SpellLink spell={TALENTS_PALADIN.RISING_SUNLIGHT_TALENT} />, <SpellLink spell={TALENTS_PALADIN.CRUSADERS_MIGHT_TALENT} />, and added initial <SpellLink spell={TALENTS_PALADIN.BEACON_OF_THE_SAVIOR_1_HOLY_TALENT} /> setup.</>, swirl),
  change(date(2026, 1, 3), <>Initial Holy Paladin support for Midnight.</>, swirl),
];
