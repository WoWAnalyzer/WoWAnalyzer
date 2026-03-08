import Analyzer from 'parser/core/Analyzer';
import EventHistory from 'parser/shared/modules/EventHistory';
import { HasTarget, HasHitpoints, EventType, AnyEvent } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

class SharedCode extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  /**
   * @param event the event that you want to check the target's health on.
   * @returns the target's health percentage (in decimal, i.e. 0.75 = 75%)
   */
  getTargetHealth(event: AnyEvent) {
    if (!HasTarget(event)) {
      return;
    }

    const target = encodeTargetString(event.targetID, event.targetInstance);
    const damageEvents = this.eventHistory.getEvents(EventType.Damage, {
      searchBackwards: false,
      startTimestamp: event.timestamp,
    });
    if (!damageEvents) {
      return;
    }

    const relevantEvent = damageEvents.find(
      (e) => target && target === encodeTargetString(e.targetID, e.targetInstance),
    );

    if (relevantEvent && HasHitpoints(relevantEvent)) {
      return relevantEvent.hitPoints / relevantEvent.maxHitPoints;
    } else {
      return;
    }
  }
}

export default SharedCode;
