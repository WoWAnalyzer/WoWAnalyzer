export interface DecodedTalent {
  readonly nodeId: number;
  readonly entryId: number;
  readonly rank: number;
}

export interface DecodedTalentLoadout {
  readonly serializationVersion: number;
  readonly specId: number;
  readonly treeHash: string;
  readonly talents: readonly DecodedTalent[];
}

export interface TalentTreeNodeSnapshot {
  readonly nodeId: number;
  readonly maxRanks: number;
  /** Blizzard TraitNodeType: Single, Tiered, Selection, or SubTreeSelection. */
  readonly nodeType?: 0 | 1 | 2 | 3;
  readonly entryIds: readonly number[];
  /** Required for tiered nodes whose purchased ranks span several entries. */
  readonly entryMaxRanks?: readonly number[];
}

export interface TalentTreeSnapshot {
  readonly schemaId: string;
  readonly serializationVersion: number;
  readonly specId: number;
  /** Exact compatibility key when it is available from a genuine game token. */
  readonly treeHash?: string;
  /** Build-family key for generated third-party tree data without Blizzard's runtime-only hash. */
  readonly wowVersion?: string;
  readonly nodes: readonly TalentTreeNodeSnapshot[];
}
