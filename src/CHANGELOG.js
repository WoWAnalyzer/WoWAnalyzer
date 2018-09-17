import React from 'react';

import { Mamtooth, Zerotorescue, Putro, joshinator, Gebuz, ackwell, emallson, blazyb } from 'CONTRIBUTORS';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Contributor from 'Interface/Contributor/Button';

export default [
  {
    date: new Date('2018-09-17'),
    changes: <React.Fragment>Added a <ItemLink id={ITEMS.DARKMOON_DECK_FATHOMS.id} /> module.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-09-16'),
    changes: <React.Fragment>Added a <SpellLink id={SPELLS.METICULOUS_SCHEMING.id} />-module.</React.Fragment>,
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
    changes: <React.Fragment>Added a <SpellLink id={SPELLS.MIGHT_OF_THE_MOUNTAIN.id} /> racial contribution module. Thanks to @Iyob for the suggestion.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-08-04'),
    changes: 'Account for the 1% Critical Strike racial from Blood Elfs.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-08-03'),
    changes: <React.Fragment>Added an <SpellLink id={SPELLS.ARCANE_TORRENT_MANA1.id} /> module that works for all Blood Elfs.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-24'),
    changes: 'Added tracking of potion cooldowns and split Healthstone into Healthstone and health pots.',
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-07-26'),
    changes: <React.Fragment>Updated our GlobalCooldown module to automatically ignore certain casts if we've marked them as not being actual casts. BM Hunter casting two spells (one for buff, one for damage) per <SpellLink id={SPELLS.BARBED_SHOT.id} /> is an example.</React.Fragment>,
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
    changes: <React.Fragment>Fixed Darkmoon Deck: Promises squished mana values.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-19'),
    changes: <React.Fragment>Fixed a crash when wearing <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} />.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-15'),
    changes: 'Added a link to the Legion analyzer in the links under the report bar.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-11'),
    changes: <React.Fragment>Added support for the <SpellLink id={SPELLS.GEMHIDE.id} /> trait.</React.Fragment>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-07-11'),
    changes: <React.Fragment>Parsing time is about 35% quicker! Thanks to <Contributor {...ackwell} /> for showing <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/1799">the idea</a> worked out in <a href="https://github.com/xivanalysis/xivanalysis">xivanalysis</a>.</React.Fragment>,
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
    changes: <React.Fragment>Changed the <SpellLink id={SPELLS.HEALTHSTONE.id} /> suggestion to always be of minor importance.</React.Fragment>,
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
    changes: <React.Fragment>Removed all changelog entries before June 2018, and updated spec contributors to match. If you're interested in older changelogs, visit <a href="https://legion.wowanalyzer.com/">https://legion.wowanalyzer.com/</a>.</React.Fragment>,
    contributors: [Zerotorescue],
  },
];
