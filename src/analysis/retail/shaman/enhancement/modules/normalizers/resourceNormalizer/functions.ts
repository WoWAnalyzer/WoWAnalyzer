import {
  EventType,
  AnyEvent,
  HasAbility,
  AbilityEvent,
  AddRelatedEvent,
  BaseCastEvent,
  HasSource,
  ResourceActor,
  ResourceChangeEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { spellToAbility } from 'common/spellToAbility';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import { MAELSTROM_WEAPON_LINK, MAELSTROM_WEAPON_LINK_REVERSE } from '../constants';
import { MatchMode } from './enums';
import {
  PeriodicGainEffect,
  ActivePeriodicGainEffect,
  MaelstromAbility,
  SearchResult,
} from './types';

/**
 * Start a new instance of a periodic gain effect
 * @param start timestamp where the periodic gain started, i.e. buff was applied and *not* the first time the gain should occur
 * @param spec the specifications for this periodic gain effect
 * @returns {@link ActivePeriodicGainEffect}
 */
export function startPeriodicGain(
  start: number,
  spec: PeriodicGainEffect,
): ActivePeriodicGainEffect {
  return {
    ...spec,
    nextExpectedGain: start + spec.frequencyMs,
    end: 0,
  };
}

export function timestampCheck(a: AnyEvent, b: AnyEvent, bufferMs: number) {
  return a.timestamp - b.timestamp > bufferMs;
}

/**
 * checks the event is an ability event with the same id as {@link spellId}
 */
export function spellsMatch(ability: number | number[], spellId: number): boolean {
  if (Array.isArray(ability)) {
    return ability.some((s) => s === spellId);
  }
  return spellId === ability;
}

/**
 * checks the event type is one of the types specified by {@link eventType}
 */
export function eventTypesMatch(eventType: EventType | EventType[], event: AnyEvent) {
  return Array.isArray(eventType)
    ? eventType.some((s) => s === event.type)
    : eventType === event.type;
}

/**
 * Checks the event is an ability event with the same id as {@link spellId} and
 * the event type is one of the types specified by {@link eventType}.
 * Shorthand for {@link eventTypesMatch} and {@link spellsMatch}.
 */
export function eventTypeAndSpellMatch(
  spellId: number | number[],
  eventType: EventType | EventType[],
  event: AnyEvent,
) {
  return (
    HasAbility(event) &&
    spellsMatch(spellId, event.ability.guid) &&
    eventTypesMatch(eventType, event)
  );
}

/**
 * Gets the spell id to use for a `resourechange` event. The value returned is determined by
 * the configuration of {@link ability} and the ability id of {@link event}
 */
export function getSpellId<T extends string>(
  ability: MaelstromAbility,
  event: AbilityEvent<T>,
): number | undefined {
  if (ability.spellIdOverride) {
    /**
     * if the ability spec has a spell override, use the specified value or calculate it
     * from the the SpellOverride spellId
     */
    if (typeof ability.spellIdOverride === 'number') {
      return ability.spellIdOverride;
    }

    const spellOverride = ability.spellIdOverride.find((override) => {
      if (typeof override.spellId === 'number') {
        return override.spellId === event.ability.guid;
      }
      return override.spellId.includes(event.ability.guid);
    });

    // if no replacement is set, just use the exsting event ability id
    return spellOverride?.replaceWithSpellId ?? event.ability.guid;
  }
  if (typeof ability.spellId === 'number') {
    return ability.spellId === event.ability.guid ? ability.spellId : undefined;
  }
  return ability.spellId.find((s) => s === event.ability.guid);
}

export function sourceCheck(event: AnyEvent, sourceID: number): boolean {
  return HasSource(event) && event.sourceID === sourceID;
}

/**
 * Search backwards through {@link arr} from the {@link currentIndex} for an ability
 * that matches {@link ability}
 * @param ability the {@link MaelstromAbility} to find matches for
 * @param currentIndex current position of the index through {@link arr}
 * @param arr events being normalized
 * @param skipTheseEvents any event present in this {@link Set} of events is assumed to have already been associated with a resource gain/spend event
 * @param maximumMaelstromStacksConsumed the maximum number of maelstrom stacks that can be consumed
 * @returns related maelstrom buff events
 */
export function lookBehind(
  ability: MaelstromAbility,
  currentIndex: number,
  arr: AnyEvent[],
  skipTheseEvents: Set<AnyEvent>,
  maximumMaelstromStacksConsumed: number,
): SearchResult | undefined {
  const event = arr[currentIndex];
  if (!HasAbility(event)) {
    return undefined;
  }
  let current: SearchResult = { index: 0, timestamp: 0, events: [] };
  const matches: SearchResult[] = [current];

  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const backwardsEvent = arr[index];
    if (timestampCheck(event, backwardsEvent, ability.backwardsBufferMs ?? 0)) {
      break;
    }
    if (Math.abs(event.timestamp - backwardsEvent.timestamp) < (ability.minimumBuffer ?? 0)) {
      continue;
    }
    if (
      current.events.length > 0 &&
      !eventTypeAndSpellMatch(
        SPELLS.MAELSTROM_WEAPON_BUFF.id,
        ability.linkToEventType,
        backwardsEvent,
      )
    ) {
      if (
        backwardsEvent.type === EventType.ResourceChange &&
        backwardsEvent.resourceChangeType === RESOURCE_TYPES.MAELSTROM_WEAPON.id &&
        backwardsEvent.resourceChange === 0
      ) {
        continue;
      }
      current = { index: 0, timestamp: 0, events: [] };
      matches.push(current);
      continue;
    }
    if (
      eventTypeAndSpellMatch(
        SPELLS.MAELSTROM_WEAPON_BUFF.id,
        ability.linkToEventType,
        backwardsEvent,
      )
    ) {
      if (skipTheseEvents.has(backwardsEvent)) {
        continue;
      }
      current.index = index;
      current.timestamp =
        backwardsEvent.timestamp > current.timestamp ? backwardsEvent.timestamp : current.timestamp; // whatever is closest to the timestamp of the current event
      current.events.splice(0, 0, backwardsEvent);
    }
  }

  if (matches.length > 0) {
    // apply matching rules to each group
    const max = ability.maximum as number;
    const candidates: SearchResult[] = [];
    for (const m of matches) {
      const events = m.events;

      if (max < 0) {
        if (events.length > 0 && events.length <= maximumMaelstromStacksConsumed) {
          candidates.push(m);
        }
        continue;
      }

      if (ability.requiresExact) {
        if (events.length === max) {
          candidates.push({ index: m.index, timestamp: m.timestamp, events });
        }
        continue;
      }

      const truncatedEvents =
        ability.matchMode === MatchMode.MatchFirst ? events.slice(-max) : events.slice(0, max);
      if (truncatedEvents.length > 0) {
        candidates.push({ index: m.index, timestamp: m.timestamp, events: truncatedEvents });
      }
    }

    // pick the closest match behind the current event (largest timestamp)
    const result = candidates.sort((a, b) => b.timestamp - a.timestamp).at(0);
    return result;
  }
}

/**
 * Search forward through {@link arr} from the {@link currentIndex} for an ability
 * that matches {@link ability}
 * @param ability the {@link MaelstromAbility} to find matches for
 * @param currentIndex current position of the index through {@link arr}
 * @param arr events being normalized
 * @param skipTheseEvents any event present in this {@link Set} of events is assumed to have already been associated with a resource gain/spend event
 * @param maximumMaelstromStacksConsumed the maximum number of maelstrom stacks that can be consumed in a single event
 * @returns related maelstrom buff events, or undefined if an unexpected number of events are found
 */
export function lookAhead(
  ability: MaelstromAbility,
  currentIndex: number,
  arr: AnyEvent[],
  skipTheseEvents: Set<AnyEvent>,
  maximumMaelstromStacksConsumed: number,
): SearchResult | undefined {
  const event = arr[currentIndex];
  if (!HasAbility(event)) {
    return undefined;
  }

  let current: SearchResult = { index: 0, timestamp: 0, events: [] };
  const matches: SearchResult[] = [current];

  for (let index = currentIndex + 1; index < arr.length; index += 1) {
    const forwardEvent = arr[index];
    if (timestampCheck(forwardEvent, event, ability.forwardBufferMs ?? 0)) {
      break;
    }
    if (Math.abs(event.timestamp - forwardEvent.timestamp) < (ability.minimumBuffer ?? 0)) {
      continue;
    }
    if (
      current.events.length > 0 &&
      !eventTypeAndSpellMatch(
        SPELLS.MAELSTROM_WEAPON_BUFF.id,
        ability.linkToEventType,
        forwardEvent,
      )
    ) {
      if (
        forwardEvent.type === EventType.ResourceChange &&
        forwardEvent.resourceChangeType === RESOURCE_TYPES.MAELSTROM_WEAPON.id &&
        forwardEvent.resourceChange === 0
      ) {
        continue;
      }
      current = { index: 0, timestamp: 0, events: [] };
      matches.push(current);
      continue;
    }
    if (
      eventTypeAndSpellMatch(SPELLS.MAELSTROM_WEAPON_BUFF.id, ability.linkToEventType, forwardEvent)
    ) {
      if (skipTheseEvents.has(forwardEvent)) {
        continue;
      }
      current.index = current.index === 0 ? index : current.index;
      current.timestamp = current.timestamp === 0 ? forwardEvent.timestamp : current.timestamp;
      current.events.push(forwardEvent);
    }
  }

  if (matches.length > 0) {
    // apply matching rules to each group
    const max = ability.maximum as number;
    const candidates: SearchResult[] = [];
    for (const m of matches) {
      const events = m.events;

      if (max < 0) {
        if (events.length > 0 && events.length <= maximumMaelstromStacksConsumed) {
          candidates.push(m);
        }
        continue;
      }

      if (ability.requiresExact) {
        if (events.length === max) {
          candidates.push({ index: m.index, timestamp: m.timestamp, events });
        }
        continue;
      }

      const truncatedEvents =
        ability.matchMode === MatchMode.MatchFirst ? events.slice(0, max) : events.slice(-max);
      if (truncatedEvents.length > 0) {
        candidates.push({ index: m.index, timestamp: m.timestamp, events: truncatedEvents });
      }
    }

    // pick the closest match ahead of the current event (smallest timestamp)
    const result = candidates.sort((a, b) => a.timestamp - b.timestamp).at(0);
    return result;
  }
}

/**
 * Creates a {@link ResourceChangeEvent} from the given spell, and optionally links the event to an array of {@link AnyEvent}
 * @param spell spellId or {@link Spell} object
 * @param gain amount of resources gained
 * @param timestamp timestamp for the event
 * @param linkToEvent array of {@link AnyEvent} to link to the returned {@link ResourceChangeEvent}
 * @returns a {@link ResourceChangeEvent}
 */
export function buildEnergizeEvent(spell: number | Spell, sourceID: number): ResourceChangeEvent {
  const resourceChange: ResourceChangeEvent = {
    timestamp: 0,
    type: EventType.ResourceChange,
    sourceID: sourceID,
    targetID: sourceID,
    ability: spellToAbility(spell)!,
    resourceChangeType: RESOURCE_TYPES.MAELSTROM_WEAPON.id,
    /** timestamp will be updated when this is associated with maelstrom stacks */
    resourceChange: 0,
    waste: 0,
    otherResourceChange: 0,
    resourceActor: ResourceActor.Source,
    sourceIsFriendly: true,
    targetIsFriendly: true,
    // don't care about these values
    classResources: [],
    hitPoints: 0,
    maxHitPoints: 0,
    attackPower: 0,
    spellPower: 0,
    armor: 0,
    x: 0,
    y: 0,
    facing: 0,
    mapID: 0,
    itemLevel: 0,
  };

  return resourceChange;
}

export function linkEnergizeEvent(event: ResourceChangeEvent, ...linkToEvent: AnyEvent[]) {
  linkToEvent.forEach((linkedEvent) => {
    AddRelatedEvent(event, MAELSTROM_WEAPON_LINK, linkedEvent);
    AddRelatedEvent(linkedEvent, MAELSTROM_WEAPON_LINK_REVERSE, event);
  });
}

/**
 * For a given `cast` or `resourcechange` event, find or create a `ClassResource`
 * @param event the event needing a `classResource` value for Maelstrom Weapon
 * @param maximumMaelstromWeapon maximum maesltrom weapon stack is dependent on combatant talents
 * @returns a reference to the `ClassResource` object for the {@link event}
 */
export function getMaelstromClassResources<T extends string>(
  event: BaseCastEvent<T> | ResourceChangeEvent,
  maximumMaelstromWeapon: number,
) {
  event.classResources ??= [];
  let resource = getResource(event.classResources, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
  if (!resource) {
    resource = {
      amount: 0,
      max: maximumMaelstromWeapon,
      type: RESOURCE_TYPES.MAELSTROM_WEAPON.id,
    };
    event.classResources.push({
      ...resource,
      cost: 0,
    });
  }
  return getResource(event.classResources, RESOURCE_TYPES.MAELSTROM_WEAPON.id)!;
}
