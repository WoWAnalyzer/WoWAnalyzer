import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';
import { DamageEvent, EventType, HasRelatedEvent, RemoveBuffEvent } from 'parser/core/Events';

const BUFFER_MS = 50;

const PROCS_RAVAGE = 'GeneratesRavage';
const GAINS_PTS = 'GainsPreparingToStrike';
const FROM_PTS = 'FromGeneratedRavage';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: PROCS_RAVAGE,
    reverseLinkRelation: FROM_PTS,
    linkingEventId: SPELLS.PREPARING_TO_STRIKE.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.RAVAGE_DOTC_CAT.id,
    referencedEventType: EventType.Damage,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
    // TODO use additional condition to detect hard Ravage cast (or convoke cast) at some time as proc?
  },
  {
    // we link using the ravage proc removebuff because using cast event will miss Convoke casts,
    // and using damage events will cause complications when multiple targets are hit
    linkRelation: GAINS_PTS,
    linkingEventId: SPELLS.RAVAGE_BUFF_CAT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.PREPARING_TO_STRIKE.id,
    referencedEventType: EventType.ApplyBuff,
    forwardBufferMs: BUFFER_MS,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,
  },
];

/**
 * The TWW S3 Tier set for Druid of the Claw says "Ravage has a 40% chance to make you Ravage your target again 4 sec later at 100% of the initial power.".
 * This proc produces a buff (Preparing to Strike) which generates a Ravage upon expiration.
 * We link Ravage damage events to Preparing to Strike's buffremoved event to see which Ravages resulted from the proc.
 * We link Ravage uses (as detected by Ravage buffremoved) to Preparing to Strike buffapplied to calculate proc rate.
 */
export default class TWW3TierSetDotCRavageLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function isFromPts(event: DamageEvent): boolean {
  return HasRelatedEvent(event, FROM_PTS);
}

export function generatesRavage(event: RemoveBuffEvent): boolean {
  return HasRelatedEvent(event, PROCS_RAVAGE);
}

export function generatedPreparingToStrike(event: RemoveBuffEvent): boolean {
  return HasRelatedEvent(event, GAINS_PTS);
}
