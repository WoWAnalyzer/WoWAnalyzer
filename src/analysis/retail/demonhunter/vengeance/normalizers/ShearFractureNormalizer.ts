import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import {
  CastEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  RemoveBuffStackEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

/*
WCL: https://www.warcraftlogs.com/reports/Y7BWyCx3mHVZzPrk#fight=last&type=summary&view=events&pins=2%24Off%24%23244F4B%24casts%7Cauras%24-1%240.0.0.Any%240.0.0.Any%24true%240.0.0.Any%24true%24258920%7C204255%7C203981%7C263642
Default spell is Shear (generates 1 soul). Fracture (generates 2 souls) talent replaces it.
Vengence can have a maxium of 5 souls. Log has 4 fracture casts. Meaning 5 gained souls and 3 wasted. 2 of the 4 casts are bad.
Souls are generated on a slight delay. Souls should be cast within 1.3 seconds.
If a soul is cast and then a buff is removed within 100 ms that means it was a wasted soul generation.
 */

// Note that this number may need to change with sufficient levels of haste.
const SOUL_GENERATE_BUFFER = 1300;
const SOUL_WASTED_BUFFER = 100;
const RESOURCE_CHANGE_BUFFER = 100;

const GENERATED_SOUL_FRAGMENT = 'ShearFractureGeneratedSoulFragment';
const WASTED_SOUL_FRAGMENT = 'ShearFractureWastedSoulFragment';
const RESOURCE_CHANGE = 'ShearFractureResourceChange';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: GENERATED_SOUL_FRAGMENT,
    referencedEventId: [SPELLS.SHEAR.id, TALENTS.FRACTURE_TALENT.id],
    referencedEventType: EventType.Cast,
    linkingEventId: SPELLS.SOUL_FRAGMENT.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: 0,
    backwardBufferMs: SOUL_GENERATE_BUFFER,
    anyTarget: true,
  },
  {
    linkRelation: WASTED_SOUL_FRAGMENT,
    referencedEventId: SPELLS.SOUL_FRAGMENT.id,
    referencedEventType: EventType.Cast,
    linkingEventId: SPELLS.SOUL_FRAGMENT_STACK.id,
    linkingEventType: EventType.RemoveBuffStack,
    forwardBufferMs: SOUL_WASTED_BUFFER,
    backwardBufferMs: SOUL_WASTED_BUFFER,
    anyTarget: true,
  },
  {
    linkRelation: RESOURCE_CHANGE,
    referencedEventId: [SPELLS.SHEAR.id, TALENTS.FRACTURE_TALENT.id],
    referencedEventType: EventType.ResourceChange,
    linkingEventId: [SPELLS.SHEAR.id, TALENTS.FRACTURE_TALENT.id],
    linkingEventType: EventType.Cast,
    forwardBufferMs: RESOURCE_CHANGE_BUFFER,
    backwardBufferMs: RESOURCE_CHANGE_BUFFER,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition: (linkingEvent, referencedEvent) =>
      referencedEvent.type === EventType.ResourceChange &&
      referencedEvent.resourceChangeType === RESOURCE_TYPES.FURY.id,
  },
];

/**
 * The applybuff from demonic is logged before the cast of Eye Beam.
 * This normalizes events so that the Eye Beam applybuff always comes before the Meta Havoc buff
 **/
export default class ShearFractureNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getGeneratingCast(event: CastEvent): CastEvent | undefined {
  return GetRelatedEvents<CastEvent>(
    event,
    GENERATED_SOUL_FRAGMENT,
    (e): e is CastEvent => e.type === EventType.Cast,
  ).pop();
}

export function getWastedSoulFragment(event: RemoveBuffStackEvent): CastEvent | undefined {
  return GetRelatedEvents<CastEvent>(
    event,
    WASTED_SOUL_FRAGMENT,
    (e): e is CastEvent => e.type === EventType.Cast,
  ).pop();
}

export function getResourceChange(event: CastEvent): ResourceChangeEvent | undefined {
  return GetRelatedEvent(
    event,
    RESOURCE_CHANGE,
    (e): e is ResourceChangeEvent => e.type === EventType.ResourceChange,
  );
}
