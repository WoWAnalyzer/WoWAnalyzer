import React from 'react';

import { Yajinni, Mamtooth, Zerotorescue, Putro, joshinator, Gebuz, ackwell, emallson, blazyb, Dambroda, Nalhan, Satyric, niseko, Khadaj, Stui, Fyruna, Matardarix, jos3p, Aelexe, Chizu, Hartra344, Hordehobbs, Dorixius, Sharrq, Scotsoo, HolySchmidt, Zeboot, Abelito75, Anatta336, HawkCorrigan, Amrux, Qbz, Viridis, Juko8, fluffels, Draenal, JeremyDwayne, axelkic, Khazak, layday, Vetyst, ChristopherKiss } from 'CONTRIBUTORS';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';
import Contributor from 'interface/ContributorButton';

// prettier-ignore
export default [
  change(date(2020, 10, 6), 'Fixed guild and character search so they can be submitted.', ChristopherKiss),
  change(date(2020, 10, 4), 'Removed remaining trackers', Zerotorescue),
  change(date(2020, 10, 2), 'Updated project dependencies.', Zerotorescue),
  change(date(2020, 9, 26), 'Added a new search option to the homepage to view a list of reports for a guild.', Dambroda),
  change(date(2020, 9, 22), 'Provide an EventType to Event map to make event handlers that listen to more than one event type easier to write.', Dambroda),
  change(date(2020, 9, 22), 'Fix an issue where it wasn\'t possible to view the character page', Putro),
  change(date(2020, 9, 21), 'Fix Armory link for characters on realms that contain spaces or apostrophes', Sharrq),
  change(date(2020, 9, 20), 'Update Shadowlands warning with github link for feedback/suggestions', Sharrq),
  change(date(2020, 9, 8), 'Added a warning message for Shadowlands Prepatch.', Sharrq),
  change(date(2020, 8, 5), 'Fix an issue where changelogs wouldn\'t count in pull requests.', Putro),
  change(date(2020, 8, 4), 'Fixed a bug causing the total fight duration field to be improperly calculated, leading to confusing downtime/death percentages', Dambroda),
  change(date(2020, 7, 27), 'Updated contributor details to TypeScript and fixed contributor description not appearing when viewing those details', Dambroda),
  change(date(2020, 7, 27), 'Converted core log parser and other modules to TypeScript and added strict event typechecking to event listeners.', Dambroda),
  change(date(2020, 7, 24), 'Added missing allied races to race definitions', Dambroda),
  change(date(2020, 7, 11), 'Added shared functionality to get an array of filtered events previous to the currently processing event.', Dambroda),
  change(date(2020, 7, 6), <> Added support for <ItemLink id={ITEMS.SUBROUTINE_RECALIBRATION.id} />. </>, Putro),
  change(date(2020, 6, 27), 'Initial page load performance enhancements.', Stui),
  change(date(2020, 6, 12), 'Move various probability helpers to a shared folder.', Putro),
  change(date(2020, 6, 11), 'Added a warning to N\'zoth fight due to the different realm phases, and the combat log errors they come with.', Putro),
  change(date(2020, 6, 10), 'Fix a crash when changing your region after selecting a realm during character search.', Dambroda),
  change(date(2020, 6, 9), <> Added debuff uptime to to the <SpellLink id={SPELLS.BLOOD_OF_THE_ENEMY.id} /> module. </>, Putro),
  change(date(2020, 6, 7), 'Moved some helper functions from class/specialization folders to a shared folder', Putro),
  change(date(2020, 6, 6), <> Added uptime to to the <SpellLink id={SPELLS.ESSENCE_OF_THE_FOCUSING_IRIS.id} /> module. </>, Putro),
  change(date(2020, 6, 3), <>Updated death recap suggestion for <SpellLink id={SPELLS.HEALTHSTONE.id} />. This will only show if a Warlock participated in the selected fight.</>, Vetyst),
  change(date(2020, 6, 3), <>Removed duplicate entry of <SpellLink id={SPELLS.GUARDIAN_SPIRIT.id} /> in defensive buffs.</>, [Vetyst]),
  change(date(2020, 5, 29), 'Add a warning when the log exceeds our supported duration.', Vetyst),
  change(date(2020, 5, 27), <>Fixed a bug where <ItemLink id={ITEMS.VOID_TWISTED_TITANSHARD.id} /> showed as having done 0 healing </>, Putro),
  change(date(2020, 5, 25), 'Replaced hard-coded statistic categories with STATISTIC_CATEGORY.', Vetyst),
  change(date(2020, 5, 18), 'Replaced duplicate FIGHT_DIFFICULTIES with DIFFICULTIES', Vetyst),
  change(date(2020, 5, 18), 'Updated patchlist', Vetyst),
  change(date(2020, 5, 14), 'Replaced hardcoded event type strings with EventType equivalent', Vetyst),
  change(date(2020, 5, 13), 'Disallow use of ++ and -- to adhere to the style guide', Putro),
  change(date(2020, 5, 12), 'Tweak JetBrains codeStyles file to better adhere to code style, while allowing for auto-formatting all files in the repository.', Vetyst),
  change(date(2020, 5, 12), 'Reduced avatar and article image file sizes.', Vetyst),
  change(date(2020, 4, 26), <>Added <SpellLink id={SPELLS.BLOOD_FURY_PHYSICAL.id} /> to the core parser. </>, Putro),
  change(date(2020, 4, 16), <>Fixed a bug where the haste value gained <SpellLink id={SPELLS.ESSENCE_OF_THE_FOCUSING_IRIS_RANK_THREE_FOUR.id} /> minor was extremely low if the buff never fell off.</>, Putro),
  change(date(2020, 4, 14), <>Using <ItemLink id={ITEMS.AZSHARAS_FONT_OF_POWER.id} /> no longer shows as downtime during the channel.</>, Sharrq),
  change(date(2020, 3, 30), <>Added <SpellLink id={SPELLS.FLASH_OF_INSIGHT.id} />.</>, niseko),
  change(date(2020, 3, 30), <>Added <SpellLink id={SPELLS.SEVERE_T3.id} /> <SpellLink id={SPELLS.EXPEDIENT_T3.id} /> <SpellLink id={SPELLS.MASTERFUL_T3.id} /> <SpellLink id={SPELLS.VERSATILE_T3.id} />.</>, niseko),
  change(date(2020, 3, 30), <>Added <SpellLink id={SPELLS.ESSENCE_OF_THE_FOCUSING_IRIS_RANK_THREE_FOUR.id} /> and <SpellLink id={SPELLS.FOCUSED_ENERGY_BUFF.id} />.</>, Putro),
  change(date(2020, 3, 29), 'Add the possibility to modify stat multipliers to be able to support some of the new corruption effects.', niseko),
  change(date(2020, 3, 16), <>Adjusted <ItemLink id={ITEMS.ASHJRAKAMAS_SHROUD_OF_RESOLVE.id} /> for hotfixes.</>, niseko),
  change(date(2020, 3, 6), 'Fixed an issue where Vantus Runes weren\'t working as intended.', niseko),
  change(date(2020, 3, 4), 'Fix a bug where having multiple of the same corruption didn\'t count towards corruption total', Putro),
  change(date(2020, 2, 28), <>Added the primary stat proc of <ItemLink id={ITEMS.ASHJRAKAMAS_SHROUD_OF_RESOLVE.id} />.</>, niseko),
  change(date(2020, 2, 21), <>Added the possibility of adding item warnings, and added a warning for people using <ItemLink id={ITEMS.WHISPERING_ELDRITH_BOW.id} />.</>, Putro),
  change(date(2020, 2, 21), <>Added <SpellLink id={SPELLS.SYMBIOTIC_PRESENCE.id} />.</>, niseko),
  change(date(2020, 2, 17), <>Added <ItemLink id={ITEMS.FORBIDDEN_OBSIDIAN_CLAW.id} /> and <ItemLink id={ITEMS.HUMMING_BLACK_DRAGONSCALE.id} />.</>, niseko),
  change(date(2020, 2, 14), <>Updated <SpellLink id={SPELLS.VOID_RITUAL_BUFF.id} /> and <SpellLink id={SPELLS.SURGING_VITALITY_BUFF.id} /> with the hotfixed stat values.</>, niseko),
  change(date(2020, 2, 13), 'Add a warning to the Skitra encounter page as the logs for the fight are only accurate if the analyzed player is the one logging.', Putro),
  change(date(2020, 2, 12), 'Implemented a corruption overview on the character page.', Putro),
  change(date(2020, 2, 12), 'Fixed a bug that breaks the player selection when there is incomplete information from warcraftlogs.', niseko),
  change(date(2020, 2, 9), 'Added statistics for the 8.3 Alchemist Stones.', niseko),
  change(date(2020, 2, 5), <> Implemented <ItemLink id={ITEMS.VOID_TWISTED_TITANSHARD.id} />, <ItemLink id={ITEMS.VITA_CHARGED_TITANSHARD.id} /> as well as an individual statistic for the set bonus <SpellLink id={SPELLS.TITANIC_EMPOWERMENT.id} />. </>, Putro),
  change(date(2020, 2, 5), <>Added <SpellLink id={SPELLS.HONED_MIND_BUFF.id} />, <SpellLink id={SPELLS.SURGING_VITALITY_BUFF.id} />, <SpellLink id={SPELLS.RACING_PULSE_BUFF.id} /> and <SpellLink id={SPELLS.DEADLY_MOMENTUM_BUFF.id} />.</>, niseko),
  change(date(2020, 2, 5), <>Added <SpellLink id={SPELLS.VOID_RITUAL_BUFF.id} />.</>, niseko),
  change(date(2020, 2, 5), <>Added <SpellLink id={SPELLS.SIPHONER_T3.id} /> and fixed leech stat values in parses using this corruption.</>, niseko),
  change(date(2020, 1, 30), <>Fixed bug in calcuating bonus crit damage from <SpellLink id={SPELLS.BLOOD_OF_THE_ENEMY.id} />.</>, Khazak),
  change(date(2020, 1, 27), <>Added <SpellLink id={SPELLS.INEFFABLE_TRUTH_BUFF.id} />.</>, niseko),
  change(date(2020, 1, 27), 'Added basic corruption effect support.', niseko),
  change(date(2020, 1, 24), 'Updated Zone list to include Ny\'alotha bosses.', Putro),
  change(date(2020, 1, 20), 'Updated Azerite Trait info for Patch 8.3.', emallson),
  change(date(2020, 1, 16), 'Added Ny\'alotha boss information and phases.', Sharrq),
  change(date(2020, 1, 15), 'Changed the stat values statistic layout.', Zerotorescue),
  change(date(2020, 1, 12), <>Added <SpellLink id={SPELLS.BLOOD_OF_THE_ENEMY.id} />.</>, Khazak),
  change(date(2020, 1, 4), 'Converted Event Filtering to TypeScript.', Zeboot),
  change(date(2020, 1, 4), 'Fixed bug causing timefilter input to stop responding.', Zeboot),
  change(date(2020, 1, 1), 'Updated code integration tests to be more maintainable.', Zerotorescue),
  change(date(2020, 1, 1), 'Added statistic for Strife.', Abelito75),
  change(date(2019, 12, 31), 'Replaced TravisCI build pipelines with GitHub actions workflows.', Zerotorescue),
  change(date(2019, 12, 29), 'Updated Combatant to typescript', [HawkCorrigan]),
  change(date(2019, 12, 27), 'Indicate elemental shaman has been updated for 8.2.5 and update the example log', Draenal),
  change(date(2019, 12, 23), 'Fixed early DoT refresh extension check.', layday),
  change(date(2019, 12, 17), 'Fixed integration testing code with new build support.', [emallson]),
  change(date(2019, 12, 16), 'Updated internal test tools to use new API URL.', [emallson]),
  change(date(2019, 12, 15), 'Fix spell icons in cooldowns tab.', [Zerotorescue]),
  change(date(2019, 12, 15), 'Added an available raid buffs panel to the player selection page.', [axelkic, Zerotorescue]),
  change(date(2019, 12, 14), 'Converted CastEfficiency to TypeScript and refactor it a bit.', Zerotorescue),
  change(date(2019, 12, 13), 'Added a confirm dialog to the keybinding (l) to open the current page in your development environment.', Zerotorescue),
  change(date(2019, 12, 13), 'Added TypeScript support to the codebase. See Discord for more info.', Zerotorescue),
  change(date(2019, 12, 8), <>Reduced likely hood to accidnetly go to unintended page.</>, Abelito75),
  change(date(2019, 11, 14), 'Added the ability to define different rotations for analysis (like no icelance for frost mages)', Zeboot),
  change(date(2019, 10, 25), <>Fixed a bug in the dispels module.</>, Khadaj),
  change(date(2019, 10, 25), <>Added missing spell information for resource refunds and gains from <SpellLink id={SPELLS.LUCID_DREAMS_MINOR.id} /> and <SpellLink id={SPELLS.VISION_OF_PERFECTION.id} />.</>, Juko8),
  change(date(2019, 10, 24), <>Replaced the activity time statistic icons that had outgrown their space with smaller ones. <small>I only fixed it for <a href="https://hacktoberfest.digitalocean.com/">the shirt</a>.</small></>, Zerotorescue),
  change(date(2019, 10, 24), 'Updated nodejs for docker.', JeremyDwayne),
  change(date(2019, 10, 19), <>Fixed an issue in the character tab caused it to break for logs without essences.</>, Draenal),
  change(date(2019, 10, 13), <>Added extra information and cleaned up Vantus Rune infographic.</>, Abelito75),
  change(date(2019, 10, 13), <>Added <ItemLink id={ITEMS.RAZOR_CORAL.id} />.</>, Zeboot),
  change(date(2019, 10, 13), 'Added event filter to cooldown to view only events during a selected cooldown.', Zeboot),
  change(date(2019, 10, 13), <>Added <ItemLink id={ITEMS.BLOODTHIRSTY_URCHIN.id} />.</>, Zeboot),
  change(date(2019, 10, 13), <>Added <ItemLink id={ITEMS.DRIBBLING_INKPOD.id} />.</>, Zeboot),
  change(date(2019, 10, 2), <>Added Potion of Empowered Proximity for the potion checker.</>, Abelito75),
  change(date(2019, 10, 2), <>Fixed an issue in Cast Efficiency that caused spells to have a time on CD higher than 100%.</>, Sharrq),
  change(date(2019, 9, 30), <>Adjusted phase transitions for Orgozoa, Za'qul, and Queen Azshara to be more accurate.</>, Sharrq),
  change(date(2019, 9, 24), <>Updated channeling code to take into account downtime from items like <ItemLink id={ITEMS.AZSHARAS_FONT_OF_POWER.id} /> and to display them on the timeline.</>, Yajinni),
  change(date(2019, 9, 24), <>Added <ItemLink id={ITEMS.AZSHARAS_FONT_OF_POWER.id} />.</>, Yajinni),
  change(date(2019, 9, 20), <>Added <ItemLink id={ITEMS.CYCLOTRONIC_BLAST.id} />.</>, Juko8),
  change(date(2019, 9, 20), 'Added 8.2 gems', Juko8),
  change(date(2019, 9, 16), <>Changed how cast efficiency is tracked for spells with charges <em>and</em> charge refunds (mostly <SpellLink id={SPELLS.JUDGMENT_CAST_PROTECTION.id} />).</>, emallson),
  change(date(2019, 9, 11), 'Fight statistics in the character panel now include the most used essences.', niseko),
  change(date(2019, 9, 10), 'Added a cast time column to the mana efficiency module.', niseko),
  change(date(2019, 9, 9), <>Added <ItemLink id={ITEMS.POTION_OF_FOCUSED_RESOLVE.id} />.</>, Sharrq),
  change(date(2019, 9, 8), <>Fixed issue with <ItemLink id={ITEMS.ENCHANT_WEAPON_FORCE_MULTIPLIER.id} /> and Critical Strike.</>, emallson),
  change(date(2019, 9, 7), <>Added <ItemLink id={ITEMS.ENCHANT_WEAPON_FORCE_MULTIPLIER.id} /></>, emallson),
  change(date(2019, 9, 6), 'Remove references to deprecated React lifecycle methods.', fluffels),
  change(date(2019, 9, 5), 'Fixed a calculation error affecting time spent casting in some cases.', niseko),
  change(date(2019, 8, 27), <>Added check to remove <SpellLink id={SPELLS.WINDWALKING.id} /> from dispel infographic. </>, Abelito75),
  change(date(2019, 8, 27), <>Updated <SpellLink id={SPELLS.CONCENTRATED_FLAME.id} /> to take into account 2 charges at rank 3 and up.</>, Yajinni),
  change(date(2019, 8, 26), 'Normalized the location of visions of perfections reduced cd calculator.', Abelito75),
  change(date(2019, 8, 22), 'Updated cooldown tab so it includes absorbed damage for dps.', Abelito75),
  change(date(2019, 8, 22), 'Added Spell IDs and the stacking haste buff from Condensed Life Force.', Sharrq),
  change(date(2019, 8, 22), <><SpellLink id={SPELLS.LUCID_DREAMS.id} /> minor for rage refund added. Shouldn't show up as missing id in rage-useage now.</>, Abelito75),
  change(date(2019, 8, 20), 'Fixed potential crash of phase fabrication during mixed filter usage.', Zeboot),
  change(date(2019, 8, 16), 'Added event filter to death recap to view only pre-death events.', Zeboot),
  change(date(2019, 8, 16), 'Added Heart of Azeroth Essences to Character Info panel.', [Viridis]),
  change(date(2019, 8, 14), 'Fixed potential crash of phase fabrication during mixed filter usage.', Zeboot),
  change(date(2019, 8, 12), 'Added more phase trigger types to improve our phase detection.', Zeboot),
  change(date(2019, 8, 12), <>Added <SpellLink id={SPELLS.LOYAL_TO_THE_END.id} /> azerite trait.</>, Khadaj),
  change(date(2019, 8, 7), <>Updated <SpellLink id={SPELLS.CONCENTRATED_FLAME.id} /> healing calculation.</>, Yajinni),
  change(date(2019, 8, 6), <>Added <ItemLink id={ITEMS.POTION_OF_WILD_MENDING.id} />.</>, niseko),
  change(date(2019, 8, 6), <>Added <SpellLink id={SPELLS.WELL_OF_EXISTENCE_MAJOR.id} /></>, Qbz),
  change(date(2019, 8, 6), 'Made it easier to rollback to older versions of the app in case of issues.', Zerotorescue),
  change(date(2019, 8, 6), 'General responsive improvements for better mobile experience.', Amrux),
  change(date(2019, 8, 6), <>Shows <SpellLink id={SPELLS.ABYSSAL_HEALING_POTION.id} /> in death recap now!</>, Abelito75),
  change(date(2019, 8, 3), 'Keep track of disabled modules names during production.', Zeboot),
  change(date(2019, 8, 3), 'Made the error handler more resilient to errors in browser extensions.', Zerotorescue),
  change(date(2019, 8, 3), 'Changed polyfilling so we might accidentally support more old and/or shitty browsers.', Zerotorescue),
  change(date(2019, 8, 3), 'Updated to create-react-app 3 and made the development environment easier to update.', Zerotorescue),
  change(date(2019, 8, 2), 'Added \'degraded experience\' toaster in case of disabled modules.', Zeboot),
  change(date(2019, 8, 2), <>Fixed the Haste value of <SpellLink id={SPELLS.EVER_RISING_TIDE_MAJOR.id} /></>, niseko),
  change(date(2019, 7, 27), 'Added Unbridled Fury to the list of strong pre-potions.', emallson),
  change(date(2019, 7, 27), <>Added <SpellLink id={SPELLS.NULL_DYNAMO.id} /> essence.</>, emallson),
  change(date(2019, 7, 25), 'Fixed a crash in the Ever-Rising Tide Module', HawkCorrigan),
  change(date(2019, 7, 23), 'Added 8.2 weapon enchants.', Zeboot),
  change(date(2019, 7, 21), 'Update error logging to reduce overhead.', Zerotorescue),
  change(date(2019, 7, 20), 'Added news article about time filtering.', Zeboot),
  change(date(2019, 7, 20), 'Allow for repeated phases in bossfights (e.g. Lady Ashvane / Radiance of Azshara).', Zeboot),
  change(date(2019, 7, 20), 'Made time filtering potion whitelist import from the potions module to avoid having to update separately each patch.', Zeboot),
  change(date(2019, 7, 20), <>Fixed <SpellLink id={SPELLS.CONCENTRATED_FLAME.id} /> not accounting for absorbs.</>, [Zeboot]),
  change(date(2019, 7, 20), 'Show changelog entries along with news on the frontpage.', [Zerotorescue]),
  change(date(2019, 7, 20), <>Removed ads by Google and most ad spots as they were not worth the degraded experience for you guys. Instead, please consider a monthly donation on <a href="https://www.patreon.com/wowanalyzer">Patreon</a> to support the project and unlock Premium, or bounty tickets on <a href="https://www.bountysource.com/teams/wowanalyzer">BountySource</a> for contributors to solve (currently active bounties: $1,550).</>, [Zerotorescue]),
  change(date(2019, 7, 20), <>Added <SpellLink id={SPELLS.WORLDVEIN_RESONANCE.id} /> essence.</>, [Anatta336]),
  change(date(2019, 7, 20), 'Updated the build process to ensure every new pull request has a changelog entry.', Zerotorescue),
  change(date(2019, 7, 19), 'Added boss configs and phase info for Eternal Palace.', [Sharrq]),
  change(date(2019, 7, 16), 'Added the ability to filter the results by time period.', [Zeboot]),
  change(date(2019, 7, 16), 'Added the ability to filter the results by phases.', [Zeboot]),
  change(date(2019, 7, 12), <>Added Major <SpellLink id={SPELLS.CONCENTRATED_FLAME.id} /> and Minor <SpellLink id={SPELLS.ANCIENT_FLAME.id} /> essences.</>, [Yajinni]),
  change(date(2019, 6, 25), 'Changed the search character default to the Eternal Palace raid.', [Yajinni]),
  change(date(2019, 6, 25), <>Added <SpellLink id={SPELLS.EVER_RISING_TIDE_MAJOR.id} /> and <SpellLink id={SPELLS.EVER_RISING_TIDE.id} /> essences.</>, [niseko]),
  change(date(2019, 6, 19), 'Added Eternal Palace raid information to zones.', [Yajinni]),
  change(date(2019, 6, 16), <>Fixed issue where Cooldown's Even more button would cause the website to crash. </>, [Abelito75, Zeboot]),
  change(date(2019, 6, 16), 'Fixed issues with shared CDs (like potions) in the timeline.', [Zeboot]),
  change(date(2019, 6, 10), 'Added URL bar search support for report links.', [Zeboot]),
  change(date(2019, 6, 10), 'Fixed an issue with some items not providing relevant cast events.', [Zeboot]),
  change(date(2019, 6, 10), 'Added most items from the Crucible of Storms raid.', [Zeboot]),
  change(date(2019, 6, 2), <>Added a <SpellLink id={SPELLS.IGNITION_MAGES_FUSE_BUFF.id} /> module to track usage and average haste gained.</>, [HolySchmidt]),
  change(date(2019, 5, 12), 'Added average heart of azeroth level to the player selection page', [Scotsoo]),
  change(date(2019, 5, 10), <>Fixed an issue where the timeline and the Cancelled Casts statistic would incorrectly mark a spell as cancelled in high latency situations.</>, [Sharrq]),
  change(date(2019, 4, 20), <>Fixed issue for mages where the timeline would show a cast as cancelled if they cast an ability that could be cast while casting (e.g. <SpellLink id={SPELLS.SHIMMER_TALENT.id} /> or <SpellLink id={SPELLS.FIRE_BLAST.id} />).</>, [Sharrq]),
  change(date(2019, 4, 17), 'Added the Crucible of Storms raid to the character search and made it the default raid.', [Yajinni]),
  change(date(2019, 3, 30), 'Fixed issue where the character parses page didn\'t return any results when region wasn\'t capitalized.', [Zerotorescue]),
  change(date(2019, 3, 21), 'Added Battle of Dazar\'alor Vantus Runes so they should now be shown in the statistics.', [Zerotorescue]),
  change(date(2019, 3, 21), <>Added food buffs that were added since 8.1 so they'll correctly trigger the <i>food used</i> checklist item (<a href="https://twitter.com/BMHunterWow/status/1108717252243791873">the bug report</a>).</>, [Zerotorescue]),
  change(date(2019, 3, 19), 'Improved the display of the checklist rules on mobile devices.', [Zerotorescue]),
  change(date(2019, 3, 16), <>Restructured the server setup to eliminate API downtime. The source code for the server can now be found <a href="https://github.com/WoWAnalyzer/server">here</a>.</>, [Zerotorescue]),
  change(date(2019, 3, 16), 'Show "TOP 100" in the throughput bar performance when eligible.', [Zerotorescue]),
  change(date(2019, 3, 15), 'Fixed an issue where the azerite levels didn\'t show up in the player selection.', [Zerotorescue]),
  change(date(2019, 3, 14), 'Fixed an issue that lead to not all azerite power icons showing up properly on the character tab.', [Zerotorescue]),
  change(date(2019, 3, 14), 'Fixed a crash in player selection when WCL sent corrupt player info.', [Zerotorescue]),
  change(date(2019, 3, 14), 'Fixed a crash when adblock is enabled.', [Zerotorescue]),
  change(date(2019, 3, 14), 'Fixed the layout of the "outdated patch" warning screen.', [Zerotorescue]),
  change(date(2019, 3, 14), 'Fixed a crash on initial load in Microsoft Edge.', [Zerotorescue]),
  change(date(2019, 3, 13), 'Updated Discord link description text.', [Zerotorescue]),
  change(date(2019, 3, 13), 'Fallback to ads for our Premium when adblock is enabled.', [Zerotorescue]),
  change(date(2019, 3, 13), 'Replaced the statistics ad with an in-feed ad that better fits the layout.', [Zerotorescue]),
  change(date(2019, 3, 13), 'Replaced the Patreon page links with direct join links to make it easier to sign up.', [Zerotorescue]),
  change(date(2019, 3, 12), 'Fixed a crash on the results page when the player info received from Warcraft Logs is corrupt (now it shows an alert instead).', [Zerotorescue]),
  change(date(2019, 3, 12), 'Fixed a crash on the statistics tab when WCL has no rankings data (e.g. due to the 8.1.5 partitioning).', [Zerotorescue]),
  change(date(2019, 3, 10), 'WoWAnalyzer 3.0! This is the biggest update since the release, featuring a completely new interface, with a new logo, color scheme, and various new pages and improvements to the results page including a complete rework of the timeline. Many people worked on this, thanks so much to everyone who contributed!', [Zerotorescue]),
  change(date(2019, 3, 2), <>Hide checklist rules if all of the requirements beneath them are hidden/disabled.</>, [Sharrq]),
  change(date(2019, 2, 24), <>Added composition details to raid composition screen showing role counts and avarage ilvl.</>, [Dorixius]),
  change(date(2019, 2, 15), <>If Warcraft Logs sends a corrupt JSON message, try to automatically decorrupt it.</>, [Zerotorescue]),
  change(date(2019, 1, 31), <>Fixed an issue where the "A connection error occured." message might be shown when an error occured during module initialization.</>, [Zerotorescue]),
  change(date(2019, 1, 31), <>Added <SpellLink id={SPELLS.TREACHEROUS_COVENANT.id} /> module.</>, [Khadaj]),
  change(date(2019, 1, 30), <>Added <ItemLink id={ITEMS.CREST_OF_PAKU_ALLIANCE.id} /> analyzer and accounted for its Haste gain.</>, [Zerotorescue]),
  change(date(2019, 1, 30), <>Added <SpellLink id={SPELLS.BONDED_SOULS_TRAIT.id} /> azerite trait and accounted for its Haste gain.</>, [Zerotorescue]),
  change(date(2019, 1, 26), <>Account for Haste gained from <SpellLink id={SPELLS.OPULENCE_AMETHYST_OF_THE_SHADOW_KING.id} />.</>, [Zerotorescue]),
  change(date(2019, 1, 25), 'Add Battle of Dazar\'alor to the selectable raids in the character page filters.', [joshinator]),
  change(date(2018, 12, 29), 'Split mitigation check into Physical and Magical.', [emallson, Hordehobbs]),
  change(date(2018, 12, 20), 'Added better caching for character profiles from the blizzard API', [Hartra344]),
  change(date(2018, 12, 10), 'Migraged Battle.Net API calls to to use the new blizzard.com Api endpoint', [Hartra344]),
  change(date(2018, 12, 9), 'Fixed crashes when switching players that can get the same buff.', [Chizu]),
  change(date(2018, 12, 9), 'Split the food check in the Be Well Prepared section of the checklist to check if food buff was present and if that food buff was high quality. Updated the suggestions to reflect this.', [Yajinni]),
  change(date(2018, 12, 9), 'Added a link to reports that have similiar kill-times under the Statistics tab for easier comparison.', [Putro]),
  change(date(2018, 11, 15), <>Added <ItemLink id={ITEMS.DREAD_GLADIATORS_INSIGNIA.id} /> module.</>, [Aelexe]),
  change(date(2018, 11, 14), <>Added <SpellLink id={SPELLS.GIFT_OF_THE_NAARU_MAGE.id} /> to ability list.</>, [Dambroda]),
  change(date(2018, 11, 13), 'Added an AverageTargetsHit module for general usage.', [Putro]),
  change(date(2018, 11, 12), <>Added <ItemLink id={ITEMS.AZEROKKS_RESONATING_HEART.id} /> module.</>, [Aelexe]),
  change(date(2018, 11, 11), <>Added <ItemLink id={ITEMS.DISC_OF_SYSTEMATIC_REGRESSION.id} /> module.</>, [Matardarix]),
  change(date(2018, 11, 11), <>Added <ItemLink id={ITEMS.MYDAS_TALISMAN.id} /> module.</>, [Aelexe]),
  change(date(2018, 11, 10), <>Added <ItemLink id={ITEMS.ROTCRUSTED_VOODOO_DOLL.id} /> module.</>, [jos3p]),
  change(date(2018, 11, 9), <>Added <ItemLink id={ITEMS.REZANS_GLEAMING_EYE.id} /> module.</>, [Matardarix]),
  change(date(2018, 11, 6), <>Added <ItemLink id={ITEMS.SYRINGE_OF_BLOODBORNE_INFIRMITY.id} /> module.</>, [Matardarix]),
  change(date(2018, 11, 2), <>Added <SpellLink id={SPELLS.TRADEWINDS.id} /> module.</>, [Fyruna]),
  change(date(2018, 11, 2), <>Added <SpellLink id={SPELLS.UNSTABLE_CATALYST.id} /> module.</>, [niseko]),
  change(date(2018, 11, 1), <>Added <SpellLink id={SPELLS.SWIRLING_SANDS.id} /> module.</>, [niseko]),
  change(date(2018, 10, 26), <>Added <SpellLink id={SPELLS.WOUNDBINDER.id} />, <SpellLink id={SPELLS.BRACING_CHILL.id} />, <SpellLink id={SPELLS.SYNERGISTIC_GROWTH.id} />, and <SpellLink id={SPELLS.EPHEMERAL_RECOVERY_BUFF.id} /> azerite modules. </>, [Khadaj]),
  change(date(2018, 10, 26), <>Added <ItemLink id={ITEMS.LUSTROUS_GOLDEN_PLUMAGE.id} /> module. </>, [Putro]),
  change(date(2018, 10, 24), <>Added <ItemLink id={ITEMS.DREAD_GLADIATORS_BADGE.id} /> module. </>, [Putro]),
  change(date(2018, 10, 23), <>Added <SpellLink id={SPELLS.ARCHIVE_OF_THE_TITANS.id} /> module.</>, [niseko]),
  change(date(2018, 10, 23), <>Added <ItemLink id={ITEMS.DREAD_GLADIATORS_MEDALLION.id} /> module.</>, [niseko]),
  change(date(2018, 10, 22), <>Added <SpellLink id={SPELLS.COASTAL_SURGE.id} /> module.</>, [niseko]),
  change(date(2018, 10, 21), <>Added <SpellLink id={SPELLS.BLIGHTBORNE_INFUSION.id} /> module.</>, [niseko]),
  change(date(2018, 10, 17), <>Fixed mana usage for innervate in cooldown tabs for healers.</>, [blazyb]),
  change(date(2018, 10, 6), <>Corrected Azerite Scaling for traits with split stat scaling (e.g. <SpellLink id={SPELLS.GEMHIDE.id} />).</>, [emallson]),
  change(date(2018, 10, 6), <React.Fragment> Added a damage reduction module for dwarf racial <SpellLink id={SPELLS.STONEFORM.id} /> </React.Fragment>, [Satyric]),
  change(date(2018, 10, 2), 'Added a BFA-ready food and flasker checker to the well prepared checklist, with a lot of help from ArthurEnglebert', [Putro]),
  change(date(2018, 9, 30), 'Removed the suggestions for Healing Potions and Healthstones, and added their status to the death recap panel. The "you died" suggestions will now refer to this for more information.', [Zerotorescue]),
  change(date(2018, 9, 30), 'The "you had mana left" suggestion will no longer show up on wipes.', [Zerotorescue]),
  change(date(2018, 9, 30), 'The "you died" suggestion will no longer show up when you died within 15 seconds of a wipe.', [Zerotorescue]),
  change(date(2018, 9, 29), 'Added a "spec currently not supported" page, since the about panel appeared to be insufficient.', [Zerotorescue]),
  change(date(2018, 9, 29), 'Completely reworked the way reports are loaded to be much more maintainable. There were also some minor performance imprpvements.', [Zerotorescue]),
  change(date(2018, 9, 25), <> Added <SpellLink id={SPELLS.BLESSED_PORTENTS.id} /> module.</>, [Nalhan]),
  change(date(2018, 9, 24), <> Added <SpellLink id={SPELLS.CONCENTRATED_MENDING.id} /> module. </>, [Nalhan]),
  change(date(2018, 9, 24), <>Added <SpellLink id={SPELLS.HEED_MY_CALL.id} /> module.</>, [Dambroda]),
  change(date(2018, 9, 22), <>Added <SpellLink id={SPELLS.GUTRIPPER.id} /> module.</>, [Dambroda]),
  change(date(2018, 9, 19), <>Added <SpellLink id={SPELLS.OVERWHELMING_POWER.id} /> and <SpellLink id={SPELLS.BLOOD_RITE.id} /> modules.</>, [joshinator]),
  change(date(2018, 9, 16), 'Added the players azerite traits to the character pane.', [joshinator]),
  change(date(2018, 9, 17), 'Added Azerite trait Laser Matrix.', [blazyb]),
  change(date(2018, 9, 17), <>Adds <ItemLink id={ITEMS.GALECALLERS_BOON.id} /> and <ItemLink id={ITEMS.HARLANS_LOADED_DICE.id} /> modules.</>, [Putro]),
  change(date(2018, 9, 17), <>Added a <SpellLink id={SPELLS.ELEMENTAL_WHIRL.id} /> module.</>, [Putro]),
  change(date(2018, 9, 17), <>Added a <ItemLink id={ITEMS.DARKMOON_DECK_FATHOMS.id} /> module.</>, [Putro]),
  change(date(2018, 9, 16), <>Added a <SpellLink id={SPELLS.METICULOUS_SCHEMING.id} />-module.</>, [joshinator]),
  change(date(2018, 9, 12), 'Added support for item Seabreeze', [blazyb]),
  change(date(2018, 9, 10), 'Added the engineering weapon enchants to the EnchantChecker and mark them as valid weapon enchants.', [Putro]),
  change(date(2018, 8, 8), 'Moved the detail tab selection to the left side.', [Zerotorescue]),
  change(date(2018, 8, 6), 'If a module has a bug that causes an error it will now automatically be disabled instead of crashing.', [Zerotorescue]),
  change(date(2018, 8, 5), 'Linking a hunter pet doesn\'t crash the analyzer url builder anymore.', [Mamtooth]),
  change(date(2018, 8, 5), <>Added a <SpellLink id={SPELLS.MIGHT_OF_THE_MOUNTAIN.id} /> racial contribution module. Thanks to @Iyob for the suggestion.</>, [Zerotorescue]),
  change(date(2018, 8, 4), 'Account for the 1% Critical Strike racial from Blood Elfs.', [Zerotorescue]),
  change(date(2018, 8, 3), <>Added an <SpellLink id={SPELLS.ARCANE_TORRENT_MANA1.id} /> module that works for all Blood Elfs.</>, [Zerotorescue]),
  change(date(2018, 6, 24), 'Added tracking of potion cooldowns and split Healthstone into Healthstone and health pots.', [Gebuz]),
  change(date(2018, 7, 26), <>Updated our GlobalCooldown module to automatically ignore certain casts if we've marked them as not being actual casts. BM Hunter casting two spells (one for buff, one for damage) per <SpellLink id={SPELLS.BARBED_SHOT.id} /> is an example.</>, [Putro]),
  change(date(2018, 7, 24), 'Added character information fetching from Battle.net (when possible) to gain race information and character thumbnails. The character thumbnail will now be used in the versus-header as per the original design.', [Zerotorescue]),
  change(date(2018, 7, 21), 'Added a raid health tab to healer roles.', [Zerotorescue]),
  change(date(2018, 7, 19), <>Fixed Darkmoon Deck: Promises squished mana values.</>, [Zerotorescue]),
  change(date(2018, 7, 19), <>Fixed a crash when wearing Drape of Shame.</>, [Zerotorescue]),
  change(date(2018, 7, 15), 'Added a link to the Legion analyzer in the links under the report bar.', [Zerotorescue]),
  change(date(2018, 7, 11), <>Added support for the <SpellLink id={SPELLS.GEMHIDE.id} /> trait.</>, [emallson]),
  change(date(2018, 7, 11), <>Parsing time is about 35% quicker! Thanks to <Contributor {...ackwell} /> for showing <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/1799">the idea</a> worked out in <a href="https://github.com/xivanalysis/xivanalysis">xivanalysis</a>.</>, [Zerotorescue]),
  change(date(2018, 7, 7), 'Implemented a system for localization. We\'ll need to manually add support for localization everywhere before things can be translated, this will take some time.', [Zerotorescue]),
  change(date(2018, 7, 6), 'Changed tooltips to be static except for large bars in the timeline.', [Zerotorescue]),
  change(date(2018, 7, 6), 'When switching fights in the results page, the selected tab will now be remembered.', [Zerotorescue]),
  change(date(2018, 7, 5), 'Added a toggle to the results page to adjust statistics for fight downtime. This is an experimental feature.', [Zerotorescue]),
  change(date(2018, 6, 28), 'Allow Warcaftlogs- & BattleNet-character-links in the report selecter.', [joshinator]),
  change(date(2018, 6, 24), <>Changed the <SpellLink id={SPELLS.HEALTHSTONE.id} /> suggestion to always be of minor importance.</>, [Zerotorescue]),
  change(date(2018, 6, 24), 'Added an "About WoWAnalyzer" panel to the home page and updated the announcement.', [Zerotorescue]),
  change(date(2018, 6, 24), 'The report history panel will be hidden where there are no entries.', [Zerotorescue]),
  change(date(2018, 6, 23), 'Revamped all spells with static GCDs or base GCDs different from the class default.', [Zerotorescue]),
  change(date(2018, 6, 22), 'Added WoWAnalyzer Premium. See the announcement for more information.', [Zerotorescue]),
  change(date(2018, 6, 22), 'Added "ads" to help fund further development. The "ads" will at some point in the future turn into real ads from an ad platform.', [Zerotorescue]),
  change(date(2018, 6, 12), 'Updated character selection to default to HPS or DPS as metric, depending on characters last active spec.', [joshinator]),
  change(date(2018, 6, 8), 'Added Healthstone/Health pots to abilities and the death recap.', [Gebuz]),
  change(date(2018, 6, 6), 'Fixed the character selection realm dropdown in Mozilla Firefox.', [Zerotorescue]),
  change(date(2018, 6, 2), 'Improved error handling so the app will no longer permanently stay stuck in a loading state when something unexpected happens.', [Zerotorescue]),
  change(date(2018, 6, 2), 'Fixed an issue where the character search realm matching was case-sensitive.', [Zerotorescue]),
  change(date(2018, 6, 1), <>Removed all changelog entries before June 2018, and updated spec contributors to match. If you're interested in older changelogs, visit <a href="https://legion.wowanalyzer.com/">https://legion.wowanalyzer.com/</a>.</>, [Zerotorescue]),
];
