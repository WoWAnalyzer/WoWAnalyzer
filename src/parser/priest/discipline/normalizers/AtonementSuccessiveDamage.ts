import { AnyEvent, DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

import isAtonement from '../modules/core/isAtonement';
import { ATONEMENT_DAMAGE_SOURCES } from '../constants';

class AtonementSuccessiveDamage extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    const _damageEventIndexes: number[] = [];

    let _encounteredTargetIDs: number[] = [];

    events.forEach((event: AnyEvent, eventIndex) => {
      fixedEvents.push(event);

      if (
        event.type === EventType.Damage &&
        (event as DamageEvent).sourceIsFriendly &&
        !(event as DamageEvent).targetIsFriendly &&
        ATONEMENT_DAMAGE_SOURCES[(event as DamageEvent).ability.guid]
      ) {
        _damageEventIndexes.push(eventIndex);
        _encounteredTargetIDs = [];
        return;
      }

      if (event.type === EventType.Heal && isAtonement((event as HealEvent))) {
        // We encountered a targetID we already encountered since the last damage
        // event. We push down the last damage event here
        if (_encounteredTargetIDs.includes((event as HealEvent).targetID)) {
          const lastDamageEvent: AnyEvent = fixedEvents.splice(
            _damageEventIndexes[_damageEventIndexes.length - 1],
            1,
          )[0];
          lastDamageEvent.__modified = true;
          fixedEvents.splice(fixedEvents.length - 1, 0, lastDamageEvent);
          _encounteredTargetIDs = [];
          return;
        }

        //  We ignore atonement on self in the handling of repeating targetIDs
        //  Because of latency issues, the atonement on self does not follow
        //  the same rules normal atonement does. We will handle these cases
        //  in another normalizer
        if ((event as HealEvent).sourceID !== (event as HealEvent).targetID) {
          _encounteredTargetIDs.push((event as HealEvent).targetID);
        }
      }
    });
    return fixedEvents;
  }
}

export default AtonementSuccessiveDamage;
