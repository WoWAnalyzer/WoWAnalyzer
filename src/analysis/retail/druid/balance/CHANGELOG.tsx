import { change, date } from 'common/changelog';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Hartra344, Sref, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 1, 6), <>Moved <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> from a covenant section to the general statistic section.</>, Hartra344 ),
  change(date(2022, 12, 31), <>Updated the about description to be up to date with dragonflight.</>, Hartra344 ),
  change(date(2022, 12, 31), <>Add support for <SpellLink id={TALENTS_DRUID.WANING_TWILIGHT_TALENT} /> uptime and DPS contribution statistic</>, Hartra344 ),
  change(date(2022, 10, 17), <>Only check <SpellLink id={TALENTS_DRUID.INNERVATE_TALENT} /> efficiency if talented into it.</>, ToppleTheNun),
  change(date(2022, 10, 17), <>Add <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> to Abilities list.</>, ToppleTheNun),
  change(date(2022, 9, 16), <>Initial updates for Dragonflight Talent system.</>, Sref),
];
