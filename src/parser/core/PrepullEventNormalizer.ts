import { AnyEvent, EventType, HasAbility } from './Events';
import EventsNormalizer from './EventsNormalizer';
import Combatant from './Combatant';
import { Options } from './Analyzer';

export type PrepullEvent = {
  /** REQUIRED The ability id of the event that matches the pre-pull event */
  postPullEventId: number;
  /** REQUIRED The type of event that this prepull event will match, e.g. a removebuff event for a prepull applybuff */
  postPullEventType: EventType.Cast | EventType.RemoveBuff;
  /** REQUIRED The ability id of the event that occured pre-pull */
  prePullEventId: number;
  /** REQUIRED The type of event that event that occured pre-pull */
  prePullEventType: EventType.Cast | EventType.ApplyBuff;
  /** REQUIRED The maximum allowed timestamp difference between the fight start and the post-pull event */
  bufferMs: number;
  isActive: (c: Combatant) => boolean;
};

class PrepullEventNormalizer extends EventsNormalizer {
  private prepullEvents: PrepullEvent[];
  constructor(options: Options, ...prePullEvents: PrepullEvent[]) {
    super(options);
    this.prepullEvents = prePullEvents;
  }
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    this.prepullEvents.forEach((pe: PrepullEvent) => {
      events.forEach((event: AnyEvent, index: number) => {
        fixedEvents.push(event);

        if (this._timestampCheck(pe, event) && this._eventMatch(pe, event)) {
          // nothing yet
        }
      });
      events = fixedEvents;
    });

    return fixedEvents;
  }

  private _eventMatch(pe: PrepullEvent, event: AnyEvent): boolean {
    return (
      HasAbility(event) &&
      event.ability.guid === pe.postPullEventId &&
      event.type === pe.postPullEventType
    );
  }

  private _timestampCheck(pe: PrepullEvent, event: AnyEvent): boolean {
    return event.timestamp - this.owner.fight.start_time < pe.bufferMs;
  }
}

export default PrepullEventNormalizer;
