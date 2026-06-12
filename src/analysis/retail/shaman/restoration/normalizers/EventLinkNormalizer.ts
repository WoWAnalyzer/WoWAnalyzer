import BaseEventLinkNormalizer, { EventLink, linkHelper } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  GetRelatedEvent,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  SummonEvent,
} from 'parser/core/Events';

import {
  EVENT_LINKS,
  CAST_BUFFER_MS,
  SPELL_DURATIONS,

} from '../constants';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';

/*
  This file is for attributing the various sources of spell applications to their respective abilities and talents.
  It is needed because there are certain abilities that can have multiple sources based on talents,
  i.e. riptide & primal tide core or earthliving
*/

const riptideEventLink: EventLink = {  //Riptide linking | EX "HARDCAST"
    linkRelation: EVENT_LINKS.riptideCast,
    linkingEventId: [TALENTS.RIPTIDE_TALENT.id],
    linkingEventType: [EventType.Cast],
    reverseLinkRelation: EVENT_LINKS.riptideBuffApply,
    referencedEventId: [TALENTS.RIPTIDE_TALENT.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff, EventType.Heal],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    maximumLinks: 1,
    isActive(c) {
      //extremely unlikely but you never know
      return c.hasTalent(TALENTS.RIPTIDE_TALENT);
    },
}

const primalTideCoreEventLink: EventLink = { // Riptide CAST < > Duplicate LINK
    linkRelation: EVENT_LINKS.primalTideCoreRiptideOrigin,
    linkingEventId: [TALENTS.RIPTIDE_TALENT.id],
    linkingEventType: [EventType.Cast], 
    reverseLinkRelation: EVENT_LINKS.primalTideCoreRiptideProc,
    referencedEventId: [TALENTS.RIPTIDE_TALENT.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff, EventType.Heal],
    anyTarget: true,
    maximumLinks: 2,
    backwardBufferMs: 90,
    forwardBufferMs: 90,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        (linkingEvent as CastEvent).targetID !== (referencedEvent as ApplyBuffEvent).targetID &&
        (linkingEvent as CastEvent).sourceID === (referencedEvent as ApplyBuffEvent).sourceID &&
        (referencedEvent.type !== EventType.Heal || !(referencedEvent as HealEvent).tick)
      );
    },
    isActive(c) {
      return c.hasTalent(TALENTS.PRIMAL_TIDE_CORE_TALENT);
    },
}

const healingRainEventLink: EventLink = {  //healing rain heal < > cast linking
    linkRelation: EVENT_LINKS.healingRainEventLinkHeal,
    linkingEventId: [SPELLS.HEALING_RAIN_HEAL.id],
    linkingEventType: EventType.Heal,
    reverseLinkRelation: EVENT_LINKS.healingRainEventLinkCast,
    referencedEventId: [TALENTS.HEALING_RAIN_TALENT.id],
    referencedEventType: EventType.Cast,
    backwardBufferMs: SPELL_DURATIONS.HEALING_RAIN_DURATION,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.HEALING_RAIN_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (linkingEvent as HealEvent).sourceID === (referencedEvent as CastEvent).sourceID;
    },
}

const healingRainTargetCounter: EventLink = {  //group healing rain ticks together for targets hit analysis
    linkRelation: EVENT_LINKS.healingRainTargetCounter,
    linkingEventId: [SPELLS.HEALING_RAIN_HEAL.id],
    linkingEventType: EventType.Heal,
    referencedEventId: [SPELLS.HEALING_RAIN_HEAL.id],
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.HEALING_RAIN_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        (linkingEvent as HealEvent).sourceID === (referencedEvent as HealEvent).sourceID &&
        (linkingEvent as HealEvent).targetID !== (referencedEvent as HealEvent).targetID
      );
    },
}

const overflowingShoresEventLink: EventLink = {  //Overflowing Shores initial HEAL link to Healing Rain CAST
    linkRelation: EVENT_LINKS.overflowingShoresHeal,
    linkingEventId: [SPELLS.OVERFLOWING_SHORES_HEAL.id],
    linkingEventType: EventType.Heal,
    reverseLinkRelation: EVENT_LINKS.overflowingShoresOrigin,
    referencedEventId: [TALENTS.HEALING_RAIN_TALENT.id],
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return (
        c.hasTalent(TALENTS.HEALING_RAIN_TALENT) && c.hasTalent(TALENTS.OVERFLOWING_SHORES_TALENT)
      );
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (linkingEvent as HealEvent).sourceID === (referencedEvent as CastEvent).sourceID;
    },
}

const downpourEventLink: EventLink = {  // Downpour CAST < > HEAL LINK
    linkRelation: EVENT_LINKS.downpourHeal,
    linkingEventId: [SPELLS.DOWNPOUR_HEAL.id],
    linkingEventType: EventType.Heal,
    reverseLinkRelation: EVENT_LINKS.downpourCast,
    referencedEventId: [SPELLS.DOWNPOUR_ABILITY.id],
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.DOWNPOUR_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return (linkingEvent as HealEvent).sourceID === (referencedEvent as CastEvent).sourceID;
    },
  }

const whirlingAirEventLink: EventLink = {  // Whirling Air : The cast time of your next healing spell is reduced by 40%
    linkRelation: EVENT_LINKS.whirlingAirBuffRemoval,
    linkingEventId: [SPELLS.WHIRLING_AIR.id],
    linkingEventType: [EventType.RemoveBuff],
    reverseLinkRelation: EVENT_LINKS.whirlingAirCast,
    referencedEventId: [
      SPELLS.HEALING_WAVE.id,
      TALENTS.CHAIN_HEAL_TALENT.id,
    ],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.WHIRLING_ELEMENTS_TALENT);
    },
}

const whirlingEarthEventLink: EventLink = {  // Whirling Earth : Your next Chain Heal applies Earthliving at 150% effectiveness to all targets hit
    linkRelation: EVENT_LINKS.whirlingEarthBuffRemoval,
    linkingEventId: [SPELLS.WHIRLING_EARTH.id],
    linkingEventType: [EventType.RemoveBuff],
    reverseLinkRelation: EVENT_LINKS.whirlingEarthEventCast,
    referencedEventId: [TALENTS.CHAIN_HEAL_TALENT.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.WHIRLING_ELEMENTS_TALENT);
    },
}

const whirlingWaterEventLink: EventLink = { // Whirling Water : Your next Healing Wave also heals an ally inside of your Healing Rain at 100% effectiveness.
    linkRelation: EVENT_LINKS.whirlingWaterBuffRemoval,
    linkingEventId: [SPELLS.WHIRLING_WATER.id],
    linkingEventType: [EventType.RemoveBuff],
    reverseLinkRelation: EVENT_LINKS.whirlingWaterCast,
    referencedEventId: [SPELLS.HEALING_WAVE.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS.WHIRLING_ELEMENTS_TALENT);
    },
}

const splitstreamEventLink: EventLink = {  // Reactivity: Your Healing Stream Totems now also heals a second ally at 100% effectiveness.
    linkRelation: EVENT_LINKS.splitstreamHeal,
    linkingEventId: [SPELLS.HEALING_STREAM_TOTEM_HEAL.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.HEALING_STREAM_TOTEM_HEAL.id],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: 5,
    forwardBufferMs: 5,
    anyTarget: true,
    anySource: false,
    isActive(c) {
      return c.hasTalent(TALENTS.SPLITSTREAM_TALENT);
    },
}

const earthlivingEventLink: EventLink = {  // Link Earthliving buff to the spell that applied it
    linkRelation: EVENT_LINKS.earthlivingBuffCycle,
    linkingEventId: [SPELLS.EARTHLIVING_WEAPON_HEAL.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [
      SPELLS.HEALING_WAVE.id,
      TALENTS.CHAIN_HEAL_TALENT.id,
      TALENTS.RIPTIDE_TALENT.id,
      SPELLS.HEALING_STREAM_TOTEM_HEAL.id,
      SPELLS.HEALING_TIDE_TOTEM_HEAL.id,
      SPELLS.STORMSTREAM_TOTEM_HEAL.id,
    ],
    referencedEventType: [EventType.Heal],
    backwardBufferMs: 200,
    forwardBufferMs: 200,
    anySource: true,
    maximumLinks: 1,
}

const flowOfTheTidesEventLink: EventLink = {  // Links riptide RemoveBuff event to chain heal CAST for "Flow of the Tides"
    linkRelation: EVENT_LINKS.flowOfTheTidesRemoveBuff,
    linkingEventId: [TALENTS.RIPTIDE_TALENT.id],
    linkingEventType: [EventType.RemoveBuff],
    reverseLinkRelation: EVENT_LINKS.flowOfTheTidesChainHealCast,
    referencedEventId: [TALENTS.CHAIN_HEAL_TALENT.id],
    referencedEventType: EventType.Cast,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS.FLOW_OF_THE_TIDES_TALENT);
    },
}

const chainHealEventLink: EventLink = {  // Links the CAST event to the HEAL events
    linkRelation: EVENT_LINKS.chainHealCast,
    linkingEventId: [TALENTS.CHAIN_HEAL_TALENT.id],
    linkingEventType: EventType.Cast,
    referencedEventId: [TALENTS.CHAIN_HEAL_TALENT.id],
    referencedEventType: EventType.Heal,
    reverseLinkRelation: EVENT_LINKS.chainHealHeal,
    maximumLinks: 7, //3 Base + 1 from either Ancestral Reach OR Flow of Tides +3 from Ascendance (and by proxy Deeply Rooted Elements)
    backwardBufferMs: CAST_BUFFER_MS, //Needed in order to fix a quirk in CH, if the Player targets itself and the HEAL event lands BEFORE the CAST event in LOG.
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    anySource: false, //Needed to prevent mixing up the link, in case of more than one shaman in the same raid fight.
}

const livelyTotemsEventLink: EventLink = {  // Links the SUMMON event of the totems with the next CAST event of chain heal
    linkRelation: EVENT_LINKS.livelyTotemsOrigin,
    linkingEventId: [
      SPELLS.HEALING_TIDE_TOTEM.id,
      SPELLS.HEALING_STREAM_TOTEM.id,
      SPELLS.SPIRIT_LINK_TOTEM.id,
      SPELLS.STORMSTREAM_TOTEM.id
    ],
    linkingEventType: [EventType.Summon],
    reverseLinkRelation: EVENT_LINKS.livelyTotemsChainHealCast, // Needed to be able to track the summon from the cast.
    referencedEventId: [TALENTS.CHAIN_HEAL_TALENT.id],
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_BUFFER_MS, //maximum time between totem summon and chainheal cast.
    maximumLinks: 1, //only one totem can be linked to a chainheal cast.
    anyTarget: true, //Player cannot choose the target of the livelyTotem chainheal cast.
    anySource: false, //Needed to prevent mixing up the link, in case of more than one shaman in the same raid fight.
    isActive(c) {
      return c.hasTalent(TALENTS.LIVELY_TOTEMS_TALENT);
    },
}


export function riptideHoT(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent): boolean {
  return HasRelatedEvent(event, EVENT_LINKS.riptideBuffApply);
}

export function isFromPrimalTideCore(event: ApplyBuffEvent | HealEvent): boolean {
  return HasRelatedEvent(event, EVENT_LINKS.primalTideCoreRiptideProc);
}

export function getHealingRainEvents(event: CastEvent) {
  return GetRelatedEvents<HealEvent>(event, EVENT_LINKS.healingRainEventLinkHeal);
}

export function getHealingRainHealEventsForTick(event: HealEvent) {
  return [event].concat(GetRelatedEvents(event, EVENT_LINKS.healingRainTargetCounter));
}

export function getOverflowingShoresEvents(event: CastEvent) {
  return GetRelatedEvents<HealEvent>(event, EVENT_LINKS.overflowingShoresOrigin);
}

export function getDownPourEvents(event: CastEvent | HealEvent) {
  switch (event.type) {
    case EventType.Cast: {
      return GetRelatedEvents(event, EVENT_LINKS.downpourCast);
    }
    case EventType.Heal: {
      return GetRelatedEvent(event, EVENT_LINKS.downpourHeal);
    }
  }
}

export function wasRiptideConsumed(event: CastEvent | RemoveBuffEvent): boolean {
  return HasRelatedEvent(event, EVENT_LINKS.flowOfTheTidesRemoveBuff);
}

export function getChainHeals(event: CastEvent): HealEvent[] {
  return GetRelatedEvents(event, EVENT_LINKS.chainHealCast) as HealEvent[];
}

export function didMoteExpire(event: RemoveBuffEvent) {
  switch (event.ability.guid) {
    case SPELLS.WHIRLING_AIR.id: {
      return !HasRelatedEvent(event, EVENT_LINKS.whirlingAirBuffRemoval);
    }
    case SPELLS.WHIRLING_EARTH.id: {
      return !HasRelatedEvent(event, EVENT_LINKS.whirlingEarthBuffRemoval);
    }
    case SPELLS.WHIRLING_WATER.id: {
      return !HasRelatedEvent(event, EVENT_LINKS.whirlingWaterBuffRemoval);
    }
  }
}

export function isSplitstreamHeal(event: HealEvent) {
  return HasRelatedEvent(event, EVENT_LINKS.splitstreamHeal);
}

export function earthlivingApplication(event: ApplyBuffEvent | RefreshBuffEvent) {
  return GetRelatedEvent<HealEvent>(event, EVENT_LINKS.earthlivingBuffCycle);
}

export function isLivelyTotemsChainHealCast(event: SummonEvent | CastEvent) {
  switch (event.type) {
    case EventType.Summon: {
      return GetRelatedEvent(event, EVENT_LINKS.livelyTotemsOrigin);
    }
    case EventType.Cast: {
      return GetRelatedEvent(event, EVENT_LINKS.livelyTotemsChainHealCast);
    }
  }
}

class EventLinkNormalizer extends BaseEventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      riptideEventLink,
      primalTideCoreEventLink,
      healingRainEventLink,
      healingRainTargetCounter,
      overflowingShoresEventLink,
      downpourEventLink,
      whirlingAirEventLink,
      whirlingEarthEventLink,
      whirlingWaterEventLink,
      splitstreamEventLink,
      earthlivingEventLink,
      flowOfTheTidesEventLink,
      chainHealEventLink,
      livelyTotemsEventLink,
    ]);
  }
}

export default EventLinkNormalizer;
