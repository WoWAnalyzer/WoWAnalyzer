import type { TalentTreeSnapshot } from '../contracts';
import { GENERATED_TALENT_DATA_PROVENANCE, GENERATED_TALENT_TREES } from './generated';

export const INSTALLED_TALENT_SNAPSHOTS: readonly TalentTreeSnapshot[] = Object.entries(
  GENERATED_TALENT_TREES,
).map(([specId, packedNodes]) => ({
  schemaId: GENERATED_TALENT_DATA_PROVENANCE.schemaId,
  serializationVersion: GENERATED_TALENT_DATA_PROVENANCE.serializationVersion,
  specId: Number(specId),
  wowVersion: GENERATED_TALENT_DATA_PROVENANCE.wowVersion,
  nodes: packedNodes.map((packedNode) => ({
    nodeId: packedNode[0],
    maxRanks: packedNode[1],
    nodeType: packedNode[2],
    entryIds: packedNode[3],
    ...(packedNode[4] === undefined ? {} : { entryMaxRanks: packedNode[4] }),
  })),
}));
