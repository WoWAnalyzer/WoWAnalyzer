import React from 'react';
import { Yajinni, Mamtooth, Zerotorescue, Putro, joshinator, Gebuz, ackwell, emallson, blazyb, Dambroda, Nalhan, Satyric, niseko, Khadaj, Fyruna, Matardarix, jos3p, Aelexe, Chizu, Hartra344, Hordehobbs, Dorixius, Sharrq, Scotsoo, HolySchmidt, Zeboot } from 'CONTRIBUTORS';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Contributor from 'interface/contributor/Button';

export default [
  {
    date: new Date('2019-06-16'),
    changes: 'Fixed wrong combat potion being shown in the timeline.',
    contributors: [Zeboot],
  },
  {
    date: new Date('2019-06-10'),
    changes: 'Added URL bar search support for report links.',
    contributors: [Zeboot],
  },
  {
    date: new Date('2019-06-10'),
    changes: 'Fixed an issue with some items not providing relevant cast events.',
    contributors: [Zeboot],
  },
  {
    date: new Date('2019-06-10'),
    changes: 'Added most items from the Crucible of Storms raid.',
    contributors: [Zeboot],
  },
  {
    date: new Date('2019-06-02'),
    changes: <>Added a <SpellLink id={SPELLS.IGNITION_MAGES_FUSE_BUFF.id} /> module to track usage and average haste gained.</>,
    contributors: [HolySchmidt],
  },
  {
    date: new Date('2019-05-12'),
    changes: 'Added average heart of azeroth level to the player selection page',
    contributors: [Scotsoo],
  },
  {
    date: new Date('2019-05-10'),
    changes: <>Fixed an issue where the timeline and the Cancelled Casts statistic would incorrectly mark a spell as cancelled in high latency situations.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2019-04-20'),
    changes: <>Fixed issue for mages where the timeline would show a cast as cancelled if they cast an ability that could be cast while casting (e.g. <SpellLink id={SPELLS.SHIMMER_TALENT.id} /> or <SpellLink id={SPELLS.FIRE_BLAST.id} />).</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2019-04-17'),
    changes: 'Added the Crucible of Storms raid to the character search and made it the default raid.',
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-03-30'),
    changes: 'Fixed issue where the character parses page didn\'t return any results when region wasn\'t capitalized.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-21'),
    changes: 'Added Battle of Dazar\'alor Vantus Runes so they should now be shown in the statistics.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-21'),
    changes: <>Added food buffs that were added since 8.1 so they'll correctly trigger the <i>food used</i> checklist item (<a href="https://twitter.com/BMHunterWow/status/1108717252243791873">the bug report</a>).</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-19'),
    changes: 'Improved the display of the checklist rules on mobile devices.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-16'),
    changes: <>Restructured the server setup to eliminate API downtime. The source code for the server can now be found <a href="https://github.com/WoWAnalyzer/server">here</a>.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-16'),
    changes: 'Show "TOP 100" in the throughput bar performance when eligible.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-15'),
    changes: 'Fixed an issue where the azerite levels didn\'t show up in the player selection.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-14'),
    changes: 'Fixed an issue that lead to not all azerite power icons showing up properly on the character tab.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-14'),
    changes: 'Fixed a crash in player selection when WCL sent corrupt player info.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-14'),
    changes: 'Fixed a crash when adblock is enabled.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-14'),
    changes: 'Fixed the layout of the "outdated patch" warning screen.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-14'),
    changes: 'Fixed a crash on initial load in Microsoft Edge.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-13'),
    changes: 'Updated Discord link description text.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-13'),
    changes: 'Fallback to ads for our Premium when adblock is enabled.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-13'),
    changes: 'Replaced the statistics ad with an in-feed ad that better fits the layout.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-13'),
    changes: 'Replaced the Patreon page links with direct join links to make it easier to sign up.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-12'),
    changes: 'Fixed a crash on the results page when the player info received from Warcraft Logs is corrupt (now it shows an alert instead).',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-12'),
    changes: 'Fixed a crash on the statistics tab when WCL has no rankings data (e.g. due to the 8.1.5 partitioning).',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-10'),
    changes: 'WoWAnalyzer 3.0! This is the biggest update since the release, featuring a completely new interface, with a new logo, color scheme, and various new pages and improvements to the results page including a complete rework of the timeline. Many people worked on this, thanks so much to everyone who contributed!',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-03-2'),
    changes: <>Hide checklist rules if all of the requirements beneath them are hidden/disabled.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2019-02-24'),
    changes: <>Added composition details to raid composition screen showing role counts and avarage ilvl.</>,
    contributors: [Dorixius],
  },
  {
    date: new Date('2019-02-15'),
    changes: <>If Warcraft Logs sends a corrupt JSON message, try to automatically decorrupt it.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-01-31'),
    changes: <>Fixed an issue where the "A connection error occured." message might be shown when an error occured during module initialization.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-01-31'),
    changes: <>Added <SpellLink id={SPELLS.TREACHEROUS_COVENANT.id} /> module.</>,
    contributors: [Khadaj],
  },
  {
    date: new Date('2019-01-30'),
    changes: <>Added <ItemLink id={ITEMS.CREST_OF_PAKU_ALLIANCE.id} /> analyzer and accounted for its Haste gain.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-01-30'),
    changes: <>Added <SpellLink id={SPELLS.BONDED_SOULS_TRAIT.id} /> azerite trait and accounted for its Haste gain.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-01-26'),
    changes: <>Account for Haste gained from <SpellLink id={SPELLS.OPULENCE_AMETHYST_OF_THE_SHADOW_KING.id} />.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-01-25'),
    changes: 'Add Battle of Dazar\'alor to the selectable raids in the character page filters.',
    contributors: [joshinator],
  },
  {
    date: new Date('2018-12-29'),
    changes: 'Split mitigation check into Physical and Magical.',
    contributors: [emallson, Hordehobbs],
  },
  {
    date: new Date('2018-12-20'),
    changes: 'Added better caching for character profiles from the blizzard API',
    contributors: [Hartra344],
  },
  {
    date: new Date('2018-12-10'),
    changes: 'Migraged Battle.Net API calls to to use the new blizzard.com Api endpoint',
    contributors: [Hartra344],
  },
  {
    date: new Date('2018-12-09'),
    changes: 'Fixed crashes when switching players that can get the same buff.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-12-09'),
    changes: 'Split the food check in the Be Well Prepared section of the checklist to check if food buff was present and if that food buff was high quality. Updated the suggestions to reflect this.',
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-12-09'),
    changes: 'Added a link to reports that have similiar kill-times under the Statistics tab for easier comparison.',
    contributors: [Putro],
  },
  {
    date: new Date('2018-11-15'),
    changes: <>Added <ItemLink id={ITEMS.DREAD_GLADIATORS_INSIGNIA.id} /> module.</>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-11-14'),
    changes: <>Added <SpellLink id={SPELLS.GIFT_OF_THE_NAARU_MAGE.id} /> to ability list.</>,
    contributors: [Dambroda],
  },
  {
    date: new Date('2018-11-13'),
    changes: 'Added an AverageTargetsHit module for general usage.',
    contributors: [Putro],
  },
  {
    date: new Date('2018-11-12'),
    changes: <>Added <ItemLink id={ITEMS.AZEROKKS_RESONATING_HEART.id} /> module.</>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-11-11'),
    changes: <>Added <ItemLink id={ITEMS.DISC_OF_SYSTEMATIC_REGRESSION.id} /> module.</>,
    contributors: [Matardarix],
  },
  {
    date: new Date('2018-11-11'),
    changes: <>Added <ItemLink id={ITEMS.MYDAS_TALISMAN.id} /> module.</>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-11-10'),
    changes: <>Added <ItemLink id={ITEMS.ROTCRUSTED_VOODOO_DOLL.id} /> module.</>,
    contributors: [jos3p],
  },
  {
    date: new Date('2018-11-09'),
    changes: <>Added <ItemLink id={ITEMS.REZANS_GLEAMING_EYE.id} /> module.</>,
    contributors: [Matardarix],
  },
  {
    date: new Date('2018-11-06'),
    changes: <>Added <ItemLink id={ITEMS.SYRINGE_OF_BLOODBORNE_INFIRMITY.id} /> module.</>,
    contributors: [Matardarix],
  },
  {
    date: new Date('2018-11-02'),
    changes: <>Added <SpellLink id={SPELLS.TRADEWINDS.id} /> module.</>,
    contributors: [Fyruna],
  },
  {
    date: new Date('2018-11-02'),
    changes: <>Added <SpellLink id={SPELLS.UNSTABLE_CATALYST.id} /> module.</>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-11-01'),
    changes: <>Added <SpellLink id={SPELLS.SWIRLING_SANDS.id} /> module.</>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-10-26'),
    changes: <>Added <SpellLink id={SPELLS.WOUNDBINDER.id} />, <SpellLink id={SPELLS.BRACING_CHILL.id} />, <SpellLink id={SPELLS.SYNERGISTIC_GROWTH.id} />, and <SpellLink id={SPELLS.EPHEMERAL_RECOVERY_BUFF.id} /> azerite modules. </>,
    contributors: [Khadaj],
  },
  {
    date: new Date('2018-10-26'),
    changes: <>Added <ItemLink id={ITEMS.LUSTROUS_GOLDEN_PLUMAGE.id} /> module. </>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-10-24'),
    changes: <>Added <ItemLink id={ITEMS.DREAD_GLADIATORS_BADGE.id} /> module. </>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-10-23'),
    changes: <>Added <SpellLink id={SPELLS.ARCHIVE_OF_THE_TITANS.id} /> module.</>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-10-23'),
    changes: <>Added <ItemLink id={ITEMS.DREAD_GLADIATORS_MEDALLION.id} /> module.</>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-10-22'),
    changes: <>Added <SpellLink id={SPELLS.COASTAL_SURGE.id} /> module.</>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-10-21'),
    changes: <>Added <SpellLink id={SPELLS.BLIGHTBORNE_INFUSION.id} /> module.</>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-10-17'),
    changes: <>Fixed mana usage for innervate in cooldown tabs for healers.</>,
    contributors: [blazyb],
  },
  {
    date: new Date('2018-10-06'),
    changes: <>Corrected Azerite Scaling for traits with split stat scaling (e.g. <SpellLink id={SPELLS.GEMHIDE.id} />).</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-10-06'),
    changes: <React.Fragment> Added a damage reduction module for dwarf racial <SpellLink id={SPELLS.STONEFORM.id} /> </React.Fragment>,
    contributors: [Satyric],
  },
  {
    date: new Date('2018-10-02'),
    changes: 'Added a BFA-ready food and flasker checker to the well prepared checklist, with a lot of help from ArthurEnglebert',
    contributors: [Putro],
  },
  {
    date: new Date('2018-09-30'),
    changes: 'Removed the suggestions for Healing Potions and Healthstones, and added their status to the death recap panel. The "you died" suggestions will now refer to this for more information.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-09-30'),
    changes: 'The "you had mana left" suggestion will no longer show up on wipes.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-09-30'),
    changes: 'The "you died" suggestion will no longer show up when you died within 15 seconds of a wipe.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-09-29'),
    changes: 'Added a "spec currently not supported" page, since the about panel appeared to be insufficient.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-09-29'),
    changes: 'Completely reworked the way reports are loaded to be much more maintainable. There were also some minor performance imprpvements.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-09-25'),
    changes: <> Added <SpellLink id={SPELLS.BLESSED_PORTENTS.id} /> module.</>,
    contributors: [Nalhan],
  },
  {
    date: new Date('2018-09-24'),
    changes: <> Added <SpellLink id={SPELLS.CONCENTRATED_MENDING.id} /> module. </>,
    contributors: [Nalhan],
  },
  {
    date: new Date('2018-09-24'),
    changes: <>Added <SpellLink id={SPELLS.HEED_MY_CALL.id} /> module.</>,
    contributors: [Dambroda],
  },
  {
    date: new Date('2018-09-22'),
    changes: <>Added <SpellLink id={SPELLS.GUTRIPPER.id} /> module.</>,
    contributors: [Dambroda],
  },
  {
    date: new Date('2018-09-19'),
    changes: <>Added <SpellLink id={SPELLS.OVERWHELMING_POWER.id} /> and <SpellLink id={SPELLS.BLOOD_RITE.id} /> modules.</>,
    contributors: [joshinator],
  },
  {
    date: new Date('2018-09-16'),
    changes: 'Added the players azerite traits to the character pane.',
    contributors: [joshinator],
  },
  {
    date: new Date('2018-09-17'),
    changes: 'Added Azerite trait Laser Matrix.',
    contributors: [blazyb],
  },
  {
    date: new Date('2018-09-17'),
    changes: <>Adds <ItemLink id={ITEMS.GALECALLERS_BOON.id} /> and <ItemLink id={ITEMS.HARLANS_LOADED_DICE.id} /> modules.</>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-09-17'),
    changes: <>Added a <SpellLink id={SPELLS.ELEMENTAL_WHIRL.id} /> module.</>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-09-17'),
    changes: <>Added a <ItemLink id={ITEMS.DARKMOON_DECK_FATHOMS.id} /> module.</>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-09-16'),
    changes: <>Added a <SpellLink id={SPELLS.METICULOUS_SCHEMING.id} />-module.</>,
    contributors: [joshinator],
  },
  {
    date: new Date('2018-09-12'),
    changes: 'Added support for item Seabreeze',
    contributors: [blazyb],
  },
  {
    date: new Date('2018-09-10'),
    changes: 'Added the engineering weapon enchants to the EnchantChecker and mark them as valid weapon enchants.',
    contributors: [Putro],
  },
  {
    date: new Date('2018-08-08'),
    changes: 'Moved the detail tab selection to the left side.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-08-06'),
    changes: 'If a module has a bug that causes an error it will now automatically be disabled instead of crashing.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-08-05'),
    changes: 'Linking a hunter pet doesn\'t crash the analyzer url builder anymore.',
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-08-05'),
    changes: <>Added a <SpellLink id={SPELLS.MIGHT_OF_THE_MOUNTAIN.id} /> racial contribution module. Thanks to @Iyob for the suggestion.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-08-04'),
    changes: 'Account for the 1% Critical Strike racial from Blood Elfs.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-08-03'),
    changes: <>Added an <SpellLink id={SPELLS.ARCANE_TORRENT_MANA1.id} /> module that works for all Blood Elfs.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-24'),
    changes: 'Added tracking of potion cooldowns and split Healthstone into Healthstone and health pots.',
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-07-26'),
    changes: <>Updated our GlobalCooldown module to automatically ignore certain casts if we've marked them as not being actual casts. BM Hunter casting two spells (one for buff, one for damage) per <SpellLink id={SPELLS.BARBED_SHOT.id} /> is an example.</>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-07-24'),
    changes: 'Added character information fetching from Battle.net (when possible) to gain race information and character thumbnails. The character thumbnail will now be used in the versus-header as per the original design.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-21'),
    changes: 'Added a raid health tab to healer roles.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-19'),
    changes: <>Fixed Darkmoon Deck: Promises squished mana values.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-19'),
    changes: <>Fixed a crash when wearing Drape of Shame.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-15'),
    changes: 'Added a link to the Legion analyzer in the links under the report bar.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-11'),
    changes: <>Added support for the <SpellLink id={SPELLS.GEMHIDE.id} /> trait.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-07-11'),
    changes: <>Parsing time is about 35% quicker! Thanks to <Contributor {...ackwell} /> for showing <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/1799">the idea</a> worked out in <a href="https://github.com/xivanalysis/xivanalysis">xivanalysis</a>.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-07'),
    changes: 'Implemented a system for localization. We\'ll need to manually add support for localization everywhere before things can be translated, this will take some time.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-06'),
    changes: 'Changed tooltips to be static except for large bars in the timeline.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-06'),
    changes: 'When switching fights in the results page, the selected tab will now be remembered.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-05'),
    changes: 'Added a toggle to the results page to adjust statistics for fight downtime. This is an experimental feature.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-28'),
    changes: 'Allow Warcaftlogs- & BattleNet-character-links in the report selecter.',
    contributors: [joshinator],
  },
  {
    date: new Date('2018-06-24'),
    changes: <>Changed the <SpellLink id={SPELLS.HEALTHSTONE.id} /> suggestion to always be of minor importance.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-24'),
    changes: 'Added an "About WoWAnalyzer" panel to the home page and updated the announcement.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-24'),
    changes: 'The report history panel will be hidden where there are no entries.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-23'),
    changes: 'Revamped all spells with static GCDs or base GCDs different from the class default.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-22'),
    changes: 'Added WoWAnalyzer Premium. See the announcement for more information.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-22'),
    changes: 'Added "ads" to help fund further development. The "ads" will at some point in the future turn into real ads from an ad platform.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-12'),
    changes: 'Updated character selection to default to HPS or DPS as metric, depending on characters last active spec.',
    contributors: [joshinator],
  },
  {
    date: new Date('2018-06-08'),
    changes: 'Added Healthstone/Health pots to abilities and the death recap.',
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-06-06'),
    changes: 'Fixed the character selection realm dropdown in Mozilla Firefox.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-02'),
    changes: 'Improved error handling so the app will no longer permanently stay stuck in a loading state when something unexpected happens.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-02'),
    changes: 'Fixed an issue where the character search realm matching was case-sensitive.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-01'),
    changes: <>Removed all changelog entries before June 2018, and updated spec contributors to match. If you're interested in older changelogs, visit <a href="https://legion.wowanalyzer.com/">https://legion.wowanalyzer.com/</a>.</>,
    contributors: [Zerotorescue],
  },
];
