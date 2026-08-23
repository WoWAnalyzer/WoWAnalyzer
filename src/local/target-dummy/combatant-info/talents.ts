import type { SimcProfileFailureCode, SimcResult } from '../simc/contracts';
import type { DecodedTalentLoadout, TalentTreeSnapshot } from './contracts';

const EXPORT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const SUPPORTED_SERIALIZATION_VERSION = 2;

function talentFailure(
  code: SimcProfileFailureCode,
  message: string,
  suggestedAction: string,
): SimcResult<never> {
  return { ok: false, error: { code, message, recoverable: true, suggestedAction } };
}

class ExportBitReader {
  readonly #values: readonly number[];
  #offset = 0;

  constructor(value: string) {
    this.#values = Array.from(value, (character) => EXPORT_ALPHABET.indexOf(character));
  }

  get valid(): boolean {
    return this.#values.every((value) => value >= 0);
  }

  get remainingBits(): number {
    return this.#values.length * 6 - this.#offset;
  }

  read(bitCount: number): number | undefined {
    if (bitCount < 0 || bitCount > 32 || this.remainingBits < bitCount) {
      return undefined;
    }
    let value = 0;
    for (let index = 0; index < bitCount; index += 1) {
      const absolute = this.#offset + index;
      const word = this.#values[Math.floor(absolute / 6)] ?? 0;
      const bit = (word >> (absolute % 6)) & 1;
      value += bit * 2 ** index;
    }
    this.#offset += bitCount;
    return value;
  }

  remainingIsZeroPadding(): boolean {
    while (this.remainingBits > 0) {
      if (this.read(1) !== 0) {
        return false;
      }
    }
    return true;
  }
}

interface TalentHeader {
  readonly reader: ExportBitReader;
  readonly serializationVersion: number;
  readonly specId: number;
  readonly treeHash: string;
}

function readHeader(value: string): SimcResult<TalentHeader> {
  const reader = new ExportBitReader(value);
  if (!reader.valid) {
    return talentFailure(
      'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
      "The talent loadout contains characters outside Blizzard's export alphabet.",
      'Run /simc again and copy the complete talents line without editing it.',
    );
  }
  const serializationVersion = reader.read(8);
  const specId = reader.read(16);
  const hashBytes = Array.from({ length: 16 }, () => reader.read(8));
  if (
    serializationVersion === undefined ||
    specId === undefined ||
    hashBytes.some((byte) => byte === undefined)
  ) {
    return talentFailure(
      'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
      'The talent loadout header is incomplete.',
      'Run /simc again and copy the complete addon output.',
    );
  }
  const treeHash = (hashBytes as number[])
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return { ok: true, value: { reader, serializationVersion, specId, treeHash } };
}

export function decodeTalentExportHeader(
  value: string,
): SimcResult<Omit<DecodedTalentLoadout, 'talents'>> {
  const header = readHeader(value);
  if (!header.ok) {
    return header;
  }
  return {
    ok: true,
    value: {
      serializationVersion: header.value.serializationVersion,
      specId: header.value.specId,
      treeHash: header.value.treeHash,
    },
  };
}

export function decodeTalentExport(
  value: string,
  snapshots: readonly TalentTreeSnapshot[],
  options: { readonly wowVersion?: string } = {},
): SimcResult<DecodedTalentLoadout> {
  const header = readHeader(value);
  if (!header.ok) {
    return header;
  }
  if (header.value.serializationVersion !== SUPPORTED_SERIALIZATION_VERSION) {
    return talentFailure(
      'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
      'This Blizzard talent loadout serialization version is not supported.',
      'Update the app for the current World of Warcraft talent format before exporting.',
    );
  }
  const snapshot = snapshots.find(
    (candidate) =>
      candidate.serializationVersion === header.value.serializationVersion &&
      candidate.specId === header.value.specId &&
      (candidate.treeHash?.toLowerCase() === header.value.treeHash ||
        (candidate.wowVersion !== undefined && candidate.wowVersion === options.wowVersion)),
  );
  if (snapshot === undefined) {
    return talentFailure(
      'SIMC_TALENT_TREE_HASH_MISMATCH',
      "This character's talent tree is not included for its World of Warcraft version.",
      "Update the app's generated production talent data before importing.",
    );
  }

  const talents: { nodeId: number; entryId: number; rank: number }[] = [];
  for (const node of [...snapshot.nodes].sort((left, right) => left.nodeId - right.nodeId)) {
    const selected = header.value.reader.read(1);
    if (selected === undefined) {
      return talentFailure(
        'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
        'The talent loadout ends before every tree node is described.',
        'Run /simc again and copy the complete addon output.',
      );
    }
    if (selected === 0) {
      continue;
    }
    const purchased = header.value.reader.read(1);
    if (purchased === undefined) {
      return talentFailure(
        'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
        'The talent loadout contains an incomplete selected node.',
        'Run /simc again and copy the complete addon output.',
      );
    }
    if (purchased === 0) {
      const grantedEntry = node.entryIds[0];
      if (grantedEntry === undefined) {
        return talentFailure(
          'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
          `The matching tree is missing an entry for granted node ${String(node.nodeId)}.`,
          'Update the app with a corrected talent-tree snapshot.',
        );
      }
      talents.push({ nodeId: node.nodeId, entryId: grantedEntry, rank: 1 });
      continue;
    }
    const partiallyRanked = header.value.reader.read(1);
    if (partiallyRanked === undefined) {
      return talentFailure(
        'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
        'The talent loadout contains an incomplete selected node.',
        'Run /simc again and copy the complete addon output.',
      );
    }
    const rank = partiallyRanked === 1 ? header.value.reader.read(6) : node.maxRanks;
    const choiceNode = header.value.reader.read(1);
    if (rank === undefined || choiceNode === undefined || rank <= 0 || rank > node.maxRanks) {
      return talentFailure(
        'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
        `The talent loadout contains an impossible rank for node ${String(node.nodeId)}.`,
        'Run /simc again and copy the complete addon output.',
      );
    }
    const choiceIndex = choiceNode === 1 ? header.value.reader.read(2) : 0;
    const entryId = choiceIndex === undefined ? undefined : node.entryIds[choiceIndex];
    if (entryId === undefined) {
      return talentFailure(
        'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
        'The talent loadout selects an entry that is not present in the matching tree.',
        'Run /simc again; if the error remains, update the app for the latest talent tree.',
      );
    }
    const tieredNode =
      node.nodeType === 1 || (node.nodeType === undefined && node.entryIds.length > 1);
    if (tieredNode && choiceNode === 0) {
      if (node.entryMaxRanks?.length !== node.entryIds.length) {
        return talentFailure(
          'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
          'The matching tree is missing tiered-node rank metadata.',
          'Update the app with a corrected talent-tree snapshot.',
        );
      }
      let remaining = rank;
      for (let index = 0; index < node.entryIds.length && remaining > 0; index += 1) {
        const tierEntry = node.entryIds[index];
        const tierMaximum = node.entryMaxRanks[index];
        if (tierEntry === undefined || tierMaximum === undefined || tierMaximum <= 0) {
          return talentFailure(
            'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
            'The matching tree contains invalid tiered-node rank metadata.',
            'Update the app with a corrected talent-tree snapshot.',
          );
        }
        const tierRank = Math.min(remaining, tierMaximum);
        talents.push({ nodeId: node.nodeId, entryId: tierEntry, rank: tierRank });
        remaining -= tierRank;
      }
      if (remaining !== 0) {
        return talentFailure(
          'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
          'The talent rank exceeds the matching tiered-node entries.',
          'Update the app with a corrected talent-tree snapshot.',
        );
      }
    } else {
      talents.push({ nodeId: node.nodeId, entryId, rank });
    }
  }
  if (!header.value.reader.remainingIsZeroPadding()) {
    return talentFailure(
      'SIMC_UNSUPPORTED_TALENT_SERIALIZATION',
      'The talent loadout has unexpected data after the matching talent tree.',
      'Run /simc again; if the error remains, update the app for the latest talent tree.',
    );
  }
  return {
    ok: true,
    value: {
      serializationVersion: header.value.serializationVersion,
      specId: header.value.specId,
      treeHash: header.value.treeHash,
      talents,
    },
  };
}
