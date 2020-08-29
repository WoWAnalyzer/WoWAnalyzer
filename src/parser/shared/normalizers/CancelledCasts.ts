import EventsNormalizer from 'parser/core/EventsNormalizer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import CASTABLE_WHILE_CASTING_SPELLS from 'parser/core/CASTABLE_WHILE_CASTING_SPELLS';
import { Event, BeginCastEvent, EventType, CastEvent } from 'parser/core/Events';

const MS_BUFFER = 100;

/**
 * During analysis there's no way to know at a `begincast` event if it will end up being canceled. This marks all `begincast` events by the player with an `isCancelled` property whether it was cancelled.
 */
class CancelledCasts extends EventsNormalizer {
  lastBeginCast: BeginCastEvent | null = null;

  markLastBeginCastCancelled() {
    if (this.lastBeginCast === null) {
      return;
    }
    this.lastBeginCast.isCancelled = true;
    this.lastBeginCast.castEvent = null;
    this.lastBeginCast = null;
  }
  handleBeginCast(event: BeginCastEvent) {
    if (this.lastBeginCast !== null && event.timestamp - this.lastBeginCast.timestamp > MS_BUFFER) {
      this.markLastBeginCastCancelled();
    }
    this.lastBeginCast = event;
  }
  handleCast(event: CastEvent) {
    if (this.lastBeginCast === null) {
      return;
    }
    if (CASTS_THAT_ARENT_CASTS.includes(event.ability.guid) || CASTABLE_WHILE_CASTING_SPELLS.includes(event.ability.guid)) {
      return;
    }
    if (this.lastBeginCast.ability.guid !== event.ability.guid) {
      // The player started to cast something else. Sometimes this is incorrectly called due to boss mechanics being recorded as `cast` event during a non-cancelled channel. We handle that by ignoring these spells in the CASTS_THAT_ARENT_CASTS.js file.
      this.markLastBeginCastCancelled();
    } else {
      // Mark cast completed
      this.lastBeginCast.isCancelled = false;
      this.lastBeginCast.castEvent = event;
      this.lastBeginCast = null;
    }
  }

  normalize(events: Array<Event<any>>) {
    events.forEach(event => {
      if (!this.owner.byPlayer(event)) {
        // We don't get `begincast` events from other players, but we do get `cast` events. This might confuse this method so just ignore all events from other players.
        return;
      }

      if (event.type === EventType.BeginCast) {
        this.handleBeginCast(event as BeginCastEvent);
      } else if (event.type === EventType.Cast) {
        this.handleCast(event as CastEvent);
      }
    });
    return events;
  }
}

export default CancelledCasts;
