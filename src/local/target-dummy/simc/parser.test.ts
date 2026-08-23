import { describe, expect, it } from 'vitest';
import { parseSimcAddonProfile } from './parser';

const PROFILE = `# Pølsefatter - Frost - 2026-08-14 18:44 - EU/Argent Dawn
# SimC Addon 12.1.0-02
# WoW 12.1.0.69299, TOC 120100
# Requires SimulationCraft 1000-01 or newer

deathknight="Pølsefatter"
level=90
race=dark_iron_dwarf
region=eu
server=argent_dawn
role=attack
professions=engineering=39/enchanting=25
spec=frost
# loot_spec=frost
talents=CsPAkXBWxkyfx9CbGaHonEAhLNAzMMjZAz2MzMzMLzMjMjxYYmxgZmZmZmZmZAAAAAAAAAYMbDMgFwywEyYBzMmZGYAYYmBYmBD

# Saved Loadout: mplus
# talents=commented-alternative
omnium_talents=136814:1/136815:1

# Relentless Rider's Crown (289)
head=,id=249970,enchant_id=7991,gem_id=240908,bonus_id=6652/13440,unknown_option=retained
# Masterwork Sin'dorei Amulet (285)
neck=,id=240950,ilevel=286,gem_id=240983,bonus_id=12214/13667,crafted_stats=40/36

### Gear from Bags
# head=,id=250459,bonus_id=6652
`;

describe('bounded SimulationCraft addon profile parser', () => {
  it('parses the official addon subset, Unicode, CRLF, provenance, and equipment metadata', () => {
    const result = parseSimcAddonProfile(PROFILE.replaceAll('\n', '\r\n'));

    expect(result).toMatchObject({
      ok: true,
      value: {
        characterName: 'Pølsefatter',
        class: 'death_knight',
        level: 90,
        race: 'dark_iron_dwarf',
        region: 'eu',
        server: 'argent_dawn',
        spec: 'frost',
        provenance: {
          addonVersion: '12.1.0-02',
          wowVersion: '12.1.0',
          wowBuild: '69299',
          tocVersion: 120100,
        },
      },
    });
    if (!result.ok) {
      throw new Error('Expected profile to parse');
    }
    expect(result.value.equipment).toEqual([
      {
        slot: 'head',
        itemId: 249970,
        itemLevel: 289,
        enchantId: 7991,
        gemIds: [240908],
        bonusIds: [6652, 13440],
        options: {
          id: '249970',
          enchant_id: '7991',
          gem_id: '240908',
          bonus_id: '6652/13440',
          unknown_option: 'retained',
        },
      },
      expect.objectContaining({
        slot: 'neck',
        itemId: 240950,
        itemLevel: 286,
        gemIds: [240983],
        bonusIds: [12214, 13667],
        options: expect.objectContaining({ crafted_stats: '40/36' }),
      }),
    ]);
  });

  it('ignores commented alternatives and rejects active non-addon instructions', () => {
    expect(parseSimcAddonProfile(`${PROFILE}\nactions=/frost_strike`)).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_NOT_ADDON_EXPORT', recoverable: true },
    });
    expect(parseSimcAddonProfile(`${PROFILE}\nwarrior="Other"`)).toMatchObject({
      ok: false,
      error: { code: 'SIMC_MULTIPLE_ACTIVE_CHARACTERS', recoverable: true },
    });
    expect(parseSimcAddonProfile(PROFILE.replace('# SimC Addon 12.1.0-02\n', ''))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_NOT_ADDON_EXPORT' },
    });
  });

  it('requires all character fields and at least one valid equipped item', () => {
    expect(parseSimcAddonProfile(PROFILE.replace(/^talents=.*$/mu, ''))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_MISSING_REQUIRED_FIELD' },
    });
    expect(parseSimcAddonProfile(PROFILE.replace('level=90', 'level=-1'))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_MALFORMED' },
    });
    expect(parseSimcAddonProfile(PROFILE.replace(/^head=.*$|^neck=.*$/gmu, ''))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_MISSING_REQUIRED_FIELD' },
    });
    expect(parseSimcAddonProfile(PROFILE.replace('id=249970', 'id=0'))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_MALFORMED' },
    });
  });

  it('accepts identical duplicates but rejects conflicting scalar, slot, and item-option values', () => {
    expect(parseSimcAddonProfile(`${PROFILE}\nspec=frost`)).toMatchObject({ ok: true });
    expect(parseSimcAddonProfile(`${PROFILE}\nspec=blood`)).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_MALFORMED' },
    });
    const head = PROFILE.match(/^head=.*$/mu)?.[0] ?? '';
    expect(parseSimcAddonProfile(`${PROFILE}\n# Duplicate (289)\n${head}`)).toMatchObject({
      ok: true,
    });
    expect(
      parseSimcAddonProfile(
        `${PROFILE}\n# Duplicate (289)\nhead=,unknown_option=retained,bonus_id=6652/13440,gem_id=240908,enchant_id=7991,id=249970`,
      ),
    ).toMatchObject({ ok: true });
    expect(parseSimcAddonProfile(`${PROFILE}\nhead=,id=123,ilevel=1`)).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_MALFORMED' },
    });
    expect(parseSimcAddonProfile(PROFILE.replace('id=249970', 'id=249970,id=123'))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_MALFORMED' },
    });
  });

  it('applies byte, line-count, and line-length limits before parsing collections', () => {
    expect(parseSimcAddonProfile('🙂'.repeat(70_000))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_TOO_LARGE' },
    });
    expect(parseSimcAddonProfile(new Array(10_001).fill('#').join('\n'))).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_TOO_LARGE' },
    });
    expect(parseSimcAddonProfile(`# ${'x'.repeat(16 * 1024 + 1)}`)).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_TOO_LARGE' },
    });
  });

  it('returns typed failures instead of throwing on malformed text', () => {
    for (const text of ['', '=', '\0', '\ud800', 'head=x,id=1/2', '🙂=x']) {
      expect(() => parseSimcAddonProfile(text)).not.toThrow();
      expect(parseSimcAddonProfile(text).ok).toBe(false);
    }
  });
});
