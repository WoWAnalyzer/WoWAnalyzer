import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { Sharrq, ToppleTheNun } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2024, 4, 8), <>Adjusted <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} /> to not show in the guide if the associated <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> buff is short (6s or less).</>, Sharrq),
  change(date(2024, 4, 8), <>Added the <SpellLink spell={TALENTS.FLAME_ACCELERANT_TALENT} /> buff to the timeline.</>, Sharrq),
  change(date(2024, 4, 8), <>Fixed a crash in <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> Active Time if a <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> buff was refreshed by a <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> cast.</>, Sharrq),
  change(date(2024, 4, 8), <>Fixed a bug that was checking for the <SpellLink spell={TALENTS.FLAME_ACCELERANT_TALENT} /> buff at the end of the fight instead of on <SpellLink spell={SPELLS.FIREBALL} /> casts.</>, Sharrq),
  change(date(2024, 4, 7), <>Added the new Guide View for Fire Mage.</>, Sharrq),
  change(date(2024, 3, 10), <>Added a check to filter out <SpellLink spell={TALENTS.FIRE_BLAST_TALENT} /> without <SpellLink spell={SPELLS.HEATING_UP} /> if it is within a second of <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> starting.</>, Sharrq),
  change(date(2024, 1, 20), <>Fixed an issue with <SpellLink spell={TALENTS.METEOR_TALENT} /> that was counting <SpellLink spell={TALENTS.FIREFALL_TALENT} /> Meteors as mistakes for not landing in <SpellLink spell={TALENTS.COMBUSTION_TALENT} />.</>, Sharrq),
  change(date(2024, 1, 17), 'Bump to 10.2.5 support.', ToppleTheNun),
  change(date(2024, 1, 3), <>Updated <SpellLink spell={SPELLS.FIREBALL} /> during <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> to disregard casts where the player had a <SpellLink spell={TALENTS.FLAME_ACCELERANT_TALENT} /> proc. Reworded the suggestion to include Double Lust and Flame Accelerant.</>, Sharrq),
  change(date(2023, 12, 31), <><SpellLink spell={TALENTS.COMBUSTION_TALENT} /> Active Time had one job, and it now does it properly. And counts in seconds instead of milliseconds.</>, Sharrq),
  change(date(2023, 12, 31), <>Adjusted <SpellLink spell={TALENTS.LIVING_BOMB_TALENT} /> to be acceptable to cast in AOE at 5+ targets.</>, Sharrq),
  change(date(2023, 12, 31), <>Fixed the wording on <SpellLink spell={TALENTS.METEOR_TALENT} /> to specify that it has to land during <SpellLink spell={TALENTS.COMBUSTION_TALENT} />.</>, Sharrq),
  change(date(2023, 12, 2), <>Fixed an issue that was causing <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> to not calculate expirations and wasted <SpellLink spell={SPELLS.HOT_STREAK} /> properly.</>, Sharrq),
  change(date(2023, 11, 30), 'Rewrote a number of modules to vastly increase performance in M+ dungeons and prevent crashes from especially long dungeon logs.', Sharrq),
  change(date(2023, 8, 20), <>Added <SpellLink spell={SPELLS.CHARRING_EMBERS_DEBUFF} />, <SpellLink spell={TALENTS.IMPROVED_SCORCH_TALENT} />, and <SpellLink spell={TALENTS.LIVING_BOMB_TALENT} /> to the Checklist.</>, Sharrq),
  change(date(2023, 8, 20), <>Removed checks for <SpellLink spell={TALENTS.FIRE_BLAST_TALENT} /> pooling.</>, Sharrq),
  change(date(2023, 8, 20), <>Adjusted <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> to not mark <SpellLink spell={SPELLS.FIREBALL} /> casts as mistakes if the player has two lust effects active.</>, Sharrq),
  change(date(2023, 8, 20), <>Added support for <SpellLink spell={TALENTS.IMPROVED_SCORCH_TALENT} />.</>, Sharrq),
  change(date(2023, 8, 3), <>Fixed an issue that was causing <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} /> to not check every <SpellLink spell={TALENTS.COMBUSTION_TALENT} />.</>, Sharrq),
  change(date(2023, 8, 3), <>Added warning to not use <SpellLink spell={TALENTS.LIVING_BOMB_TALENT} /></>, Sharrq),
  change(date(2023, 8, 2), <>Marked the spec supported for 10.1.5</>, Sharrq),
  change(date(2023, 8, 2), <>Added support for <SpellLink spell={TALENTS.UNLEASHED_INFERNO_TALENT} /></>, Sharrq),
  change(date(2023, 8, 2), <>Added tracking for wasted <SpellLink spell={SPELLS.HOT_STREAK} /> uses while <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT} /> was ready</>, Sharrq),
  change(date(2023, 8, 2), <>Updated <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} /> tracking</>, Sharrq),
  change(date(2023, 8, 2), <>Added support for <SpellLink spell={SPELLS.CHARRING_EMBERS_DEBUFF} /></>, Sharrq),
  change(date(2023, 8, 2), <>Removed <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} /> Pooling</>, Sharrq),
  change(date(2023, 8, 2), <>Added support for <SpellLink spell={SPELLS.CHARRING_EMBERS_DEBUFF} /></>, Sharrq),
  change(date(2023, 7, 10), 'Remove references to 10.1.5 removed talents.', Sharrq),
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 6, 27), <>Added <SpellLink spell={TALENTS.TEMPORAL_WARP_TALENT} /> to list of Bloodlust Buffs.</>, Sharrq),
  change(date(2023, 2, 12), <>Marked the spec supported for 10.0.5</>, Sharrq),
  change(date(2022, 12, 13), <>Removed references to Infernal Cascade and replaced with <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} /> functionality.</>, Sharrq),
  change(date(2022, 12, 13), <>Fixed <SpellLink spell={TALENTS.SHIFTING_POWER_TALENT} /> functionality.</>, Sharrq),
  change(date(2022, 12, 13), `General fixes for incorrect Spell IDs, leftover Shadowlands spells, etc.`, Sharrq),
  change(date(2022, 11, 13), `Initial pass on Dragonflight Compatability.`, Sharrq),
  change(date(2022, 11, 8), 'Remove Shadowlands covenant abilities from checklist.', ToppleTheNun),
  change(date(2022, 10, 30), `Update Dragonflight SPELLS, Abilities, and Buffs`, Sharrq),
  change(date(2022, 10, 9), 'Initial Dragonflight support', Sharrq),
];
