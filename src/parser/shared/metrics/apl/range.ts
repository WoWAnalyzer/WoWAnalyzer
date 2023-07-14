/**
 * Range checking code for the APL tools.
 *
 * Some notes:
 *
 * - The overall philosophy here is to assume that the player is in range
 *   whenever they can be, and let other code (like ABC, or some melee uptime
 *   code) deal with analyzing whether they could've been in range more than
 *   they were. Being out of range is thus *not* treated as a mistake by this
 *   code.
 *
 * - The ability to cast a spell in WoW depends on the spell's range being
 *   greater than the distance to the edge of the target's hitbox. That is:
 *   `range >= distance - hitbox`, or `range + hitbox >= distance`.
 *
 * - Boss hitboxes vary widely in size. Some are very small (Sylvanas, Anduin),
 *   and some are ENORMOUS (The Jailer, Ragnaros, basically any Dragon-type
 *   boss). This module tries to pick a hitbox that is relatively accurate
 *   quickly, and then uses a small (1.5m) margin of error to try to handle
 *   small differences in our estimate vs the real value. This *usually* picks
 *   up the actual hitbox within the first handful of events, at least for melee DPS.
 *
 * - Hitbox detection relies heavily on using a small number of manual
 *   `range` entries in a spec's Abilities module to give known-good ranges. For
 *   melee, the auto-attack range is included by default but this obviously
 *   doesn't apply to ranged DPS. Adding a single filler or opener spell should
 *   be enough for it to pick up the hitbox size very quickly.
 *
 * - This could very well become a standalone functional analyzer later. Almost
 *   all the pieces are here.
 *
 * @module
 */
import Spell from 'common/SPELLS/Spell';
import {
  MappedEvent,
  HasAbility,
  HasLocation,
  HasSource,
  HasTarget,
  LocationEvent,
  ResourceActor,
  TargettedEvent,
} from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import { PlayerInfo } from './index';
import { AbilityRange } from 'parser/core/modules/Abilities';

const debug = false;

const DEFAULT_HITBOX_SIZE = 0;
// how far off we're willing to still consider "in range"
const FUDGE_RANGE = 1.5;

/**
 * Determine the range of a spell by ID. This uses the selected combatant's
 * Abilities module to check for range, and otherwise falls back to the
 * default.
 */
function spellRange(spellId: number, info: PlayerInfo): number;
/**
 * Determine the range of a spell by ID. This uses the selected combatant's
 * Abilities module to check for range, and otherwise falls back to the
 * default *if `explicitOnly` is `false`.*
 */
function spellRange(spellId: number, info: PlayerInfo, explicitOnly: boolean): number | undefined;
function spellRange(spellId: number, info: PlayerInfo, explicitOnly?: boolean): number | undefined {
  const ability = info.abilities.find((ability) =>
    Array.isArray(ability.spell) ? ability.spell.includes(spellId) : ability.spell === spellId,
  );

  if (explicitOnly) {
    return ability?.range;
  }

  return ability?.range ?? info.defaultRange;
}

export type LocationState = {
  info: PlayerInfo;
  /**
   * Record the locations of every entity seen.
   */
  locations: Record<string, LocationEvent<any>>;
  /**
   * Record the least hitbox size that could be viable given observed ability usage.
   */
  minHitboxes: Record<string, number>;
};

function HasResourceActor(
  event: MappedEvent,
): event is MappedEvent & { resourceActor: ResourceActor } {
  return 'resourceActor' in event;
}

function playerLocation(state: LocationState, event: MappedEvent): LocationEvent<any> | undefined {
  if (
    HasLocation(event) &&
    HasResourceActor(event) &&
    event.resourceActor === ResourceActor.Source &&
    event.sourceID === state.info.playerId
  ) {
    return event;
  } else if (
    HasLocation(event) &&
    HasResourceActor(event) &&
    event.resourceActor === ResourceActor.Target &&
    event.targetID === state.info.playerId
  ) {
    return event;
  } else {
    return state.locations[encodeTargetString(state.info.playerId)];
  }
}

function targetLocation(
  state: LocationState,
  event: TargettedEvent<any>,
): LocationEvent<any> | undefined {
  if (
    HasLocation(event) &&
    HasResourceActor(event) &&
    event.resourceActor === ResourceActor.Target
  ) {
    return event;
  } else {
    return state.locations[encodeTargetString(event.targetID, event.targetInstance)];
  }
}

function inferHitboxSize(state: LocationState, event: TargettedEvent<any> & LocationEvent<any>) {
  if (
    !HasSource(event) ||
    !HasAbility(event) ||
    !HasResourceActor(event) ||
    event.sourceID !== state.info.playerId ||
    event.resourceActor !== ResourceActor.Target
  ) {
    return;
  }
  const range =
    event.ability.guid === 1
      ? AbilityRange.Melee
      : spellRange(event.ability.guid, state.info, true);

  if (!range) {
    // range not known, bail
    return;
  }

  const sourceLoc = playerLocation(state, event);

  if (!sourceLoc) {
    console.error('unable to determine player location');
    return;
  }

  const targetKey = encodeTargetString(event.targetID);
  const currentHitbox = state.minHitboxes[targetKey] ?? DEFAULT_HITBOX_SIZE;
  const actualDistance = distance(sourceLoc, event);
  if (actualDistance < range + currentHitbox) {
    // already in range.
    return;
  }

  // we found a new hitbox size, record it
  //
  // note: we INTENTIONALLY do not use the target instance here---all
  // NPCs with a specific ID are assumed to have the same hitbox.
  const newHitbox = actualDistance - range;

  debug &&
    console.log(
      `APL range: updating hitbox. spell = ${event.ability.guid}. target = ${event.targetID}. old = ${state.minHitboxes[targetKey]}. new = ${newHitbox}. ability = ${event.ability.guid}. range = ${range}. dist = ${actualDistance}.`,
    );
  state.minHitboxes[targetKey] = newHitbox;
}

export function updateLocationState(state: LocationState, event: MappedEvent): LocationState {
  if (!HasLocation(event)) {
    return state;
  }

  if (event.resourceActor === ResourceActor.Source && HasSource(event)) {
    // TODO: no sourceInstance?
    const key = encodeTargetString(event.sourceID);
    state.locations[key] = event;
  } else if (event.resourceActor === ResourceActor.Target && HasTarget(event)) {
    const key = encodeTargetString(event.targetID, event.targetInstance);
    state.locations[key] = event;
    inferHitboxSize(state, event);
  }

  return state;
}

const distance = (source: LocationEvent<any>, target: LocationEvent<any>): number =>
  Math.sqrt(
    Math.pow(source.x / 100 - target.x / 100, 2) + Math.pow(source.y / 100 - target.y / 100, 2),
  );

// how long we consider old position data valid before discarding it
const STALE_TARGET_CUTOFF = 5000;
const STALE_PLAYER_CUTOFF = 2000;

/**
 * Check whether an ability (`spell`) would be in range of the target as of the
 * current event (`event`).
 *
 * This is used to have the APL code skip rules that are out of range without
 * penalty (for example: casting Keg Smash (15y range) over RSK (5y range),
 * which would be incorrect if you're close enough).
 *
 * The underlying principle is that we assume that if the player *could* be in
 * range, they would be. It is the responsibility of *other modules* to make
 * judgments about whether that is the case---the APL code shouldn't care.
 *
 * ## Implementation
 *
 * The check is implemented in two cases:
 *
 * 1. If we know the range of the ability that was actually cast and the range
 *    of `spell`, then we use that to check if we're in range.
 *
 * 2. If we don't know the range of the ability that was actually cast, then we
 *    use stored location and hitbox information to determine how close we are to
 *    the target (and hence whether we're in range).
 *
 * This is implemented to assume the positive---if we can't tell given the
 * information available, then we just assume you're in range.
 */
export function isInRange(state: LocationState, event: MappedEvent, spell: Spell): boolean {
  if (!HasTarget(event)) {
    // current event doesn't have a target, we just guess that you can
    return true;
  }

  const range = spellRange(spell.id, state.info);
  const actualCastRange = spellRange(event.ability.guid, state.info, true);

  if (actualCastRange && actualCastRange < range) {
    // shortcut: if we know the real range of the spell that was actually cast
    // *and* it was shorter range than the spell we're examining, then we know
    // we're in range.
    return true;
  }

  const playerLoc = playerLocation(state, event);
  const targetLoc = targetLocation(state, event);

  if (!playerLoc || !targetLoc) {
    // we are missing location info from the source or target. assume we're in range
    return true;
  }

  if (event.timestamp - targetLoc.timestamp > STALE_TARGET_CUTOFF) {
    // too long since we saw target location. abandon
    return true;
  }

  if (event.timestamp - playerLoc.timestamp > STALE_PLAYER_CUTOFF) {
    // too long since we saw player location. abandon
    return true;
  }

  const dist = distance(playerLoc, targetLoc);
  // note: hitboxes don't use target instance
  const hitbox = state.minHitboxes[encodeTargetString(event.targetID)] ?? DEFAULT_HITBOX_SIZE;

  const inRange = dist <= range + hitbox + FUDGE_RANGE;

  debug &&
    console.log(
      `APL range check. spell = ${spell.id} (${spell.name}). player time delta = ${
        event.timestamp - playerLoc.timestamp
      }. target time delta = ${event.timestamp - targetLoc.timestamp}. targetID = ${
        event.targetID
      }. dist = ${dist}. hitbox = ${hitbox}. range = ${range}. inRange = ${inRange}`,
    );

  return inRange;
}

export function initLocationState(info: PlayerInfo): LocationState {
  debug && console.log('APL range: init');
  return {
    info,
    locations: {},
    minHitboxes: {},
  };
}
