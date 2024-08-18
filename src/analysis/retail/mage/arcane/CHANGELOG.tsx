import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Sharrq, Sref } from 'CONTRIBUTORS';

export default [
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
