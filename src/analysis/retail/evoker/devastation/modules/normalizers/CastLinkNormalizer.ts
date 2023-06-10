import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { CastEvent, EventType, HasRelatedEvent } from 'parser/core/Events';

export const ESSENCE_BURST_CONSUME = 'EssenceBurstConsumption';
export const ESSENCE_BURST_GENERATED = 'EssenceBurstGenerated';
export const BURNOUT_CONSUME = 'BurnoutConsumption';
export const SNAPFIRE_CONSUME = 'SnapfireConsumption';
export const IRIDESCENCE_RED_CONSUME = 'IridescentRedConsumption';
export const IRIDESCENCE_BLUE_CONSUME = 'IridescentBlueConsumption';

const CAST_BUFFER_MS = 100;
const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: ESSENCE_BURST_CONSUME,
    reverseLinkRelation: ESSENCE_BURST_CONSUME,
    linkingEventId: [TALENTS_EVOKER.ESSENCE_BURST_TALENT.id, SPELLS.ESSENCE_BURST_DEV_BUFF.id],
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: SPELLS.DISINTEGRATE.id,

    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: ESSENCE_BURST_CONSUME,
    reverseLinkRelation: ESSENCE_BURST_CONSUME,
    linkingEventId: [TALENTS_EVOKER.ESSENCE_BURST_TALENT.id, SPELLS.ESSENCE_BURST_DEV_BUFF.id],
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [SPELLS.PYRE.id, SPELLS.PYRE_DENSE_TALENT.id],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: ESSENCE_BURST_GENERATED,
    reverseLinkRelation: ESSENCE_BURST_GENERATED,
    linkingEventId: [TALENTS_EVOKER.ESSENCE_BURST_TALENT.id, SPELLS.ESSENCE_BURST_DEV_BUFF.id],
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    referencedEventId: [
      SPELLS.LIVING_FLAME_DAMAGE.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.AZURE_STRIKE.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: BURNOUT_CONSUME,
    reverseLinkRelation: BURNOUT_CONSUME,
    linkingEventId: SPELLS.BURNOUT_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [SPELLS.LIVING_FLAME_DAMAGE.id, SPELLS.LIVING_FLAME_CAST.id],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.BURNOUT_TALENT);
    },
  },
  {
    linkRelation: SNAPFIRE_CONSUME,
    reverseLinkRelation: SNAPFIRE_CONSUME,
    linkingEventId: SPELLS.SNAPFIRE_BUFF.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [TALENTS_EVOKER.FIRESTORM_TALENT.id],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: 1000,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.FIRESTORM_TALENT);
    },
  },
  {
    linkRelation: IRIDESCENCE_RED_CONSUME,
    reverseLinkRelation: IRIDESCENCE_RED_CONSUME,
    linkingEventId: [SPELLS.IRIDESCENCE_RED.id],
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [
      SPELLS.PYRE.id,
      SPELLS.PYRE_DENSE_TALENT.id,
      SPELLS.LIVING_FLAME_CAST.id,
      SPELLS.DEEP_BREATH.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.IRIDESCENCE_TALENT);
    },
  },
  {
    linkRelation: IRIDESCENCE_BLUE_CONSUME,
    reverseLinkRelation: IRIDESCENCE_BLUE_CONSUME,
    linkingEventId: [SPELLS.IRIDESCENCE_BLUE.id],
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [
      SPELLS.DISINTEGRATE.id,
      SPELLS.UNRAVEL.id,
      SPELLS.AZURE_STRIKE.id,
      SPELLS.SHATTERING_STAR.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.IRIDESCENCE_TALENT);
    },
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function isFromBurnout(event: CastEvent) {
  return HasRelatedEvent(event, BURNOUT_CONSUME);
}

export function isFromEssenceBurst(event: CastEvent) {
  return HasRelatedEvent(event, ESSENCE_BURST_CONSUME);
}

export function isFromSnapfire(event: CastEvent) {
  return HasRelatedEvent(event, SNAPFIRE_CONSUME);
}

export default CastLinkNormalizer;
