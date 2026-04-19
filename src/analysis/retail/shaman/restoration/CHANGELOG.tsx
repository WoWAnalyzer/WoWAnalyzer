import { change, date } from 'common/changelog';
import { Harrek, Texleretour } from 'CONTRIBUTORS';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2026, 4, 26), <>Added <SpellLink spell={TALENTS.IMPROVED_EARTHLIVING_WEAPON_TALENT} /> information to the <SpellLink spell={TALENTS.EARTHLIVING_WEAPON_TALENT} /> module. Added modules for <SpellLink spell={TALENTS.EARTHEN_ACCORD_TALENT} />, <SpellLink spell={TALENTS.SUPPORTIVE_IMBUEMENTS_TALENT} />, <SpellLink spell={TALENTS.EARTHSURGE_TALENT} />, and <SpellLink spell={TALENTS.PULSE_CAPACITOR_TALENT} />. Fixed issues due to old data in the <SpellLink spell={TALENTS.OVERSURGE_TALENT} />, <SpellLink spell={TALENTS.AMPLIFICATION_CORE_TALENT} />, <SpellLink spell={TALENTS.RESURGENCE_TALENT} />, <SpellLink spell={SPELLS.WATER_SHIELD} />, <SpellLink spell={TALENTS.MANA_SPRING_TALENT} />, and <SpellLink spell={TALENTS.COALESCING_WATER_TALENT} /> modules.</>, Harrek),
  change(date(2026, 3, 26), <>Updated guide, added <SpellLink spell={TALENTS.ASCENDANCE_RESTORATION_TALENT} /> and <SpellLink spell={TALENTS.HEALING_STREAM_TOTEM_RESTORATION_TALENT} /> modules</>, Harrek),
  change(date(2026, 3, 20), "Updates for raid launch", Texleretour),
  change(date(2026, 1, 11), <>Initial support for 12.0</>, Harrek)
];
