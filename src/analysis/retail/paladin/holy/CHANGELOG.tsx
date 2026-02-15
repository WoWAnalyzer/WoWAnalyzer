import { change, date } from 'common/changelog';
import { TALENTS_PALADIN } from 'common/TALENTS/paladin';
import { swirl } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2026, 1, 26), <>Updated <SpellLink spell={TALENTS_PALADIN.RISING_SUNLIGHT_TALENT} />, <SpellLink spell={TALENTS_PALADIN.CRUSADERS_MIGHT_TALENT} />, and added initial <SpellLink spell={TALENTS_PALADIN.BEACON_OF_THE_SAVIOR_1_HOLY_TALENT} /> setup.</>, swirl),
  change(date(2026, 1, 3), <>Initial Holy Paladin support for Midnight.</>, swirl),
];
