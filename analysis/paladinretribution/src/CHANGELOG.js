import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Abelito75, Fashathus, Adoraci, Juko8, Skeletor, Zeboot, Hordehobbs } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 4, 2), <>Fixed Art Of War for people without 4set </>, Abelito75),
  change(date(2022, 4, 2), <>Corrected Art Of War stat and made two more for tierset </>, Abelito75),
  change(date(2022, 3, 28), <>Fixed an issue where the Divine Purpose statistic wasn't tracking Final Verdict correctly causing it to crash. </>, Abelito75),
  change(date(2022, 1, 31), <>Added a cool probability graph for Art Of War. </>, Abelito75),
  change(date(2021, 7, 5), <>Fixed bug where <SpellLink id={SPELLS.FINAL_VERDICT.id} icon /> would sometimes not count toward consuming <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> debuffs. </>, Fashathus),
  change(date(2021, 6, 27), <>Changed <SpellLink id={SPELLS.EXECUTION_SENTENCE_TALENT.id} icon /> statistics for Shadowlands. At least partially fixed bug with judgement debuff consumption tracking. </>, Fashathus),
  change(date(2021, 4, 10), <>Added <SpellLink id={SPELLS.FINAL_VERDICT.id} icon />.</>, Juko8),
  change(date(2021, 4, 3), 'Verified patch changes and bumped support to 9.0.5', Adoraci),
  change(date(2020, 12, 1), <>Added <SpellLink id={SPELLS.SANCTIFIED_WRATH_TALENT_RETRIBUTION.id} icon /> module and minor housekeeping.</>, Skeletor),
  change(date(2020, 11, 8), <>Added <SpellLink id={SPELLS.EMPYREAN_POWER_TALENT.id} icon /> module.</>, Skeletor),
  change(date(2020, 11, 7), <>Added <SpellLink id={SPELLS.HOLY_AVENGER_TALENT.id} icon /> module from new Shared module.</>, Skeletor),
  change(date(2020, 11, 7), <>Updated <SpellLink id={SPELLS.DIVINE_PURPOSE_TALENT.id} icon /> module to new Shared module.</>, Skeletor),
  change(date(2020, 11, 7), 'Core and Talent modules converted to TypeScript', Skeletor),
  change(date(2020, 11, 6), 'General housekeeping and ability updates.', Skeletor),
  change(date(2020, 10, 23), <>Aggregate Prot and Ret <SpellLink id={SPELLS.JUDGMENT_CAST.id} /> analyzers into single analyzer.</>, Hordehobbs),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 17), <>Updated <SpellLink id={SPELLS.HAMMER_OF_WRATH.id} icon /> max casts calculation to account for execute restrictions and added cast efficiency tracking</>, Juko8),
  change(date(2020, 9, 18), 'Removed BFA stuff and updated most things for 9.0', Juko8),
];
