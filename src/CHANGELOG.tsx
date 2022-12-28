import { change, date } from 'common/changelog';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import {
  emallson,
  jazminite,
  Jonfanz,
  Khadaj,
  Putro,
  Sharrq,
  Sref,
  Tialyss,
  ToppleTheNun,
  Vireve,
} from 'CONTRIBUTORS';
import { ItemLink } from 'interface';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2022, 12, 28), 'Correct internal name for Vault of the Incarnates tier.', ToppleTheNun),
  change(date(2022, 12, 27), 'Refactor talent helper functions (hasTalent, getRepeatedTalentCount and getTalentRank) inside Combatant to only accept Talent objects.', Putro),
  change(date(2022, 12, 25), 'Fix broken lazy-loaded statistics.', ToppleTheNun),
  change(date(2022, 12, 25), 'Remove Refreshing Healing Potion and Potion of Withering Vitality from combat potion checking.', ToppleTheNun),
  change(date(2022, 12, 25), 'Stop using Wowhead beta links for Dragonflight content.', ToppleTheNun),
  change(date(2022, 12, 23), 'Add spells and re-arrange files for Classic Druids (no functionality yet).', jazminite),
  change(date(2022, 12, 20), 'Ignore duplicate spell IDs for talents during development.', ToppleTheNun),
  change(date(2022, 12, 20), 'Export additional information for each talent to help identify talents that affect the same spell (such as Berserk: X talents for Guardian Druid).', Putro),
  change(date(2022, 12, 19), 'Fixed an issue for tracking leg enhancements.', Vireve),
  change(date(2022, 12, 20), 'Fix an issue with talents that cost a decimal % of base mana', Putro),
  change(date(2022, 12, 19), 'Fix rendering issue with performance boxes on Brewmaster Monk and Restoration Druid summaries.', emallson),
  change(date(2022, 12, 19), 'Regenerate talents.', ToppleTheNun),
  change(date(2022, 12, 14), 'Remove Shadowlands items.', ToppleTheNun),
  change(date(2022, 12, 17), 'Fixed an issue with forward event lookups in Event History.', Sharrq),
  change(date(2022, 12, 14), 'Correct effect IDs for Tailoring leg enhancements.', ToppleTheNun),
  change(date(2022, 12, 14), 'Update Vantus Rune check to use Vault of the Incarnates Vantus Runes.', ToppleTheNun),
  change(date(2022, 12, 14), "Add spell data for Hoard of Draconic Delicacies and Grand Feast of the Kalu'ak.", ToppleTheNun),
  change(date(2022, 12, 13), 'Mark T28 tier set references as deprecated.', ToppleTheNun),
  change(date(2022, 12, 13), 'Add stat enhancements for foods except for feasts.', ToppleTheNun),
  change(date(2022, 12, 8), 'Updated rating per % values in StatTracker to 70 levels, and updated base mana pools in preparation for next talent regeneration', Putro),
  change(date(2022, 12, 8), 'Add support for empowered cast log events.', ToppleTheNun),
  change(date(2022, 12, 7), 'Update Vault of the Incarnates boss images.', ToppleTheNun),
  change(date(2022, 12, 6), 'Add stat enhancements for some potions and phials.', ToppleTheNun),
  change(date(2022, 12, 6), 'Add data for and analyze Dragonflight food.', ToppleTheNun),
  change(date(2022, 12, 6), 'Update flask analysis to check phials instead.', ToppleTheNun),
  change(date(2022, 12, 6), 'Localize leg enhancements.', ToppleTheNun),
  change(date(2022, 12, 6), 'Add item/spell/analysis for missing tailoring leg enhancements.', ToppleTheNun),
  change(date(2022, 12, 6), 'Add analysis for leg enhancements.', ToppleTheNun),
  change(date(2022, 12, 6), 'Add item/spell data for leg enhancements.', ToppleTheNun),
  change(date(2022, 12, 6), 'Add support for remaining potions.', ToppleTheNun),
  change(date(2022, 12, 5), <>Add support for <ItemLink id={ITEMS.FERAL_HIDE_DRUMS.id} />.</>, ToppleTheNun),
  change(date(2022, 12, 5), <>Add stats for <ItemLink id={ITEMS.DRACONIC_AUGMENT_RUNE.id} />.</>, ToppleTheNun),
  change(date(2022, 12, 5), 'Remove Shadowlands weapon enhancements from the accepted list.', ToppleTheNun),
  change(date(2022, 12, 3), 'Remove Shadowlands dungeons and raids.', ToppleTheNun),
  change(date(2022, 12, 3), 'Remove usages of Shadowlands covenants, soulbinds, conduits, and legendaries.', ToppleTheNun),
  change(date(2022, 12, 3), 'Add Dragonflight launch as the current "patch".', ToppleTheNun),
  change(date(2022, 11, 30), 'Add Dragonflight Engineering enchantments and weapon enchancements.', ToppleTheNun),
  change(date(2022, 11, 30), <>Add support for <ItemLink id={ITEMS.DRACONIC_AUGMENT_RUNE.id} />.</>, ToppleTheNun),
  change(date(2022, 11, 30), 'Add Vault of Incarnates to ZONES and remove Shadowlands raids from ZONES.', ToppleTheNun),
  change(date(2022, 11, 30), <>Add Evoker's <SpellLink id={SPELLS.FURY_OF_THE_ASPECTS} /> as a Bloodlust buff.</>, ToppleTheNun),
  change(date(2022, 11, 30), <>Add support for <ItemLink id={ITEMS.REFRESHING_HEALING_POTION_R3.id} />.</>, ToppleTheNun),
  change(date(2022, 11, 29), 'Deprecate/disable access to Shadowlands covenants, soulbinds, conduits, and legendaries.', ToppleTheNun),
  change(date(2022, 11, 29), 'Fix encounter stats broken by the talent rework.', ToppleTheNun),
  change(date(2022, 11, 29), 'Remove analysis for Shadowlands dungeon/raid/crafted items.', ToppleTheNun),
  change(date(2022, 11, 28), 'Add chevron to cooldown expandables.', ToppleTheNun),
  change(date(2022, 11, 27), 'Convert Character tab to TypeScript.', ToppleTheNun),
  change(date(2022, 11, 27), 'Add phials for Dragonflight.', ToppleTheNun),
  change(date(2022, 11, 26), 'Add potions for Dragonflight.', ToppleTheNun),
  change(date(2022, 11, 26), 'Add gems for Dragonflight.', ToppleTheNun),
  change(date(2022, 11, 26), 'Add Inscription weapon enhancements for Dragonflight.', ToppleTheNun),
  change(date(2022, 11, 21), 'Reduce usage of render props in app wrapper.', ToppleTheNun),
  change(date(2022, 11, 21), 'Convert Results to a functional component.', ToppleTheNun),
  change(date(2022, 11, 23), 'Update talent data for all specs', emallson),
  change(date(2022, 11, 21), 'Move away from legacy context APIs where possible.', ToppleTheNun),
  change(date(2022, 11, 21), 'Reduce usage of render props in Home page.', ToppleTheNun),
  change(date(2022, 11, 21), 'Convert ThroughputPerformance to a functional component.', ToppleTheNun),
  change(date(2022, 11, 21), 'Convert StatisticBox and LazyLoadStatisticBox to TypeScript.', ToppleTheNun),
  change(date(2022, 11, 21), 'Put consumables panels side-by-side in preparation section of Guides and add support for potions and flasks.', ToppleTheNun),
  change(date(2022, 11, 20), 'Update PlayerLoader to use router hooks instead of compose.', ToppleTheNun),
  change(date(2022, 11, 20), 'Convert NameSearch to a functional component.', ToppleTheNun),
  change(date(2022, 11, 20), 'Convert ReportLoader to a functional component.', ToppleTheNun),
  change(date(2022, 11, 20), 'Update FightSelection to use hooks instead of compose.', ToppleTheNun),
  change(date(2022, 11, 20), 'Fix talent display overflowing on character parses page.', ToppleTheNun),
  change(date(2022, 11, 20), 'Convert app wrapper to TypeScript.', ToppleTheNun),
  change(date(2022, 11, 20), 'Convert Home page to TypeScript.', ToppleTheNun),
  change(date(2022, 11, 18), 'Add food buff information to Preparation section of Guides.', ToppleTheNun),
  change(date(2022, 11, 18), 'Update localization files.', ToppleTheNun),
  change(date(2022, 11, 15), 'Add Classic WotLK Racials.', jazminite),
  change(date(2022, 11, 15), 'Add 10.0.2 patch information.', ToppleTheNun),
  change(date(2022, 11, 15), 'Add SuggestionSection component to help transition into Guides.', ToppleTheNun),
  change(date(2022, 11, 14), 'Add Blacksmithing weapon enhancements for Dragonflight.', ToppleTheNun),
  change(date(2022, 11, 13), 'Add weapon enhancements to preparation section of guide.', ToppleTheNun),
  change(date(2022, 11, 13), 'Hide Dragonflight warning on Classic logs that don\'t have a build selected', emallson),
  change(date(2022, 11, 12), 'Backend work on resource tracking, including light bug fixes and ability to query stats for specific time periods', Sref),
  change(date(2022, 11, 11), 'Add player icon lookup for configs to Classic specs.', jazminite),
  change(date(2022, 11, 9), 'Add spells for Classic Deathknights (no functionality yet).', jazminite),
  change(date(2022, 11, 10), 'Add missing default tooltip for preparation section of guide.', ToppleTheNun),
  change(date(2022, 11, 10), 'Hide rank for talents with only one rank.', ToppleTheNun),
  change(date(2022, 11, 9), 'Add bombs and cleanup Classic Engineering.', jazminite),
  change(date(2022, 11, 7), 'Update for Classic WCLs URL.', jazminite),
  change(date(2022, 11, 7), 'Configure Greater Spellpower enchant for WoTLK', Tialyss),
  change(date(2022, 11, 6), 'Update PlayerTile for Classic to clear console errors.', jazminite),
  change(date(2022, 11, 2), 'Add Dragonflight enchants.', ToppleTheNun),
  change(date(2022, 11, 1), 'Add Preparation section that can be included in Guides.', ToppleTheNun),
  change(date(2022, 11, 1), 'Re-add missing specs to the specializations page.', ToppleTheNun),
  change(date(2022, 10, 31), 'Add slightly more ergonomic talent cast efficiency wrapper.', ToppleTheNun),
  change(date(2022, 10, 31), 'Update patch compatibility for specs supporting Dragonflight.', ToppleTheNun),
  change(date(2022, 10, 30), 'Add Classic WotLK specs.', jazminite),
  change(date(2022, 10, 26), 'Convert most of report loading process to functions.', ToppleTheNun),
  change(date(2022, 10, 25), 'Improve patch version detection for retail and classic.', ToppleTheNun),
  change(date(2022, 10, 25), 'Exclude classic from patch version checking.', ToppleTheNun),
  change(date(2022, 10, 25), 'Add prepatch warning and add prepatch details.', ToppleTheNun),
  change(date(2022, 10, 25), 'Update stat scaling values for DF prepatch - and add values to easily swap over after prepatch ends', Putro),
  change(date(2022, 10, 24), 'Updating WOTLK Potions', Khadaj),
  change(date(2022, 10, 24), 'Updating WOTLK Foods, adding food suggestions', Khadaj),
  change(date(2022, 10, 22), 'Extract proxyRestrictedTable function for both retail and classic.', ToppleTheNun),
  change(date(2022, 10, 22), 'Add BiS Warlock Chest Enchant to Max enchants', jazminite),
  change(date(2022, 10, 22), 'Updating WOTLK to use custom spell definitions.', Khadaj),
  change(date(2022, 10, 22), 'Correct some issues with talent generation', Putro),
  change(date(2022, 10, 22), 'Updating Flask and Elixir list for WOTLK.', Khadaj),
  change(date(2022, 10, 22), 'Removing weapon enhancement checker for WOTLK.', Khadaj),
  change(date(2022, 10, 22), 'Updating Enchant list for WOTLK Classic.', Khadaj),
  change(date(2022, 10, 17), 'Use generated talent info for character pages.', ToppleTheNun),
  change(date(2022, 10, 16), 'Update SpellLink to accept Spell instances.', ToppleTheNun),
  change(date(2022, 10, 16), 'Add ability to determine if wearing T29 2pc or 4pc.', ToppleTheNun),
  change(date(2022, 10, 16), 'Adding sourceInstance to BuffEvent', Jonfanz),
  change(date(2022, 10, 14), 'Updates to EventLinkNormalizer to allow for more advanced usage.', Sref),
  change(date(2022, 10, 13), 'Adding Hyperspeed Accelerators to WOTLK analysis.', Khadaj),
  change(date(2022, 10, 13), 'Adding Frag Belt to WOTLK analysis.', Khadaj),
  change(date(2022, 10, 11), 'Remove Effusive Anima Accelerator analyzer.', ToppleTheNun),
  change(date(2022, 10, 11), 'Remove conduits and soulbinds from character page.', ToppleTheNun),
  change(date(2022, 10, 11), 'Convert Discord button to TypeScript.', ToppleTheNun),
  change(date(2022, 10, 9), 'Fixed an issue where DeathRecapTracker was being disabled by a bad Blessing of Sacrifice ID', Sref),
  change(date(2022, 10, 5), 'Add Vault of the Incarnates raid information.', ToppleTheNun),
  change(date(2022, 10, 4), 'Add Blessing of the Bronze as a raid buff.', ToppleTheNun),
  change(date(2022, 10, 3), 'Convert PreparationRule component to TypeScript.', ToppleTheNun),
  change(date(2022, 10, 3), 'Rename Shadowlands parser directory to Retail.', ToppleTheNun),
  change(date(2022, 10, 3), 'Rename TBC parser directory to Classic.', ToppleTheNun),
  change(date(2022, 10, 2), 'Update Specs page for Dragonflight.', ToppleTheNun),
  change(date(2022, 9, 23), 'Convert Character parses page to TypeScript.', ToppleTheNun),
  change(date(2022, 9, 10), 'Update known patch versions for Dragonflight.', ToppleTheNun),
  change(date(2022, 9, 10), 'Show Dragonflight talents on character page if able to detect them.', ToppleTheNun),
  change(date(2022, 9, 8), 'Bump supported versions of classic and retail.', ToppleTheNun),
  change(date(2022, 9, 8), 'Add support for Dragonflight talent detection.', emallson),
  change(date(2022, 9, 7), 'Added the beginnings of a Shared Code system to make spec maintenance easier.', Sharrq),
  change(date(2022, 8, 28), 'Add capability of auto-generating talents for Dragonflight based on gamedata', Putro),
];
