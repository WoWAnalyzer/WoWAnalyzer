import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  ResourceChangeEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';

const CAST_BUFFER_MS = 100;
const MUSHROOM_BUFFER_MS = 1_100;

const FROM_HARDCAST = 'FromHardcast';
const HITS_TARGET = 'HitsTarget';
const GENERATES_AP = 'GeneratesAp';

// TODO TWW - add hit count AoE module
const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HITS_TARGET,
    linkingEventId: SPELLS.STARFIRE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.STARFIRE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: GENERATES_AP,
    linkingEventId: SPELLS.STARFIRE.id,
    linkingEventType: EventType.ResourceChange,
    referencedEventId: SPELLS.STARFIRE.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true, // cast on target, energize on self
  },
  {
    linkRelation: HITS_TARGET,
    reverseLinkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.MOONFIRE_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.MOONFIRE_DEBUFF.id,
    referencedEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true, // want to catch Twin Moonfire cleaves here
    maximumLinks: 2, // remote but real possiblity of accidentally picking up Treant moonfires, cap links if that happens
  },
  // wild mushroom bursts exactly 1 sec after cast - TODO any danger of overlap if player spams at high haste?
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: HITS_TARGET,
    linkingEventId: SPELLS.WILD_MUSHROOM.id,
    linkingEventType: EventType.Damage,
    referencedEventId: TALENTS_DRUID.WILD_MUSHROOM_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: 0,
    backwardBufferMs: MUSHROOM_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
  },
];

/**
 * Links some Balance spells to their targets hit and astral power gained.
 *
 * This normalizer links Damage/Debuffs back to the Cast event that caused it
 * (if one can be found). This makes it easier to count the number of targets hit.
 *
 * This normalizer links Energizes back to the Cast event that caused it (if one can be found) -
 * making it easier to do AsP related analysis.
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function hardcastGetHits(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(event, HITS_TARGET, (e): e is DamageEvent => e.type === EventType.Damage);
}

export function hardcastTargetsHit(event: CastEvent): number {
  return GetRelatedEvents(event, HITS_TARGET).length;
}

export function hardcastApGenerated(event: CastEvent): ResourceChangeEvent | undefined {
  const events: ResourceChangeEvent[] = GetRelatedEvents(
    event,
    GENERATES_AP,
    (e): e is ResourceChangeEvent => e.type === EventType.ResourceChange,
  );
  return events.pop();
}

export default CastLinkNormalizer;
