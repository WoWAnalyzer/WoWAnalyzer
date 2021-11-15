import SPELLS from 'common/SPELLS';
import {
  AnyEvent,
  ApplyBuffEvent,
  EventType,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

class FallenOrderCraneCloneNormalizer extends EventsNormalizer {
  foHealsToListenFor: Map<string, AnyEvent> = new Map<string, AnyEvent>();

  normalize(events: AnyEvent[]) {
    const fixedEvents: any[] = [];

    events.forEach((event) => {
      // Apply buff means we need to start listening for healing events
      if (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff) {
        const abilityGuid = event.ability.guid;
        if (
          abilityGuid === SPELLS.FALLEN_ORDER_ENVELOPING_MIST.id ||
          abilityGuid === SPELLS.FALLEN_ORDER_SOOTHING_MIST.id
        ) {
          const paring = this.makingParingStat(event);
          // save the timestamp so we can use it later to determine cast time
          this.foHealsToListenFor.set(paring, event);
          return;
        }
      } // Heal events are ones we can use gather targets HP
      else if (event.type === EventType.Heal) {
        const abilityGuid = event.ability.guid;
        if (
          abilityGuid === SPELLS.FALLEN_ORDER_ENVELOPING_MIST.id ||
          abilityGuid === SPELLS.FALLEN_ORDER_SOOTHING_MIST.id
        ) {
          const paringStat = this.makingParingStat(event);
          // bygones errors
          if (!this.foHealsToListenFor.has(paringStat)) {
            fixedEvents.push(event);
            return;
          }

          // grab our timestamp from earlier
          const buffApplied = this.foHealsToListenFor.get(paringStat);
          const timestamp = buffApplied?.timestamp;
          // Instant cast spell so we just blast off a cast
          const fabricatedCastEvent = {
            ability: {
              name: event.ability.name,
              type: event.ability.type,
              abilityIcon: event.ability.abilityIcon,
              guid: abilityGuid,
            },
            timestamp: timestamp,
            absorb: event.absorb,
            hitPoints: event.hitPoints - event.amount,
            maxHitPoints: event.maxHitPoints,
            sourceID: event.sourceID,
            sourceIsFriendly: event.sourceIsFriendly,
            targetID: event.targetID,
            targetInstance: event.targetInstance,
            targetIsFriendly: event.targetIsFriendly,
            type: EventType.Cast,
            __fabricated: true,
          };
          fixedEvents.push(fabricatedCastEvent);
          fixedEvents.push(buffApplied);
          this.removeOldData(this.makingParingStat(event));
        }
      } // Some times we apply a buff but never heal. We should listen for this and remove it from the list
      else if (event.type === EventType.RemoveBuff) {
        const abilityGuid = event.ability.guid;
        if (
          abilityGuid === SPELLS.FALLEN_ORDER_ENVELOPING_MIST.id ||
          abilityGuid === SPELLS.FALLEN_ORDER_SOOTHING_MIST.id
        ) {
          const paringStat = this.makingParingStat(event);
          // bygones errors
          if (!this.foHealsToListenFor.has(paringStat)) {
            fixedEvents.push(event);
            return;
          }
          this.fixMapping(event);
        }
      }
      fixedEvents.push(event);
    });
    return fixedEvents;
  }

  // ======== Starting Here ========
  // This bit of code was stolen from another class that didn't use a map here
  // this means some methods have been modified and now are not "needed" but we live with it
  fixMapping(event: RemoveBuffEvent) {
    this.removeOldData(this.makingParingStat(event));
  }

  removeOldData(paring: string) {
    this.foHealsToListenFor.delete(paring);
  }

  makingParingStat(event: HealEvent | ApplyBuffEvent | RefreshBuffEvent | RemoveBuffEvent) {
    return event.targetID + '|' + event.sourceID + '|' + event.ability.guid;
  }
  // ======== Ending Here ========
}

export default FallenOrderCraneCloneNormalizer;
