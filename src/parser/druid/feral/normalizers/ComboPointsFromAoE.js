import SPELLS from 'common/SPELLS/index';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import HIT_TYPES from 'game/HIT_TYPES';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

const debug = false;

// time after a cast event to consider a damage event as possibly belonging to that cast
const ABILITY_DAMAGE_WINDOW = 250; //ms
const INVISIBLE_ENERGIZE_ATTACKS = [
  SPELLS.THRASH_FERAL.id,
  SPELLS.SWIPE_CAT.id,
  SPELLS.BRUTAL_SLASH_TALENT.id,
];
const HIT_TYPES_THAT_DONT_ENERGIZE = [
  HIT_TYPES.MISS,
  HIT_TYPES.DODGE,
  HIT_TYPES.PARRY,
  HIT_TYPES.IMMUNE,
];

// unlike rogues, feral druids always have a maximum of 5 combo points
const MAX_COMBO = 5;

/**
 * The Feral AoE abilities Swipe, Thrash, and Brutal Slash generate 1 combo point if they
 * hit a target, but that combo point generation is not shown in the combat log.
 * Because damage events are often slightly delayed from the cast event, confirmation
 * that one of these abilities actually generated a combo point can come too late for
 * some work that analyzers need to do. Especially problematic due to Primal Fury generating
 * an extra combo point when a generator crits, which usually comes before the damage
 * event(s) for that generator. This can lead to wasted energizes being blamed on the
 * wrong spell.
 *
 * This normalizer creates an appropriate energize event when the player uses one of these
 * abilities and has it hit at least 1 target. The created event is backdated (by timestamp
 * and position in the event stream) to when the ability was cast, so it correctly appears
 * before any Primal Fury proc associated with the ability use.
 */
class ComboPointsFromAoE extends EventsNormalizer {
  playerId = null;
  constructor(options) {
    super(options);

    // when being tested this.owner may be null (the test will set playerId)
    this.playerId = this.owner ? this.owner.playerId : null;
  }

  normalize(events) {
    const fixedEvents = [];

    // Keep track of combo points so an accurate energize event can be fabricated
    let combo = 0;

    let castEvent = null;
    let castEventIndex = null;
    let comboAtCast = null;

    // When adding new events the indexing of original events and fixedEvents will become offset
    let fixedEventIndex = 0;

    events.forEach(event => {
      const eventComboResource = this.getResource(event, RESOURCE_TYPES.COMBO_POINTS.id);

      if ((event.type === EventType.Energize) && (event.targetID === this.playerId) &&
          (event.resourceChangeType === RESOURCE_TYPES.COMBO_POINTS.id)) {
        // Gained combo points.
        combo = Math.min(MAX_COMBO, combo + (event.resourceChange - event.waste));
      }
      if ((event.type === EventType.Cast) && (event.sourceID === this.playerId) &&
          eventComboResource && eventComboResource.cost) {
        // Spent combo points, which always puts a Feral druid back to 0
        combo = 0;
      }

      if ((event.type === EventType.Cast) && (event.sourceID === this.playerId) &&
          INVISIBLE_ENERGIZE_ATTACKS.includes(event.ability.guid)) {
        // Cast an ability that may have generated a combo point, but we don't know until it does damage.
        castEvent = event;
        castEventIndex = fixedEventIndex;
        comboAtCast = combo;
        debug && console.log('invisible combo generator cast, awaiting confirmation of it hitting..');
      }

      if ((event.type === EventType.Energize) && (event.sourceID === this.playerId) &&
          (event.resourceChangeType === RESOURCE_TYPES.COMBO_POINTS.id) &&
          INVISIBLE_ENERGIZE_ATTACKS.includes(event.ability.guid) && !event.__fabricated &&
          castEvent && (castEvent.ability.guid === event.ability.guid) &&
          ((event.timestamp - castEvent.timestamp < 100))) {
        // Detected a combo point energize event from an ability that should never be generating energize events, likely due to a Blizzard or WCL change.
        debug && console.warn(`Detected energize event from an ability that isn't expected to produce energize events. The ComboPointsFromAoE normalizer may no longer be needed for ${event.ability.name} (${event.ability.guid})`);

        // There's already an energize event for castEvent so prevent generation of another one.
        castEvent = null;
      }

      if ((event.type === EventType.Damage) && (event.sourceID === this.playerId) &&
          castEvent && (castEvent.ability.guid === event.ability.guid) &&
          ((event.timestamp - castEvent.timestamp) < ABILITY_DAMAGE_WINDOW) &&
          !event.tick && !HIT_TYPES_THAT_DONT_ENERGIZE.includes(event.hitType)) {
        // We now know that the last castEvent hit and so did produce a combo point.
        const fabricatedEnergize = {
          __fabricated: true,
          type: EventType.Energize,
          timestamp: castEvent.timestamp,
          ability: castEvent.ability,
          sourceID: this.playerId,
          sourceIsFriendly: true,
          targetID: this.playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 1,
          waste: (comboAtCast === MAX_COMBO) ? 1 : 0,
        };
        combo = Math.min(MAX_COMBO, combo + (fabricatedEnergize.resourceChange - fabricatedEnergize.waste));
        debug && console.log('confirmed hidden combo generation.');
        debug && console.log(fabricatedEnergize);

        // Place the energize event immediately after the cast event, so it's before any Primal Fury proc.
        fixedEvents.splice(castEventIndex + 1, 0, fabricatedEnergize);
        fixedEventIndex += 1;

        // Prevent triggering more than one event fabrication per cast.
        castEvent = null;
      }

      fixedEvents.push(event);
      fixedEventIndex += 1;
    });
    return fixedEvents;
  }

  getResource(event, type) {
    if (!event || !event.classResources) {
      return null;
    }
    return event.classResources.find(resource => (resource.type === type));
  }
}

export default ComboPointsFromAoE;
