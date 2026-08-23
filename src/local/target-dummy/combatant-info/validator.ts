import { getSpecMetadata } from 'game/getSpecMetadata';

import type {
  ParsedSimcAddonProfile,
  SimcProfileFailureCode,
  SimcResult,
  WowClass,
} from '../simc/contracts';
import type { DecodedTalentLoadout } from './contracts';

export const TARGET_DUMMY_SCHEMA_ID = 'retail-12.1.0-project-1-log-22';
export const TARGET_DUMMY_WOW_VERSION = '12.1.0';
export const TARGET_DUMMY_GAME_VERSION = 1;
export const TARGET_DUMMY_LOG_VERSION = 22;

export interface TargetDummyPlayerBinding {
  readonly name: string;
  readonly sourceId: number;
}

export interface TargetDummyBuildBinding {
  readonly gameVersion: number;
  readonly logVersion: number;
  readonly wowVersion?: string;
}

export interface ValidatedCombatantInfoProfile {
  readonly faction: 1 | 2;
  readonly specId: number;
}

const CLASS_NAMES: Readonly<Record<WowClass, string>> = {
  death_knight: 'DeathKnight',
  demon_hunter: 'DemonHunter',
  druid: 'Druid',
  evoker: 'Evoker',
  hunter: 'Hunter',
  mage: 'Mage',
  monk: 'Monk',
  paladin: 'Paladin',
  priest: 'Priest',
  rogue: 'Rogue',
  shaman: 'Shaman',
  warlock: 'Warlock',
  warrior: 'Warrior',
};

const ALLIANCE_RACES = new Set([
  'dark_iron_dwarf',
  'draenei',
  'dwarf',
  'gnome',
  'human',
  'kul_tiran',
  'lightforged_draenei',
  'mechagnome',
  'night_elf',
  'void_elf',
  'worgen',
]);
const HORDE_RACES = new Set([
  'blood_elf',
  'goblin',
  'highmountain_tauren',
  'maghar_orc',
  'nightborne',
  'orc',
  'scourge',
  'tauren',
  'troll',
  'undead',
  'vulpera',
  'zandalari_troll',
]);

function failure(
  code: SimcProfileFailureCode,
  message: string,
  suggestedAction: string,
): SimcResult<never> {
  return { ok: false, error: { code, message, recoverable: true, suggestedAction } };
}

function normalizedIdentity(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
}

function normalizedLogCharacterName(value: string): string {
  return normalizedIdentity(value.split('-', 1)[0] ?? value);
}

function normalizedSpecName(value: string): string {
  return value
    .normalize('NFKC')
    .replaceAll(/[^\p{L}\p{N}]+/gu, '')
    .toLocaleLowerCase('en-US');
}

function factionForRace(race: string, factionChoice?: 1 | 2): SimcResult<1 | 2> {
  const normalizedRace = normalizedIdentity(race).replaceAll('-', '_').replaceAll(' ', '_');
  if (ALLIANCE_RACES.has(normalizedRace)) {
    return { ok: true, value: 1 };
  }
  if (HORDE_RACES.has(normalizedRace)) {
    return { ok: true, value: 2 };
  }
  if (factionChoice !== undefined) {
    return { ok: true, value: factionChoice };
  }
  return failure(
    'SIMC_FACTION_CHOICE_REQUIRED',
    `The faction for race ${race} cannot be determined unambiguously from /simc.`,
    'Choose the character faction before importing this target-dummy attempt.',
  );
}

export function validateCombatantInfoProfile(
  profile: ParsedSimcAddonProfile,
  talents: DecodedTalentLoadout,
  player: TargetDummyPlayerBinding,
  build: TargetDummyBuildBinding,
  factionChoice?: 1 | 2,
): SimcResult<ValidatedCombatantInfoProfile> {
  if (
    build.gameVersion !== TARGET_DUMMY_GAME_VERSION ||
    build.logVersion !== TARGET_DUMMY_LOG_VERSION ||
    (build.wowVersion !== undefined && build.wowVersion !== TARGET_DUMMY_WOW_VERSION) ||
    profile.provenance.wowVersion !== TARGET_DUMMY_WOW_VERSION
  ) {
    return failure(
      'SIMC_UNSUPPORTED_BUILD',
      `Target-dummy imports currently require ${TARGET_DUMMY_SCHEMA_ID}.`,
      'Use a Retail 12.1.0 project-1/log-version-22 capture and matching /simc export.',
    );
  }
  if (normalizedIdentity(profile.characterName) !== normalizedLogCharacterName(player.name)) {
    return failure(
      'SIMC_CHARACTER_MISMATCH',
      'The /simc character does not match the selected combat-log player.',
      'Select the matching player or paste /simc output from that character.',
    );
  }
  const spec = getSpecMetadata(talents.specId);
  if (
    spec === undefined ||
    CLASS_NAMES[profile.class] !== spec.className ||
    normalizedSpecName(profile.spec) !== normalizedSpecName(spec.specName)
  ) {
    return failure(
      'SIMC_CLASS_SPEC_MISMATCH',
      'The /simc class or specialization does not match the talent export specialization.',
      'Activate the intended specialization, run /simc again, and paste the complete output.',
    );
  }
  const missingItemLevel = profile.equipment.find((item) => item.itemLevel === undefined);
  if (missingItemLevel !== undefined) {
    return failure(
      'SIMC_MISSING_ITEM_LEVEL',
      `The equipped ${missingItemLevel.slot} item has no item level in /simc.`,
      'Run /simc again and ensure every equipped item includes an item level.',
    );
  }
  const faction = factionForRace(profile.race, factionChoice);
  if (!faction.ok) {
    return faction;
  }
  return { ok: true, value: { faction: faction.value, specId: talents.specId } };
}
