import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS';
import { AnyEvent, ApplyBuffEvent, EventType, AddRelatedEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Analyzer';
import { HasSource } from 'parser/core/Events';

const HOT_HAND_DURATION_MS = 8000;
const HOT_HAND_RELATION = 'hot-hand';
const LINK: EventLink = {
  linkRelation: HOT_HAND_RELATION,
  linkingEventId: SPELLS.HOT_HAND_BUFF.id,
  linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
  referencedEventId: null,
  referencedEventType: EventType.Cast,
};

export default class HotHandNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, []);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    let hotHandExpires = 0;
    let currentProc: ApplyBuffEvent | undefined;

    events
      .filter((event) => HasSource(event) && event.sourceID === this.selectedCombatant.id)
      .forEach((event: AnyEvent, eventIndex: number) => {
        // when hot hand is applied, update expected end timestamp
        if (this._isLinking(LINK, event)) {
          hotHandExpires = event.timestamp + HOT_HAND_DURATION_MS;
          if (event.type === EventType.ApplyBuff) {
            currentProc = event;
          }

          for (let forwardIndex = eventIndex + 1; forwardIndex < events.length; forwardIndex += 1) {
            const forwardEvent = events[forwardIndex];
            if (
              (event.type === EventType.RemoveBuff && event.ability.guid === LINK.linkingEventId) ||
              forwardEvent.timestamp > hotHandExpires
            ) {
              currentProc = undefined;
              break;
            }
            if (forwardEvent.type === EventType.Cast && currentProc) {
              AddRelatedEvent(currentProc, LINK.linkRelation, forwardEvent);
            }
          }
        }
      });

    return events;
  }
}
