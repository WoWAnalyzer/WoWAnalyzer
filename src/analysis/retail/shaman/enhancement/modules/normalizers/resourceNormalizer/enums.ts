/**
 * Enumerations for resource normalization.
 * These enums help with timing and event processing for resource-related game mechanics.
 * @module resourceNormalizer/enums
 */

/**
 * Buffer times (in milliseconds) for normalizing resource events
 */
export enum BufferMs {
  Disabled = -1,
  OnSameTimestamp = 0,
  MinimumDamageBuffer = 1,
  Cast = 30,
  Ticks = 40,
  Damage = 75,
  SpendBackward = 25,
  SurgingElements = 100,
  StaticAccumulation = 185,
}

/**
 * Types of abilities that interact with the Maelstrom resource
 */
export enum MaelstromAbilityType {
  Builder = 1,
  Spender = 2,
}

/**
 * Directions to search for related events when normalizing
 * Defines whether to look forward, backward, or both in the event timeline
 */
export enum SearchDirection {
  ForwardsOnly,
  BackwardsOnly,
  ForwardsFirst,
  BackwardsFirst,
}

/**
 * When maelstrom gains, MatchFirst will select from the beginning of the found events
 * while MatchLast will select from the end. Most relevant for maelstrom gains where total is fixed
 * and often overlaps with other gains
 */
export enum MatchMode {
  MatchFirst,
  MatchLast,
}
