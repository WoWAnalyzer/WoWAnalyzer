import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { AnyEvent, EventType, GetRelatedEvents, RefreshBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

/**
 * When going from 2->1 stacks of Sudden Death, two buff events are logged
 * 1) A Remove Buff Stack event - this is exactly what we'd expect
 * 2) A Refresh Buff event - this makes no sense, since the buff duration is *not* refreshed in game
 * example log: https://www.warcraftlogs.com/reports/jbnJrTBAX6Zc92Ch?fight=9&type=auras&source=63&view=events&ability=52437&start=1354600&end=1363293
 *
 *
 * These RefreshBuff events cause a bug with the AplCheck, since its internal tracking of the buff duration
 * is affected by these events, and doesn't match what's actually happening in game
 *
 * This normalizer finds those RefreshBuff events that are tied to the RemoveBuffStack events and removes them
 */
const SUDDEN_DEATH_REMOVE_BUFF_STACK = 'Sudden-Death-Remove-Buff-Stack';
const SUDDEN_DEATH_BUFF_BUFFER_MS = 10; // RemoveBuffStack and RefreshBuff events *should* be at the exact same timestamp, but give some wiggle room

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: SUDDEN_DEATH_REMOVE_BUFF_STACK,
    linkingEventId: [SPELLS.SUDDEN_DEATH_TALENT_BUFF.id],
    linkingEventType: EventType.RefreshBuff,
    referencedEventId: SPELLS.SUDDEN_DEATH_TALENT_BUFF.id,
    referencedEventType: EventType.RemoveBuffStack,
    forwardBufferMs: SUDDEN_DEATH_BUFF_BUFFER_MS,
    backwardBufferMs: SUDDEN_DEATH_BUFF_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: SUDDEN_DEATH_REMOVE_BUFF_STACK,
    linkingEventId: [SPELLS.SUDDEN_DEATH_FURY_TALENT_BUFF.id],
    linkingEventType: EventType.RefreshBuff,
    referencedEventId: SPELLS.SUDDEN_DEATH_FURY_TALENT_BUFF.id,
    referencedEventType: EventType.RemoveBuffStack,
    forwardBufferMs: SUDDEN_DEATH_BUFF_BUFFER_MS,
    backwardBufferMs: SUDDEN_DEATH_BUFF_BUFFER_MS,
    anyTarget: true,
  },
];

function isSuddenDeathRemoveBuffStack(event: RefreshBuffEvent): boolean {
  return GetRelatedEvents(event, SUDDEN_DEATH_REMOVE_BUFF_STACK).length > 0;
}

class SuddenDeathBuffNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }

  normalize(rawEvents: AnyEvent[]): AnyEvent[] {
    const events = super.normalize(rawEvents);

    events.forEach((event, index) => {
      if (event.type === EventType.RefreshBuff && isSuddenDeathRemoveBuffStack(event)) {
        events.splice(index, 1); // remove RefreshBuff event
      }
    });
    return events;
  }
}

export default SuddenDeathBuffNormalizer;
