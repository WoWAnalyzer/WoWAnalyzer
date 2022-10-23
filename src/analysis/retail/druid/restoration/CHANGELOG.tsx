import { change, date } from 'common/changelog';
import { Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_DRUID } from 'common/TALENTS';

export default [
  change(date(2022, 10, 19), <>Rearranged Guide's 'Core Rotation' section for improved readability</>, Sref),
  change(date(2022, 10, 16), <>Fixed a bug where casting Flourish before your first Convoke caused a crash in the Flourish module.</>, Sref),
  change(date(2022, 10, 14), <>Updated statistics for <SpellLink id={TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT.id} /> and <SpellLink id={TALENTS_DRUID.REGENESIS_TALENT.id} /> to provide breakdown by spell.</>, Sref),
  change(date(2022, 10, 14), <>Added statistic and mana efficiency entry for <SpellLink id={TALENTS_DRUID.OVERGROWTH_TALENT.id} />. You may stop bothering me now, Zimbita.</>, Sref),
  change(date(2022, 10, 9), <>Added statistic for <SpellLink id={TALENTS_DRUID.RAMPANT_GROWTH_TALENT.id} />. Fixed an issue where <SpellLink id={TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT.id} /> wasn't counting procs that occur during <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id} />. Updated <SpellLink id={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT.id} />, <SpellLink id={TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT.id} />, <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id} />, and <SpellLink id={TALENTS_DRUID.NURTURING_DORMANCY_TALENT.id} /> to account for balance changes in Beta build 45969. </>, Sref),
  change(date(2022, 9, 30), <>Added statistic for <SpellLink id={TALENTS_DRUID.NATURES_VIGIL_TALENT.id} /></>, Sref),
  change(date(2022, 9, 29), <>Updated <SpellLink id={TALENTS_DRUID.ABUNDANCE_TALENT.id} /> and <SpellLink id={TALENTS_DRUID.NURTURING_DORMANCY_TALENT.id} /> to account for nerfs on beta. Fixed an issue where <SpellLink id={TALENTS_DRUID.REFORESTATION_TALENT.id} /> showed in the wrong category. Fixed an issue where <SpellLink id={TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT.id} /> used the wrong ID.</>, Sref),
  change(date(2022, 9, 26), <>Added handling and stats for <SpellLink id={TALENTS_DRUID.GROVE_TENDING_TALENT.id} />, <SpellLink id={TALENTS_DRUID.NURTURING_DORMANCY_TALENT.id} />, <SpellLink id={TALENTS_DRUID.VERDANCY_TALENT.id} />, <SpellLink id={TALENTS_DRUID.HARMONIOUS_BLOOMING_TALENT.id} />, and <SpellLink id={TALENTS_DRUID.REGENESIS_TALENT.id} />. First pass on updating text in Guide.</>, Sref),
  change(date(2022, 9, 23), <>Updates for this week's Beta build.</>, Sref),
  change(date(2022, 9, 13), <>Initial updates for Dragonflight Talent system.</>, Sref),
  change(date(2022, 8, 4), <>Updated and made default new Guide-style overview page!</>, Sref),
];
