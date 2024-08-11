import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, DrainEvent, EventType, GetRelatedEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { FB_IDS } from 'analysis/retail/druid/feral/constants';

const ADDITIONAL_ENERGY_USED = 'AdditionalEnergyUsed';

const BUFFER_MS = 50;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: ADDITIONAL_ENERGY_USED,
    linkingEventId: FB_IDS,
    linkingEventType: EventType.Cast,
    referencedEventId: FB_IDS,
    referencedEventType: EventType.Drain,
    anyTarget: true, // the drain targets the player, the cast targets an enemy
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
  },
];

/**
 * Ferocious Bite consumes up to an additional 25 energy to do bonus damage.
 * This extra energy use shows up as a Drain event at the same time as the Cast.
 * This normalizer links the Drain from the Cast to make analysis easier.
 */
class FerociousBiteDrainLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

/** Gets the additional energy used by the given Ferocious Bite cast, or 0 if no related Drain event can be found */
export function getAdditionalEnergyUsed(event: CastEvent): number {
  const drainEvent = GetRelatedEvent<DrainEvent>(event, ADDITIONAL_ENERGY_USED);
  return drainEvent ? -drainEvent.resourceChange : 0;
}

export default FerociousBiteDrainLinkNormalizer;
