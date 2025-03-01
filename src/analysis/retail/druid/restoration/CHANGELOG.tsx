import { change, date } from 'common/changelog';
import { Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';

export default [
  change(date(2025, 3, 1), <>Updated Mastery calculations to account for 11.1 changes. Marked as updated for 11.1.0.</>, Sref),
  change(date(2025, 2, 16), <>Added support for the Liberation of Undermine tier set.</>, Sref),
  change(date(2024, 11, 18), <>Fixed an issue where <SpellLink spell={TALENTS_DRUID.HARMONIOUS_BLOOMING_TALENT} /> was counted as only 1 mastery stack.</>, Sref),
  change(date(2024, 10, 27), <>Updated for 11.0.5, handling added / changed talents and added statistics module for <SpellLink spell={TALENTS_DRUID.RENEWING_SURGE_TALENT} />. Fixed an issue where a cast efficiency bar would show for <SpellLink spell={TALENTS_DRUID.TRANQUILITY_TALENT} /> and <SpellLink spell={TALENTS_DRUID.INNERVATE_TALENT} /> even when player didn't take the talents. Fixed an issue where Grove Guardian Swiftmend healing wasn't registering.</>, Sref),
  change(date(2024, 10, 1), <>Updated cooldown graph / tracking to handle <SpellLink spell={TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT} /></>, Sref),
  change(date(2024, 9, 23), <>Added breakdown of HoT extensions to <SpellLink spell={TALENTS_DRUID.VERDANT_INFUSION_TALENT}/> statistic tooltip.</>, Sref),
  change(date(2024, 9, 13), <>Removed mana saved attribution from <SpellLink spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT}/> tracking.</>, Sref),
  change(date(2024, 9, 13), <>Added statistics for <SpellLink spell={TALENTS_DRUID.GERMINATION_TALENT}/> and  <SpellLink spell={TALENTS_DRUID.THRIVING_VEGETATION_TALENT}/>. Fixed an issue where  <SpellLink spell={TALENTS_DRUID.RAMPANT_GROWTH_TALENT}/> statistic was undercounting. </>, Sref),
  change(date(2024, 9, 3), <>Fixed numbers for <SpellLink spell={TALENTS_DRUID.PHOTOSYNTHESIS_TALENT}/> self Lifebloom. Fixed calculation issues in <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT}/> statistic and updated tooltip.</>, Sref),
  change(date(2024, 8, 23), <>Cleaner display of <SpellLink spell={SPELLS.WILD_GROWTH}/>, <SpellLink spell={SPELLS.REGROWTH}/>, <SpellLink spell={SPELLS.SWIFTMEND}/>, and <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT}/> sections in Guide. Added <SpellLink spell={SPELLS.SWIFTMEND}/> cast efficiency tracking. Tweaked Guide text. </>, Sref),
  change(date(2024, 8, 17), <>Marked updated for 11.0.2 and updated the spec's 'About' page.</>, Sref),
  change(date(2024, 8, 14), <>Updated spells to account for 11.0.2 balance patch.</>, Sref),
  change(date(2024, 7, 22), <>More data updates to handle new TWW spell IDs. </>, Sref),
  change(date(2024, 7, 14), <>Activating Resto Druid analyzer for The War Within! Hero talent analyzers not yet implemented.</>, Sref),
];
