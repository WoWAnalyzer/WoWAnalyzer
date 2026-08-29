import { change, date } from 'common/changelog';
import { Oratio, Sref, Vollmer, squided } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';

export default [
  change(
    date(2026, 8, 18),
    <>Add an Advanced toggle to the Restoration Druid guide for extra cast analysis.</>,
    squided,
  ),
  change(
    date(2026, 8, 18),
    <>
      Attribute <SpellLink spell={TALENTS_DRUID.OVERGROWTH_TALENT} />,{' '}
      <SpellLink spell={TALENTS_DRUID.IMPLANT_TALENT} />, and{' '}
      <SpellLink spell={TALENTS_DRUID.TWIN_SPROUTS_TALENT} /> healing, including Implant blooms from
      Overgrowth's Wild Growth.
    </>,
    squided,
  ),
  change(
    date(2026, 8, 28),
    <>
      Add a combined Keeper of the Grove / Wildstalker healing breakdown and statistics for
      remaining hero talents.
    </>,
    squided,
  ),
  change(
    date(2026, 8, 28),
    <>
      Count <SpellLink spell={TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT} /> splash and{' '}
      <SpellLink spell={TALENTS_DRUID.SYMBIOTIC_RELATIONSHIP_TALENT} /> copies in Mastery: Harmony
      using the source heal's HoTs instead of treating them as non-mastery healing.
    </>,
    squided,
  ),
  change(
    date(2026, 8, 18),
    <>
      Add statistics for <SpellLink spell={TALENTS_DRUID.FORESTWALK_TALENT} />,{' '}
      <SpellLink spell={TALENTS_DRUID.FLASH_OF_CLARITY_TALENT} />,{' '}
      <SpellLink spell={TALENTS_DRUID.PASSING_SEASONS_TALENT} />, and{' '}
      <SpellLink spell={TALENTS_DRUID.VERDANT_HEART_TALENT} />.
    </>,
    squided,
  ),
  change(
    date(2026, 8, 27),
    <>
      Update for the 12.1 balance pass: Season 2 4pc increases{' '}
      <SpellLink spell={SPELLS.RESTO_DRUID_TIER_36_GENESIS_BUFF} /> duration by 8 sec (was 4).
    </>,
    squided,
  ),
  change(
    date(2026, 8, 19),
    <>
      Improve the HoT graph: ignore pets and duplicate applies, and include{' '}
      <SpellLink spell={SPELLS.REGROWTH} />.
    </>,
    squided,
  ),
  change(
    date(2026, 8, 19),
    <>
      Rework the <SpellLink spell={SPELLS.WILD_GROWTH} /> guide section and allow CastDetail stats
      to be ungraded or limited to a subset of performance grades.
    </>,
    squided,
  ),
  change(
    date(2026, 8, 19),
    <>
      Evaluate <SpellLink spell={SPELLS.INNERVATE} /> as a self mana cooldown (capping / wasted
      regen) instead of a shared healing throughput window.
    </>,
    squided,
  ),
  change(
    date(2026, 8, 19),
    <>
      Attribute overhealing from the crit chance bonus on{' '}
      <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} /> and{' '}
      <SpellLink spell={TALENTS_DRUID.STRATEGIC_INFUSION_TALENT} />.
    </>,
    squided,
  ),
  change(
    date(2026, 8, 19),
    <>
      Add Season 2 <SpellLink spell={SPELLS.RESTO_DRUID_TIER_36_GENESIS_BUFF} /> tier tracking.
    </>,
    squided,
  ),
  change(
    date(2026, 5, 2),
    <>
      Fix bug in <SpellLink spell={TALENTS_DRUID.BOND_WITH_NATURE_TALENT} /> statistic.
    </>,
    squided,
  ),
  change(
    date(2026, 4, 21),
    <>
      Fix bug in <SpellLink spell={TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT} /> statistic to not
      count SotF consumes during convoke.
    </>,
    squided,
  ),
  change(date(2026, 4, 21), <>Updates for the 12.0.5 patch.</>, squided),
  change(
    date(2026, 4, 15),
    <>
      Add <SpellLink spell={TALENTS_DRUID.VERDANCY_TALENT} /> healing to be included in the{' '}
      <SpellLink spell={TALENTS_DRUID.PHOTOSYNTHESIS_TALENT} /> and{' '}
      <SpellLink spell={TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT} /> healing statistics. Fix{' '}
      <SpellLink spell={TALENTS_DRUID.RENEWING_SURGE_TALENT} /> to calculate properly when healing
      NPCs like the crystals on Midnight Falls.
    </>,
    squided,
  ),
  change(
    date(2026, 4, 15),
    <>
      Fix <SpellLink spell={TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT} /> interactions with{' '}
      <SpellLink spell={TALENTS_DRUID.POWER_OF_NATURE_TALENT} /> and{' '}
      <SpellLink spell={TALENTS_DRUID.VIGOROUS_CREEPERS_TALENT} />.
    </>,
    squided,
  ),
  change(
    date(2026, 4, 14),
    <>
      Add Nature's Bounty healing to <SpellLink spell={TALENTS_DRUID.GROVES_INSPIRATION_TALENT} />.
      Add tooltip to <SpellLink spell={TALENTS_DRUID.HARMONY_OF_THE_GROVE_TALENT} />.
    </>,
    squided,
  ),
  change(
    date(2026, 4, 14),
    <>
      Fixed bug in statistic for <SpellLink spell={TALENTS_DRUID.POWER_OF_NATURE_TALENT} />.
    </>,
    squided,
  ),
  change(
    date(2026, 4, 13),
    <>
      Added <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} /> graph to guide section. Fixed bugs
      in statistics for Abundance and Strategic Infusion.
    </>,
    squided,
  ),
  change(
    date(2026, 4, 10),
    <>
      Fixed bug in statistic for <SpellLink spell={TALENTS_DRUID.STRATEGIC_INFUSION_TALENT} />.
    </>,
    squided,
  ),
  change(
    date(2026, 3, 31),
    <>
      Remove recent tranquility check from convoke guide. Fix Abundancy module to account for
      Intensity crit bonus. Add Intensity module.
    </>,
    squided,
  ),
  change(
    date(2026, 3, 23),
    <>Update mana efficiency calculations and cooldowns tab for Midnight.</>,
    squided,
  ),
  change(
    date(2026, 3, 22),
    <>Implement liveliness talent statistic. Fix bug in lifebloom guide's cast analysis.</>,
    squided,
  ),
  change(
    date(2026, 3, 20),
    <>
      Bug fixes for wild growth CDR statistics, lifebloom uptime in guide, and Soul of the Forest
      Consumes. Improved Power of the Archdruid tracking.
    </>,
    squided,
  ),
  change(
    date(2026, 3, 18),
    <>
      Improve Verdancy talent statistic. Fix bug in Everbloom tracking and Control of the Dream CDR
      calculation.
    </>,
    squided,
  ),
  change(
    date(2026, 3, 16),
    <>
      Added full support for both hero talents. Guide is now complete for Midnight season 1 raid
      launch.
    </>,
    squided,
  ),
  change(
    date(2026, 2, 26),
    <>
      Activating Resto Druid analyzer for Midnight! Full support is not yet implemented, but partial
      support is there.
    </>,
    squided,
  ),
  change(
    date(2025, 8, 15),
    <>
      Added statistic for <SpellLink spell={TALENTS_DRUID.ROOT_NETWORK_TALENT} />, and added{' '}
      <SpellLink spell={SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER} /> to HoT graph.
    </>,
    Sref,
  ),
  change(
    date(2025, 7, 3),
    <>
      Updates <SpellLink spell={SPELLS.INNERVATE} /> guide section to evaluate based on ramp active
      time instead of flat mana saved. Fixed CDR from Dreamstate. Added active time evaluation to
      guide.
    </>,
    Sref,
  ),
  change(
    date(2025, 7, 1),
    <>Innervate bug fix. Also updated the recommended mana saved value.</>,
    Oratio,
  ),
  change(date(2025, 4, 21), <>Update example log.</>, Vollmer),
  change(
    date(2025, 3, 24),
    <>
      Fixed an issue where HoTs procced by the Liberation of Undermine 4 set might not be properly
      attributed when Insurance! is refreshed.
    </>,
    Sref,
  ),
  change(
    date(2025, 3, 4),
    <>
      Updated <SpellLink spell={TALENTS_DRUID.NATURES_SWIFTNESS_TALENT} /> and added{' '}
      <SpellLink spell={TALENTS_DRUID.FLOURISH_TALENT} /> direct healing to account for 11.1.0
      changes. Fixed an issue where <SpellLink spell={TALENTS_DRUID.FLOURISH_TALENT} /> was
      incorrectly assuming 8 seconds of HoT extension instead of 6.
    </>,
    Sref,
  ),
  change(
    date(2025, 3, 1),
    <>Updated Mastery calculations to account for 11.1 changes. Marked as updated for 11.1.0.</>,
    Sref,
  ),
  change(date(2025, 2, 16), <>Added support for the Liberation of Undermine tier set.</>, Sref),
  change(
    date(2024, 11, 18),
    <>
      Fixed an issue where <SpellLink spell={TALENTS_DRUID.HARMONIOUS_BLOOMING_TALENT} /> was
      counted as only 1 mastery stack.
    </>,
    Sref,
  ),
  change(
    date(2024, 10, 27),
    <>
      Updated for 11.0.5, handling added / changed talents and added statistics module for{' '}
      <SpellLink spell={TALENTS_DRUID.RENEWING_SURGE_TALENT} />. Fixed an issue where a cast
      efficiency bar would show for <SpellLink spell={TALENTS_DRUID.TRANQUILITY_TALENT} /> and{' '}
      <SpellLink spell={TALENTS_DRUID.INNERVATE_TALENT} /> even when player didn't take the talents.
      Fixed an issue where Grove Guardian Swiftmend healing wasn't registering.
    </>,
    Sref,
  ),
  change(
    date(2024, 10, 1),
    <>
      Updated cooldown graph / tracking to handle{' '}
      <SpellLink spell={TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT} />
    </>,
    Sref,
  ),
  change(
    date(2024, 9, 23),
    <>
      Added breakdown of HoT extensions to{' '}
      <SpellLink spell={TALENTS_DRUID.VERDANT_INFUSION_TALENT} /> statistic tooltip.
    </>,
    Sref,
  ),
  change(
    date(2024, 9, 13),
    <>
      Removed mana saved attribution from{' '}
      <SpellLink spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT} /> tracking.
    </>,
    Sref,
  ),
  change(
    date(2024, 9, 13),
    <>
      Added statistics for <SpellLink spell={TALENTS_DRUID.GERMINATION_TALENT} /> and{' '}
      <SpellLink spell={TALENTS_DRUID.THRIVING_VEGETATION_TALENT} />. Fixed an issue where{' '}
      <SpellLink spell={TALENTS_DRUID.RAMPANT_GROWTH_TALENT} /> statistic was undercounting.{' '}
    </>,
    Sref,
  ),
  change(
    date(2024, 9, 3),
    <>
      Fixed numbers for <SpellLink spell={TALENTS_DRUID.PHOTOSYNTHESIS_TALENT} /> self Lifebloom.
      Fixed calculation issues in <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} /> statistic and
      updated tooltip.
    </>,
    Sref,
  ),
  change(
    date(2024, 8, 23),
    <>
      Cleaner display of <SpellLink spell={SPELLS.WILD_GROWTH} />,{' '}
      <SpellLink spell={SPELLS.REGROWTH} />, <SpellLink spell={SPELLS.SWIFTMEND} />, and{' '}
      <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> sections in Guide.
      Added <SpellLink spell={SPELLS.SWIFTMEND} /> cast efficiency tracking. Tweaked Guide
      text.{' '}
    </>,
    Sref,
  ),
  change(
    date(2024, 8, 17),
    <>Marked updated for 11.0.2 and updated the spec's 'About' page.</>,
    Sref,
  ),
  change(date(2024, 8, 14), <>Updated spells to account for 11.0.2 balance patch.</>, Sref),
  change(date(2024, 7, 22), <>More data updates to handle new TWW spell IDs. </>, Sref),
  change(
    date(2024, 7, 14),
    <>
      Activating Resto Druid analyzer for The War Within! Hero talent analyzers not yet implemented.
    </>,
    Sref,
  ),
];
