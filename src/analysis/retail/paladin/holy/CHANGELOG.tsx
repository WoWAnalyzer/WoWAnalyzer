import { change, date } from 'common/changelog';
import { TALENTS_PALADIN } from 'common/TALENTS/paladin';
import { swirl, Taleria } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2026, 7, 16), <>Fixed <SpellLink spell={TALENTS_PALADIN.LIGHT_OF_DAWN_TALENT} /> healing not being tracked at all, which also restores its beacon transfer, overhealing, mastery contribution and healing per Holy Power.</>, Taleria),
  change(date(2026, 7, 16), <>Fixed <SpellLink spell={TALENTS_PALADIN.RECLAMATION_TALENT} /> reporting no healing.</>, Taleria),
  change(date(2026, 7, 16), <>Removed the <SpellLink spell={TALENTS_PALADIN.SOLAR_GRACE_TALENT} />, <SpellLink spell={TALENTS_PALADIN.BLESSING_OF_ANSHE_TALENT} /> and <SpellLink spell={TALENTS_PALADIN.SECOND_SUNRISE_TALENT} /> statistics, as they no longer reflect how those talents work in Midnight.</>, Taleria),
  change(date(2026, 1, 26), <>Updated <SpellLink spell={TALENTS_PALADIN.RISING_SUNLIGHT_TALENT} />, <SpellLink spell={TALENTS_PALADIN.CRUSADERS_MIGHT_TALENT} />, and added initial <SpellLink spell={TALENTS_PALADIN.BEACON_OF_THE_SAVIOR_1_HOLY_TALENT} /> setup.</>, swirl),
  change(date(2026, 1, 3), <>Initial Holy Paladin support for Midnight.</>, swirl),
];
