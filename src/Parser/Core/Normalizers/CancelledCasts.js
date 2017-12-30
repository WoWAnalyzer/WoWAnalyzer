import EventsNormalizer from 'Parser/Core/EventsNormalizer';

/**
 * During analysis there's no way to know at a `begincast` event if it will end up being canceled. This marks all `begincast` events by the player with an `isCancelled` property whether it was cancelled.
 */
class CancelledCasts extends EventsNormalizer {
  normalize(events) {
    let lastBeginCast = null;
    const markLastBeginCastCancelled = () => {
      lastBeginCast.isCancelled = true;
      lastBeginCast = null;
    };
    const markLastBeginCastCompleted = () => {
      lastBeginCast.isCancelled = false;
      lastBeginCast = null;
    };
    events.forEach(event => {
      if (!this.owner.byPlayer(event)) {
        // We don't get `begincast` events from other players, but we do get `cast` events. This might confuse this method so just ignore all events from other players.
        return;
      }

      const isCasting = !!lastBeginCast;
      if (event.type === 'begincast') {
        if (isCasting) {
          markLastBeginCastCancelled();
        }
        lastBeginCast = event;
      }
      if (event.type === 'cast') {
        if (isCasting) {
          if (lastBeginCast.ability.guid !== event.ability.guid) {
            markLastBeginCastCancelled();
          } else {
            markLastBeginCastCompleted();
          }
        }
      }
    });
    return events;
  }
}

export default CancelledCasts;
