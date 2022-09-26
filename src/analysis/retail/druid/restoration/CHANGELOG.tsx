import { change, date } from 'common/changelog';
import { Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_DRUID } from 'common/TALENTS';

export default [
  change(date(2022, 9, 26), <>Added handling and stats for <SpellLink id={TALENTS_DRUID.GROVE_TENDING_RESTORATION_TALENT.id} />, <SpellLink id={TALENTS_DRUID.GROVE_TENDING_RESTORATION_TALENT.id} />, <SpellLink id={TALENTS_DRUID.VERDANCY_RESTORATION_TALENT.id} />, <SpellLink id={TALENTS_DRUID.HARMONIOUS_BLOOMING_RESTORATION_TALENT.id} />, and <SpellLink id={TALENTS_DRUID.REGENESIS_RESTORATION_TALENT.id} />. First pass on updating text in Guide.</>, Sref),
  change(date(2022, 9, 23), <>Updates for this week's Beta build.</>, Sref),
  change(date(2022, 9, 13), <>Initial updates for Dragonflight Talent system.</>, Sref),
  change(date(2022, 8, 4), <>Updated and made default new Guide-style overview page!</>, Sref),
];
