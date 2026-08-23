import { describe, expect, it } from 'vitest';

import type { TalentTreeSnapshot } from './contracts';
import { GENERATED_TALENT_DATA_PROVENANCE } from './data/generated';
import { INSTALLED_TALENT_SNAPSHOTS } from './data/installed';
import { decodeTalentExport, decodeTalentExportHeader } from './talents';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const VERIFIED_FROST_TOKEN =
  'CsPAkXBWxkyfx9CbGaHonEAhLNAzMMjZAz2MzMzMLzMjMjxYYmxgZmZmZmZmZAAAAAAAAAYMbDMgFwywEyYBzMmZGYAYYmBYmBD';

function talentToken(
  serializationVersion: number,
  specId: number,
  hashBytes: readonly number[],
  nodeBits: readonly { value: number; count: number }[] = [],
): string {
  const bits: number[] = [];
  const append = (value: number, count: number): void => {
    for (let index = 0; index < count; index += 1) {
      bits.push((value >> index) & 1);
    }
  };
  append(serializationVersion, 8);
  append(specId, 16);
  for (const byte of hashBytes) {
    append(byte, 8);
  }
  for (const entry of nodeBits) {
    append(entry.value, entry.count);
  }
  while (bits.length % 6 !== 0) {
    bits.push(0);
  }
  let result = '';
  for (let offset = 0; offset < bits.length; offset += 6) {
    let value = 0;
    for (let index = 0; index < 6; index += 1) {
      value += (bits[offset + index] ?? 0) * 2 ** index;
    }
    result += ALPHABET[value] ?? '';
  }
  return result;
}

const HASH_BYTES = Array.from({ length: 16 }, (_, index) => index);
const HASH = HASH_BYTES.map((byte) => byte.toString(16).padStart(2, '0')).join('');
const SINGLE_NODE_TOKEN = talentToken(2, 251, HASH_BYTES, [
  { value: 1, count: 1 },
  { value: 1, count: 1 },
  { value: 0, count: 1 },
  { value: 0, count: 1 },
]);
const SINGLE_NODE_SNAPSHOT: TalentTreeSnapshot = {
  schemaId: 'test',
  serializationVersion: 2,
  specId: 251,
  treeHash: HASH,
  nodes: [{ nodeId: 10, maxRanks: 1, entryIds: [20] }],
};

describe('Blizzard talent export decoder', () => {
  it('decodes the versioned header and an exact tree snapshot', () => {
    expect(decodeTalentExportHeader(SINGLE_NODE_TOKEN)).toEqual({
      ok: true,
      value: { serializationVersion: 2, specId: 251, treeHash: HASH },
    });
    expect(decodeTalentExport(SINGLE_NODE_TOKEN, [SINGLE_NODE_SNAPSHOT])).toEqual({
      ok: true,
      value: {
        serializationVersion: 2,
        specId: 251,
        treeHash: HASH,
        talents: [{ nodeId: 10, entryId: 20, rank: 1 }],
      },
    });
  });

  it('decodes tiered ranks into their positional entries', () => {
    const token = talentToken(2, 251, HASH_BYTES, [
      { value: 1, count: 1 },
      { value: 1, count: 1 },
      { value: 1, count: 1 },
      { value: 3, count: 6 },
      { value: 0, count: 1 },
    ]);
    const snapshot: TalentTreeSnapshot = {
      ...SINGLE_NODE_SNAPSHOT,
      nodes: [
        {
          nodeId: 10,
          maxRanks: 4,
          nodeType: 1,
          entryIds: [20, 21, 22],
          entryMaxRanks: [1, 2, 1],
        },
      ],
    };
    expect(decodeTalentExport(token, [snapshot])).toMatchObject({
      ok: true,
      value: {
        talents: [
          { nodeId: 10, entryId: 20, rank: 1 },
          { nodeId: 10, entryId: 21, rank: 2 },
        ],
      },
    });
  });

  it('fails closed for invalid tokens, versions, snapshots, ranks, and trailing data', () => {
    expect(decodeTalentExport(`${SINGLE_NODE_TOKEN}!`, [SINGLE_NODE_SNAPSHOT])).toMatchObject({
      ok: false,
      error: { code: 'SIMC_UNSUPPORTED_TALENT_SERIALIZATION', recoverable: true },
    });
    expect(decodeTalentExport(talentToken(3, 251, HASH_BYTES), [])).toMatchObject({
      ok: false,
      error: { code: 'SIMC_UNSUPPORTED_TALENT_SERIALIZATION' },
    });
    expect(decodeTalentExport(SINGLE_NODE_TOKEN, [])).toMatchObject({
      ok: false,
      error: { code: 'SIMC_TALENT_TREE_HASH_MISMATCH' },
    });
    const impossibleRank = talentToken(2, 251, HASH_BYTES, [
      { value: 1, count: 1 },
      { value: 1, count: 1 },
      { value: 1, count: 1 },
      { value: 2, count: 6 },
      { value: 0, count: 1 },
    ]);
    expect(decodeTalentExport(impossibleRank, [SINGLE_NODE_SNAPSHOT])).toMatchObject({
      ok: false,
      error: { code: 'SIMC_UNSUPPORTED_TALENT_SERIALIZATION' },
    });
    expect(decodeTalentExport(`${SINGLE_NODE_TOKEN}B`, [SINGLE_NODE_SNAPSHOT])).toMatchObject({
      ok: false,
      error: { code: 'SIMC_UNSUPPORTED_TALENT_SERIALIZATION' },
    });
  });

  it('decodes the reviewed Retail 12.1.0 Frost profile with the checked-in snapshot', () => {
    const result = decodeTalentExport(VERIFIED_FROST_TOKEN, INSTALLED_TALENT_SNAPSHOTS, {
      wowVersion: '12.1.0',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).toMatchObject({
      serializationVersion: 2,
      specId: 251,
      treeHash: 'e4155831297f712f6c8676a02701844b',
    });
    expect(result.value.talents).toHaveLength(78);
    expect(result.value.talents).toContainEqual({ nodeId: 76033, entryId: 96161, rank: 2 });
    expect(result.value.talents).toContainEqual({ nodeId: 110400, entryId: 136967, rank: 2 });
  });

  it('locks installed data to the verified schema, patch, format, and complete spec set', () => {
    expect(GENERATED_TALENT_DATA_PROVENANCE).toMatchObject({
      environment: 'live',
      wowVersion: '12.1.0',
      schemaId: 'retail-12.1.0-project-1-log-22',
      serializationVersion: 2,
      specCount: 40,
      sourceSha256: '1c5547953efe5e92c2ef31bb40087f0397f0ac42028d75273aa0487617af736f',
    });
    expect(INSTALLED_TALENT_SNAPSHOTS).toHaveLength(40);
    expect(new Set(INSTALLED_TALENT_SNAPSHOTS.map((snapshot) => snapshot.specId)).size).toBe(40);

    expect(
      decodeTalentExport(VERIFIED_FROST_TOKEN, INSTALLED_TALENT_SNAPSHOTS, {
        wowVersion: '12.1.1',
      }),
    ).toMatchObject({
      ok: false,
      error: { code: 'SIMC_TALENT_TREE_HASH_MISMATCH' },
    });
  });
});
