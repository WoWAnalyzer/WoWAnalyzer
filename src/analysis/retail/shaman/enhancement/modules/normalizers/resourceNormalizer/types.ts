import { AnyEvent } from 'parser/core/Events';
import Combatant from 'parser/core/Combatant';
import { MaelstromAbilityType, SearchDirection, MatchMode } from './enums';
import { EventType } from 'parser/core/Events';

/** The result of a call to lookAhead or lookBehind */
export interface SearchResult {
  /** The index to be associated with a generated `resourchange` event, or the cost of a `cast` event.
   *  This has complex logic associated, depending on if its set by lookAhead or lookBehind.
   *  If the search is for a gain, will specify where the `resourchange` should be inserted
   *  in the returned events array.
   */
  index: number;
  /** The timestamp associated with the generated {@link ResourceChangeEvent} */
  timestamp: number;
  /** The maelstrom weapon stack events found by the search */
  events: AnyEvent[];
}

/**
 * Type definition for search functions
 */
export type SearchFunctions = Record<
  SearchDirection,
  (
    ability: MaelstromAbility,
    index: number,
    events: AnyEvent[],
    skip: Set<AnyEvent>,
    maximumMaelstromSpent: number,
  ) => SearchResult | undefined
>;

/** The specification of an ability that generates maelstrom weapon stacks
 * at a set frequency but unrelated to other combatlog events.
 * Currently the only source is:
 * - Static Accumulation talent: Generates 1/2 stacks per second (depending on talent rank) when Ascendance/Doom Winds is active.
 */
export interface PeriodicGainEffect {
  /** spell id of the initial ability that starts this periodic gain effect */
  spellId: number;
  /** interval in milliseconds between "ticks" */
  frequencyMs: number;
  /** spell id to use for `resourcechange` events */
  spellIdOverride: number;
}

/** Extends {@link PeriodicGainEffect} with details of an active occurance. */
export interface ActivePeriodicGainEffect extends PeriodicGainEffect {
  /** The next time an instance of this periodic effect is expected to occur */
  nextExpectedGain: number;
  /** The timestamp when this effect ends */
  end: number;
}

export interface SpellOverride {
  /** spell id or ids that will match an event's ability guid */
  spellId: number | number[];
  /** the spell id to use instead of the events ability guid */
  replaceWithSpellId: number;
}

/**
 * The specification of an ability that either generates maelstrom weapon stacks or consumes them.
 */
export interface MaelstromAbility {
  /** REQUIRED The ability id or ids of the events that can generate or spend maelstrom weapon stacks */
  spellId: number | number[];
  /** The spell id or {@link SpellOverride} array to use instead of the value in {@link spellId}.
   *  Example use cases are Tempest damage generating 3 maelstrom stacks from the talent Storm Swell */
  spellIdOverride?: number | SpellOverride[];
  /** REQUIRED The type or types of events that can generate or spend maelstrom weapon stacks {@link spellId} */
  linkFromEventType: EventType | EventType[];
  /** REQUIRED One of {@link GAIN_EVENT_TYPES} or {@link SPEND_EVENT_TYPES}, depending on the value of {@link type} */
  linkToEventType: EventType | EventType[];
  /** If defined, this predicate will be called with the selected combatant if the combatant has the required talents or abilties.
   * Defaults to true when omitted */
  enabled?: ((c: Combatant) => boolean) | undefined;
  /** If defined, this ability can spend or generate at most the given number of maelstrom weapon stacks.
   * Defaults to 1 when omitted */
  maximum?: ((combatant: Combatant) => number) | number | undefined;
  /** The maximum allowed timestamp difference *forward in time between the from and to events.
   * Defaults 0 ms when omitted. Some events may appear on the same timestamp but backwards in the list, so use
   * {@link BufferMs.Disabled} to disable forward searching entirely */
  forwardBufferMs?: number;
  /** The maximum allowed timestamp difference *backwards in time between the from and to events.
   * Defaults 0 ms when omitted. Some events may appear on the same timestamp but backwards in the list, so use
   * {@link BufferMs.Disabled} to disable backwards searching entirely */
  backwardsBufferMs?: number;
  /** The minimum allowed timestamp difference between the from and to events, both forward and backwards.
   * Some refund sources never occur before a minimum period, so this can be useful to prevent incorrect matches.
   * An example is the refunds from Static Accumulation and Supercharge. The former has a minimum 50ms delay, while the latter
   * occurs much faster.
   * Defaults to 0 ms when omitted*/
  minimumBuffer?: number;
  /** If defined, this ability requires an exact match, such as Supercharge requiring exactly 2 maelstrom weapon stack events in a row.
   * Defaults to false when omitted
   */
  requiresExact?: boolean;
  /** One of {@link MaelstromAbilityType.Spender} or {@link MaelstromAbilityType.Builder}.
   * Defaults to {@link MaelstromAbilityType.Spender} when omitted */
  type?: MaelstromAbilityType;
  /** REQUIRED The searching pattern to use. Many abilities have distinct patterns they follow, and this is used to define how to look for
   * related maelstrom weapon stack events. */
  searchDirection: SearchDirection;
  /** The matching mode to use. In cases where there are multiple possible matches, this value determines how the events should be selected
   * from a list of possible candidates. */
  matchMode?: MatchMode;
  /** If defined, a matching {@link linkFromEventType} will be reordered to to the first {@link linkToEventType} match,
   * and its timestamp will be updated accordingly.
   * Defaults to false when omitted */
  updateExistingEvent?: boolean;
}
