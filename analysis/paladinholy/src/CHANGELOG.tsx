
import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS'
import { Abelito75, acornellier, Putro, Sref, xizbow, Zeboot } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 4, 15), <>Added Holy Power Generated Per Minute statistic </>, xizbow),
  change(date(2022, 4, 3), <>Updated phrasing on suggestion for Maraad's Dying Breath.</>, xizbow),
  change(date(2022, 3, 31), <>Fix some maraads bugs</>, xizbow),
  change(date(2022, 3, 23), <>Added <SpellLink id={SPELLS.UNTEMPERED_DEDICATION.id}/> analysis.</>, xizbow),
  change(date(2022, 3, 5), <>Added Maraads support and updated combatability to 9.2.</>, xizbow),
  change(date(2021, 11, 11), <>Corrected Aura Mastery's Active DR.</>, Abelito75),
  change(date(2021, 8, 1), <>Fixed a bug that caused the 'Inefficient Light of the Martyr' module to crash when used with Maraad's legendary.</>, Sref),
  change(date(2021, 3, 11), <>Fix <SpellLink id={SPELLS.HAMMER_OF_WRATH.id}/> cooldown, reduce recommended uptime of <SpellLink id={SPELLS.JUDGMENT_CAST_HOLY.id}/> and <SpellLink id={SPELLS.HAMMER_OF_WRATH.id}/>, and increase recommended uptime of <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id}/></>, acornellier),
  change(date(2021, 3, 10), <>Update <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id}/> mana cost</>, acornellier),
  change(date(2021, 2, 24), <>Fixed spells missing from ABC: <SpellLink id={SPELLS.WORD_OF_GLORY.id}/> <SpellLink id={SPELLS.HAMMER_OF_WRATH.id}/></>, acornellier),
  change(date(2021, 1, 16), 'Due to the paywalling of the timeline feature, and fundamental differences of opinion - I will no longer be updating this module beyond todays date. All the modules should be accurate for Castle Nathria, but will not be accurate going forward.', Abelito75),
  change(date(2021, 1, 9), <>Removed Avenging Wrath, Avenging Crusader, and Holy Avenger from the gcd.</>, Abelito75),
  change(date(2021, 1, 7), <>Update direct beacon healing to include Holy Shock.</>, Abelito75),
  change(date(2021, 1, 5), <>Update direct beacon healing to include WoG.</>, Abelito75),
  change(date(2020, 12, 21), <>Fixed a bug where glimmer wasn't being tracked to feed into beacon.</>, Abelito75),
  change(date(2020, 12, 21), <>Rewrote the checklist to not be 3 miles long.</>, Abelito75),
  change(date(2020, 12, 21), <>Fixed stat weights for logs with first events being absorb healing.</>, Abelito75),
  change(date(2020, 12, 21), <>Removed glimmer build as its default now.</>, Abelito75),
  change(date(2020, 12, 21), <>Small tweek to stat weights.</>, Abelito75),
  change(date(2020, 12, 17), <>Updated spell cooldowns!</>, Abelito75),
  change(date(2020, 12, 15), 'Bumped level of support to 9.0.2', Putro),
  change(date(2020, 12, 12), <>Add Shock Barrier!</>, Abelito75),
  change(date(2020, 12, 10), <>Fixed a bug that made devo aura inaccurate.</>, Abelito75),
  change(date(2020, 12, 10), <>Fixed bug where Light of the Martyr's ineffiecent tooltip would crash the page.</>, Abelito75),
  change(date(2020, 12, 9), <>Re-enabled stat weights :).</>, Abelito75),
  change(date(2020, 10, 18), <>Updating wording and translation tags.</>, Abelito75),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 15), <>Removed Light Of Dawn from Crusaders Might statistic box and fixed beacon uptime for glimmer players. </>, Abelito75),
  change(date(2020, 10, 14), <>Added nice graphic for DP to show how lucky or unlucky you were. </>, Abelito75),
  change(date(2020, 10, 13), <>Updated stat weight scaling. </>, Abelito75),
  change(date(2020, 8, 27), <>Updated core Holy Paladin for prepatch. </>, Abelito75),
];
