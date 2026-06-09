import { change, date } from 'common/changelog';
import { Harrek, Texleretour, Naltarunir } from 'CONTRIBUTORS';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2026, 6, 10), <>Corrected the cooldown duration of <SpellLink spell={TALENTS.EARTH_ELEMENTAL_TALENT} />. Resolved an issue with the cooldown of <SpellLink spell={SPELLS.PURIFY_SPIRIT} /> in the spell tracker.
  <p></p>Resolved issues with the cooldown of <SpellLink spell={TALENTS.HEALING_TIDE_TOTEM_TALENT} /> and <SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT} /> if taken with <SpellLink spell={TALENTS.FIRST_ASCENDANT_TALENT} />.
  <p></p>Corrected the availability check for <SpellLink spell={SPELLS.HEROISM} /> according to the faction check to also affect the Restoration Shaman's spellbook.
  <p></p>Removed outdated information from a tooltip, as <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} /> no longer increases the number of jumps <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} /> can perform.
  <p></p>Resolved an issue that prevented a correct calculation of mana price reduction for <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} /> if <SpellLink spell={TALENTS.CALM_WATERS_TALENT} /> was also taken.
  <p></p>Resolved an issue that prevented <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} /> from <SpellLink spell={TALENTS.STORMSTREAM_TOTEM_1_RESTORATION_TALENT} /> to be counted torwards the  <SpellLink spell={TALENTS.LIVELY_TOTEMS_TALENT} />  talent.
  <p></p>Resolved an issue that prevented a correct calculation of the healing contribiution from  <SpellLink spell={TALENTS.OVERSURGE_TALENT} />  if take with Healing Tide Totem.
  <p></p>Resolved an issue that prevented the correct calculation of  <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} />  Jumps if multiple jump-extender talents where used together.
  <p></p>Resolved an issue that prevented the correct calculation of  <SpellLink spell={TALENTS.RIPTIDE_TALENT} />  HoTs if they would override each other by procing  <SpellLink spell={TALENTS.PRIMAL_TIDE_CORE_TALENT} /> . </>, Naltarunir),
  change(date(2026, 5, 17), <>Fixed errors in the <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} /> analyzer and bump support to 12.0.5</>, Harrek),
  change(date(2026, 4, 26), <>Added <SpellLink spell={TALENTS.IMPROVED_EARTHLIVING_WEAPON_TALENT} /> information to the <SpellLink spell={TALENTS.EARTHLIVING_WEAPON_TALENT} /> module. Added modules for <SpellLink spell={TALENTS.EARTHEN_ACCORD_TALENT} />, <SpellLink spell={TALENTS.SUPPORTIVE_IMBUEMENTS_TALENT} />, <SpellLink spell={TALENTS.EARTHSURGE_TALENT} />, and <SpellLink spell={TALENTS.PULSE_CAPACITOR_TALENT} />. Fixed issues due to old data in the <SpellLink spell={TALENTS.OVERSURGE_TALENT} />, <SpellLink spell={TALENTS.AMPLIFICATION_CORE_TALENT} />, <SpellLink spell={TALENTS.RESURGENCE_TALENT} />, <SpellLink spell={SPELLS.WATER_SHIELD} />, <SpellLink spell={TALENTS.MANA_SPRING_TALENT} />, and <SpellLink spell={TALENTS.COALESCING_WATER_TALENT} /> modules.</>, Harrek),
  change(date(2026, 3, 26), <>Updated guide, added <SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT} /> and <SpellLink spell={TALENTS.HEALING_STREAM_TOTEM_RESTORATION_TALENT} /> modules</>, Harrek),
  change(date(2026, 3, 20), "Updates for raid launch", Texleretour),
  change(date(2026, 1, 11), <>Initial support for 12.0</>, Harrek)
];
