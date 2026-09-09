import type Spell from 'common/SPELLS/Spell';
import {
  resourceWastePriority,
  type ImprovementPriority,
} from 'interface/guide/components/ImprovementPriorities';
import type ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

interface SoulShardWastePriorityOptions {
  tracker: ResourceTracker | undefined;
  fightDuration: number;
  weight: number;
  /** The spender used to express the waste: "enough for N more casts of X". */
  spender: Spell;
  shardsPerCast: number;
}

/**
 * Soul Shard waste for the Warlock specs. The thresholds are the same as the ones the shared
 * `SoulShardDetails` module uses for its suggestion.
 */
export function soulShardWastePriority({
  tracker,
  fightDuration,
  weight,
  spender,
  shardsPerCast,
}: SoulShardWastePriorityOptions): ImprovementPriority | null {
  return resourceWastePriority({
    tracker,
    fightDuration,
    weight,
    spender,
    unitsPerCast: shardsPerCast,
    id: 'soul-shard-waste',
    resourceName: { one: 'Soul Shard', many: 'Soul Shards' },
    title: 'Waste fewer Soul Shards',
    advice: 'At 4 or 5 shards, spend before you cast a generator.',
    thresholds: { good: 5 / 10, ok: 5 / 3 },
    worst: 10 / 3,
  });
}
