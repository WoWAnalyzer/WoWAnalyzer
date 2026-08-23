import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { parseSimcAddonProfile } from '../simc/parser';
import type { ParsedSimcAddonProfile } from '../simc/contracts';
import { buildCombatantInfoEvent } from './builder';
import { INSTALLED_TALENT_SNAPSHOTS } from './data/installed';
import { decodeTalentExport } from './talents';

const TALENT_EXPORT =
  'CsPAkXBWxkyfx9CbGaHonEAhLNAzMMjZAz2MzMzMLzMjMjxYYmxgZmZmZmZmZAAAAAAAAAYMbDMgFwywEyYBzMmZGYAYYmBYmBD';
const PROFILE_TEXT = `# Pølsefatter - Frost - 2026-08-14 18:44 - EU/Argent Dawn
# SimC Addon 12.1.0-02
# WoW 12.1.0.69299, TOC 120100
# Requires SimulationCraft 1000-01 or newer

deathknight="Pølsefatter"
level=90
race=dark_iron_dwarf
region=eu
server=argent_dawn
spec=frost
talents=${TALENT_EXPORT}

# Relentless Rider's Crown (289)
head=,id=249970,enchant_id=7991,gem_id=240908,bonus_id=6652/13440
# Masterwork Sin'dorei Amulet (286)
neck=,id=240950,ilevel=286,gem_id=240983,bonus_id=12214/13667
# Midnight Blade (295)
main_hand=,id=237846,ilevel=295,enchant_id=3368
`;
const AUTHENTIC_COMBATANT_INFO_FIXTURE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../test-fixtures/derived/encounter-envelope.log',
);

function parsedProfile(): ParsedSimcAddonProfile {
  const result = parseSimcAddonProfile(PROFILE_TEXT);
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  return result.value;
}

function validOptions(profile: ParsedSimcAddonProfile = parsedProfile()) {
  const talents = decodeTalentExport(profile.talentExport, INSTALLED_TALENT_SNAPSHOTS, {
    wowVersion: '12.1.0',
  });
  if (!talents.ok) {
    throw new Error(talents.error.message);
  }
  return {
    profile,
    talents: talents.value,
    player: { name: 'PØLSEFATTER-ArgentDawn', sourceId: 17 },
    build: { gameVersion: 1, logVersion: 22 },
    timestamp: 123_456,
  } as const;
}

describe('target-dummy combatant-info builder', () => {
  it('builds a complete normalized event with positional gear, talents, and explicit defaults', () => {
    const result = buildCombatantInfoEvent(validOptions());

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.event).toMatchObject({
      type: 'combatantinfo',
      timestamp: 123_456,
      sourceID: 17,
      specID: 251,
      faction: 1,
      expansion: 'retail',
      strength: 0,
      critMelee: 0,
      mastery: 0,
      auras: [],
      talents: [],
      pvpTalents: [],
    });
    expect(result.value.event.gear).toHaveLength(18);
    expect(result.value.event.gear[0]).toEqual({
      id: 249970,
      itemLevel: 289,
      quality: 0,
      icon: 'inv_misc_questionmark',
      permanentEnchant: 7991,
      bonusIDs: [6652, 13440],
      gems: [{ id: 240908, itemLevel: 0, icon: 'inv_misc_questionmark' }],
    });
    expect(result.value.event.gear[2]).toEqual({
      id: 0,
      itemLevel: 0,
      quality: 1,
      icon: 'inv_misc_questionmark',
    });
    expect(result.value.event.gear[15]).toMatchObject({ id: 237846, itemLevel: 295 });
    expect(result.value.event.gear[16]).toMatchObject({ id: 0, itemLevel: 0 });
    expect(result.value.event.talentTree).toHaveLength(78);
    expect(result.value.event.talentTree).toContainEqual({ nodeID: 76033, id: 96161, rank: 2 });
    expect(result.value.diagnostics.map((diagnostic) => diagnostic.message)).toEqual([
      expect.stringContaining('ratings'),
      expect.stringContaining('auras'),
      expect.stringContaining('Item quality'),
    ]);
  });

  it('matches the authentic same-build combatant-info sample where /simc fields overlap', () => {
    const authenticLine = readFileSync(AUTHENTIC_COMBATANT_INFO_FIXTURE, 'utf8')
      .split('\n')
      .find((line) => line.includes('  COMBATANT_INFO,'));
    expect(authenticLine).toContain(',1,1944,513,30352,334,');
    expect(authenticLine).toContain(',251,[(76033,96161,2)],');
    expect(authenticLine).toContain('[(249970,289,(7991,0,0),(6652,13440),(240908,295))]');

    const result = buildCombatantInfoEvent(validOptions());
    expect(result).toMatchObject({
      ok: true,
      value: {
        event: {
          faction: 1,
          specID: 251,
          talentTree: expect.arrayContaining([{ nodeID: 76033, id: 96161, rank: 2 }]),
          gear: expect.arrayContaining([
            expect.objectContaining({
              id: 249970,
              itemLevel: 289,
              permanentEnchant: 7991,
              bonusIDs: [6652, 13440],
              gems: [expect.objectContaining({ id: 240908 })],
            }),
          ]),
        },
      },
    });
  });

  it('rejects character, class/spec, and exact-build mismatches with typed actions', () => {
    expect(
      buildCombatantInfoEvent({
        ...validOptions(),
        player: { name: 'Another-ArgentDawn', sourceId: 17 },
      }),
    ).toMatchObject({ ok: false, error: { code: 'SIMC_CHARACTER_MISMATCH', recoverable: true } });

    const wrongClass = { ...parsedProfile(), class: 'mage' as const };
    expect(buildCombatantInfoEvent(validOptions(wrongClass))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_CLASS_SPEC_MISMATCH' },
    });
    const wrongSpecName = { ...parsedProfile(), spec: 'unholy' };
    expect(buildCombatantInfoEvent(validOptions(wrongSpecName))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_CLASS_SPEC_MISMATCH' },
    });
    expect(
      buildCombatantInfoEvent({ ...validOptions(), build: { gameVersion: 1, logVersion: 21 } }),
    ).toMatchObject({ ok: false, error: { code: 'SIMC_UNSUPPORTED_BUILD' } });
    const wrongWowVersion = {
      ...parsedProfile(),
      provenance: { ...parsedProfile().provenance, wowVersion: '12.1.1' },
    };
    expect(buildCombatantInfoEvent(validOptions(wrongWowVersion))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_UNSUPPORTED_BUILD' },
    });
  });

  it('blocks missing item levels while allowing authentic empty slots', () => {
    const profile = parsedProfile();
    const withoutItemLevel = {
      ...profile,
      equipment: profile.equipment.map((item, index) =>
        index === 0 ? { ...item, itemLevel: undefined } : item,
      ),
    };
    expect(buildCombatantInfoEvent(validOptions(withoutItemLevel))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_MISSING_ITEM_LEVEL', message: expect.stringContaining('head') },
    });
  });

  it('requires a faction choice only for faction-ambiguous races', () => {
    const profile = { ...parsedProfile(), race: 'pandaren' };
    expect(buildCombatantInfoEvent(validOptions(profile))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_FACTION_CHOICE_REQUIRED' },
    });
    expect(buildCombatantInfoEvent({ ...validOptions(profile), factionChoice: 2 })).toMatchObject({
      ok: true,
      value: { event: { faction: 2 } },
    });
  });

  it('rejects legacy equipment slots instead of shifting current Retail slot indexes', () => {
    const profile = parsedProfile();
    const withAmmo = {
      ...profile,
      equipment: [
        ...profile.equipment,
        {
          slot: 'ammo' as const,
          itemId: 1,
          itemLevel: 1,
          gemIds: [],
          bonusIds: [],
          options: { id: '1', ilevel: '1' },
        },
      ],
    };
    expect(buildCombatantInfoEvent(validOptions(withAmmo))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_MALFORMED', message: expect.stringContaining('ammo') },
    });
  });
});
