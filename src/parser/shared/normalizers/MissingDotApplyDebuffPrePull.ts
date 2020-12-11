
import { AnyEvent, DamageEvent, EventType, ApplyDebuffEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

// We can stop the normalization after 5 seconds. Any dot that was applied during pre-pull should've ticked.
const CUTOFF = 5000;

export interface Dot {
  debuffId: number;
}

export interface DotStatus {
  debuffId: number;
  missingApplyDebuff?: boolean;
  // The first damage event we find of a dot that is missing an apply debuff event. Used to fabricate the apply debuff event.
  damageEvent?: DamageEvent;
}

/*
 * I noticed in my report that it was missing the apply debuff event for my unstable affliction. I believe I cast it during the pre-pull.
 * The uptime calculations look for the time between the apply debuff and remove debuff events, and without the apply debuff event, it was doing crazy things!
 */
class MissingDotApplyDebuffPrePull extends EventsNormalizer {

  static dots: Dot[] = [];

  normalize(events: AnyEvent[]): AnyEvent[] {
    const ctor = this.constructor as typeof MissingDotApplyDebuffPrePull;

    const fightStartTimestamp = this.owner.fight.start_time;
    const cutoff = fightStartTimestamp + CUTOFF;

    const dotStatusesMap: { [index: number]: DotStatus } = ctor.dots.reduce((map, debuff) => {
      map[debuff.debuffId] = { debuffId: debuff.debuffId, handled: false, missingApplyDebuff: null };
      return map;
    }, {} as any);

    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];

      if (!this.owner.byPlayer(event)) {
        continue;
      }

      if (event.timestamp > cutoff) {
        break;
      }

      if (event.type === EventType.ApplyDebuff) {
        const dotStatus = dotStatusesMap[event.ability.guid];
        if (dotStatus == null) {
          continue;
        }

        if (dotStatus.missingApplyDebuff == null) {
          // Seems we see the apply debuff event before we find any damage event. We're all good here.
          dotStatus.missingApplyDebuff = false;
        }
      } else if (event.type === EventType.Damage) {

        const dotStatus = dotStatusesMap[event.ability.guid];
        if (dotStatus == null) {
          continue;
        }


        if (dotStatus.missingApplyDebuff == null) {
          // So we got a damage event but we didn't see an apply debuff event for it beforehand. Mark it and we'll fabricate one.

          // Sometimes the DoT ticks, and then we get the apply debuff.
          // Example:
          // 00:00:02.084	Swaggar Haunt Shriekwing 1329
          // 00:00:02.084	Shriekwing is afflicted by Haunt from Swaggar

          for (let j = i + 1; j < events.length; j++) {
            const futureEvent = events[j];

            if (!this.owner.byPlayer(futureEvent)) {
              continue;
            }

            if (futureEvent.timestamp > event.timestamp) {
              // It seems the apply debuff and damage happen at the same timestamp, just out of order sometimes.
              break;
            }

            if (futureEvent.type === EventType.ApplyDebuff
               && futureEvent.ability.guid === dotStatus.debuffId) {
              // There is an out-of-order apply debuff, so won't need to fabricate one after all
              dotStatus.missingApplyDebuff = false;
              break;
            }
          }

          if (dotStatus.missingApplyDebuff == null) {
            dotStatus.missingApplyDebuff = true;
            dotStatus.damageEvent = event as DamageEvent;
          }
        }
      }
    }

    // Fabricate the missing Apply Debuff events, with timestamp at the very beginning of the fight.

    const missingApplyDebuffsEvents = Object.values(dotStatusesMap).filter(ds => ds.missingApplyDebuff)
      .map(dotStatus => ctor._fabricateApplyDebuffEvent(dotStatus.damageEvent!, fightStartTimestamp));

    return [...missingApplyDebuffsEvents, ...events];
  }

  static _fabricateApplyDebuffEvent(event: DamageEvent, timestamp: number): ApplyDebuffEvent {
    return {
      type: EventType.ApplyDebuff,
      ability: event.ability,
      sourceID: event.sourceID,
      sourceIsFriendly: event.sourceIsFriendly,
      targetID: event.targetID,
      targetIsFriendly: event.targetIsFriendly,
      timestamp: timestamp,

      // Custom properties:
      __fabricated: true,
    };
  }
}

export default MissingDotApplyDebuffPrePull;
