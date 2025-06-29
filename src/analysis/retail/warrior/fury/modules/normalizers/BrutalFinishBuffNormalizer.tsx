import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { AnyEvent, EventType, GetRelatedEvent, HasRelatedEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

/**
 * Brutal Finish is a buff that is applied when Bladestorm is finished channeling
 * But that buff doesn't actually get applied for 100-200ms after the bladestorm finishes
 * so it's possible for the player to queue up a spell to cast in that 100-200ms window
 * and any checks on that cast event related to having the Brutal Finish buff or not are incorrect
 *
 * This normalizer links the Brutal Finish buff apply events to the Bladestorm end event which
 * applied it, and replaces the buff apply event so that it's effectively applied instantly
 *
 * Sample report: /report/FwpATytC4fjR1YMn/22-Heroic+Sprocketmonger+Lockenstock+-+Kill+(4:25)/Nesquik/standard/timeline - the Raging Blow at 2:31 was previously flagged as incorrect because the cast event happens between the Bladestorm
 * end event and the Brutal Finish apply event
 */

const BRUTAL_FINISH_ON_BLADESTORM_END = 'Brutal-Finish-On-Bladestorm-End';
const BLADESTORM_BUFF_END_BUFFER_MS = 200; // Brutal Finish buff is applied 100-200ms after Bladestorm ends

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: BRUTAL_FINISH_ON_BLADESTORM_END,
    linkingEventId: SPELLS.BRUTAL_FINISH_BUFF.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.BLADESTORM.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: BLADESTORM_BUFF_END_BUFFER_MS,
    backwardBufferMs: BLADESTORM_BUFF_END_BUFFER_MS,
    anyTarget: true,
  },
];

class BrutalFinishBuffNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }

  normalize(rawEvents: AnyEvent[]): AnyEvent[] {
    const events = super.normalize(rawEvents);

    events.forEach((event, index) => {
      if (
        event.type === EventType.ApplyBuff &&
        HasRelatedEvent(event, BRUTAL_FINISH_ON_BLADESTORM_END)
      ) {
        const bladestormEndEvent = GetRelatedEvent(event, BRUTAL_FINISH_ON_BLADESTORM_END);
        events.splice(index, 1); // remove original Brutal Finish buff apply event
        event.timestamp = bladestormEndEvent?.timestamp || event.timestamp; // replace BF buff apply timestamp with BS end
        event.__modified = true;
        events.push(event); // add modified event back in
      }
    });
    return events;
  }
}

export default BrutalFinishBuffNormalizer;
