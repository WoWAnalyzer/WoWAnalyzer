import React from 'react';
import { Yajinni, Mamtooth, Zerotorescue, Putro, joshinator, Gebuz, ackwell, emallson, blazyb, Dambroda, Nalhan, Satyric, niseko, Khadaj, Fyruna, Matardarix, jos3p, Aelexe, Chizu, Hartra344, Hordehobbs } from 'CONTRIBUTORS';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Contributor from 'interface/contributor/Button';

export default [
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
    changes: <>Fixed a crash when wearing <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} />.</>,
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
