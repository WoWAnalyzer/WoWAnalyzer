import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Sharrq, Sref } from 'CONTRIBUTORS';

export default [
  change(date(2024, 10, 9), <>Adjusted <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> to account for <SpellLink spell={SPELLS.BURDEN_OF_POWER_BUFF} />, <SpellLink spell={SPELLS.GLORIOUS_INCANDESCENCE_BUFF} />, and <SpellLink spell={SPELLS.INTUITION_BUFF} /> when evaluating <SpellLink spell={SPELLS.ARCANE_CHARGE} />s.</>, Sharrq),
  change(date(2024, 10, 9), <>Fixed an issue that caused <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} /> to sometimes incorrectly claim the player had <SpellLink spell={SPELLS.NETHER_PRECISION_BUFF} /> due to incorrect event ordering in the log.</>, Sharrq),
  change(date(2024, 10, 9), <>Updated <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> to no longer complain about Mana % or <SpellLink spell={SPELLS.ARCANE_CHARGE} />s for the Opener.</>, Sharrq),
  change(date(2024, 10, 5), <>Now showing a message in the <SpellLink spell={SPELLS.ARCANE_ORB} /> section to indicate if they did not cast the spell at all.</>, Sharrq),
  change(date(2024, 10, 5), <>Fixed a bug that would crash Arcane Mage logs in dungeons such as Siege of Boralis and Mists of Tirna Scithe.</>, Sharrq),
  change(date(2024, 10, 5), <>Fixed an issue that was causing <SpellLink spell={SPELLS.ARCANE_CHARGE} /> to be miscounted, or not counted at all in some cases.</>, Sharrq),
  change(date(2024, 10, 5), <>Moved <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />, <SpellLink spell={SPELLS.ARCANE_BARRAGE} />, <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />, and <SpellLink spell={SPELLS.CLEARCASTING_BUFF} /> to use a summary bar that can be expanded for details.</>, Sharrq),
  change(date(2024, 10, 5), <>Updated <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} /> and <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> analysis.</>, Sharrq),
  change(date(2024, 9, 18), <>Updated the Warning Banner explaining the current state of Arcane Mage.</>, Sharrq),
  change(date(2024, 8, 20), <>Improvements to <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} /> and <SpellLink spell={SPELLS.ARCANE_ORB} /> stats. Cleaned up Cooldown bars section to only include relevant spells. Removed <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} /> section from Guide, as it was redundant with the text and tracking in <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> section.</>, Sref),
  change(date(2024, 8, 18), <>Bumped Arcane Mage to Full Support for 11.0.2</>, Sharrq),
  change(date(2024, 8, 18), <>Completely removed the old Checklist view.</>, Sharrq),
  change(date(2024, 8, 18), <>Moved Cooldown timelines back to their own section instead of alongside the spell's corresponding section.</>, Sharrq),
  change(date(2024, 8, 18), <>Updated the cooldown of <SpellLink spell={TALENTS.MASS_BARRIER_TALENT} /> to 3 minutes instead of 2 minutes.</>, Sharrq),
  change(date(2024, 8, 18), <>Added <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> to the cooldown throughout tracking.</>, Sharrq),
  change(date(2024, 8, 18), <>Added <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} /> to the timeline buff tracking.</>, Sharrq),
  change(date(2024, 8, 18), <>Updated <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} />'s uptime graph to also show stack counts.</>, Sharrq),
  change(date(2024, 8, 18), <>Fixed several issues in <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} /> tracking.</>, Sharrq),
  change(date(2024, 8, 18), <>Fixed a bug that was causing <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} /> buff durations to get calculated incorrectly.</>, Sharrq),
  change(date(2024, 8, 18), <>Moved <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> to use clickable performance boxes that provide more granular detail.</>, Sharrq),
  change(date(2024, 8, 18), <>Moved <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> and <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> to use detailed cast breakdowns</>, Sharrq),
  change(date(2024, 8, 18), <>Fixed an issue that was causing <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> to always say it was cast with 0 <SpellLink spell={SPELLS.ARCANE_CHARGE} />s.</>, Sharrq),
  change(date(2024, 8, 18), <>Updated <SpellLink spell={SPELLS.ARCANE_CHARGE} /> tracking to be more reliable and accurate.</>, Sharrq),
  change(date(2024, 8, 18), <>Added support for <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />, <SpellLink spell={TALENTS.PRESENCE_OF_MIND_TALENT} />, and <SpellLink spell={TALENTS.SUPERNOVA_TALENT} />.</>, Sharrq),
  change(date(2024, 8, 10), <>Fixed an issue that was causing <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> to always say it had 4 <SpellLink spell={SPELLS.ARCANE_CHARGE} />s due to an issue with the way the combat log orders events.</>, Sref),
  change(date(2024, 7, 29), <>Enhanced Guide view for <SpellLink spell={TALENTS.SHIFTING_POWER_TALENT} /></>, Sref),
  change(date(2024, 7, 29), <>Removed ability to load Checklist.</>, Sharrq),
  change(date(2024, 7, 29), <>Increased spec support to 11.0, Partial Support.</>, Sharrq),
  change(date(2024, 7, 29), <>Added a warning to the Overview page for Prepatch.</>, Sharrq),
  change(date(2024, 7, 28), <>Added Guide view and started removing Suggestions and Checklist.</>, Sharrq),
  change(date(2024, 7, 28), <>Complete rewrite of <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />, <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />, <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />, <SpellLink spell={SPELLS.ARCANE_BARRAGE} />, <SpellLink spell={SPELLS.ARCANE_ORB} />, <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />, <SpellLink spell={TALENTS.EVOCATION_TALENT} />, and <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} />.</>, Sharrq),
];
