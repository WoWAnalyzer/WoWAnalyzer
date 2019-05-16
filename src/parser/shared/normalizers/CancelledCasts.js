import EventsNormalizer from 'parser/core/EventsNormalizer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import CASTABLE_WHILE_CASTING_SPELLS from 'parser/core/CASTABLE_WHILE_CASTING_SPELLS';

const MS_BUFFER = 100;

/**
 * During analysis there's no way to know at a `begincast` event if it will end up being canceled. This marks all `begincast` events by the player with an `isCancelled` property whether it was cancelled.
 */
class CancelledCasts extends EventsNormalizer {
  lastBeginCast = null;
  get isCasting() {
    return this.lastBeginCast !== null;
  }
  markLastBeginCastCancelled() {
    this.lastBeginCast.isCancelled = true;
    this.lastBeginCast.castEvent = null;
    this.lastBeginCast = null;
  }
  markLastBeginCastCompleted(castEvent) {
    this.lastBeginCast.isCancelled = false;
    this.lastBeginCast.castEvent = castEvent;
    this.lastBeginCast = null;
  }

  handleBeginCast(event) {
    if (this.isCasting && event.timestamp - this.lastBeginCast.timestamp > MS_BUFFER) {
      this.markLastBeginCastCancelled();
    }
    this.lastBeginCast = event;
  }
  handleCast(event) {
    if (!this.isCasting) {
      return;
    }
    if (CASTS_THAT_ARENT_CASTS.includes(event.ability.guid) || CASTABLE_WHILE_CASTING_SPELLS.includes(event.ability.guid)) {
      return;
    }

    if (this.lastBeginCast.ability.guid !== event.ability.guid) {
      // The player started to cast something else. Sometimes this is incorrectly called due to boss mechanics being recorded as `cast` event during a non-cancelled channel. We handle that by ignoring these spells in the CASTS_THAT_ARENT_CASTS.js file.
      this.markLastBeginCastCancelled();
    } else {
      this.markLastBeginCastCompleted(event);
    }
  }

  normalize(events) {
    events.forEach(event => {
      if (!this.owner.byPlayer(event)) {
        // We don't get `begincast` events from other players, but we do get `cast` events. This might confuse this method so just ignore all events from other players.
        return;
      }

      if (event.type === 'begincast') {
        this.handleBeginCast(event);
      } else if (event.type === 'cast') {
        this.handleCast(event);
      }
    });
    return events;
  }
}

export default CancelledCasts;
