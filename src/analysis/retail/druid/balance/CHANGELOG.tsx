import { change, date } from 'common/changelog';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Sref, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 10, 17), <>Only check <SpellLink id={TALENTS_DRUID.INNERVATE_TALENT} /> efficiency if talented into it.</>, ToppleTheNun),
  change(date(2022, 10, 17), <>Add <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> to Abilities list.</>, ToppleTheNun),
  change(date(2022, 9, 16), <>Initial updates for Dragonflight Talent system.</>, Sref),
];
