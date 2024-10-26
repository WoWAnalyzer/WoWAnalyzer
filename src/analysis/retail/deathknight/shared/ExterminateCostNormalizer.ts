import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { AnyEvent, CastEvent, EventType, HasAbility } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

/**
 * The "Exterminate" buff reduces Obliterate/Marrowrend rune costs by 100% or 50% (depending on which buff). This is not reflected in the `classResources` field of the event, which breaks rune tracking.
 */
export default class ExterminateCostNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const newEvents = [];
    let activeBuff: number | undefined = undefined;
    for (let event of events) {
      if (this.isExterminateBuff(event) && event.type === EventType.ApplyBuff) {
        activeBuff = event.ability.guid;
      } else if (
        this.isExterminateBuff(event) &&
        event.type === EventType.RemoveBuff &&
        event.ability.guid === activeBuff
      ) {
        // when going from buff 1 to buff 2 the order is apply -> remove, not remove -> apply
        activeBuff = undefined;
      } else if (this.isExterminateConsumer(event) && activeBuff) {
        const effectiveCost = this.effectiveCost(event, activeBuff);
        if (effectiveCost !== undefined) {
          event = {
            ...event,
            classResources: event.classResources?.map((res) => {
              if (res.type === RESOURCE_TYPES.RUNES.id) {
                return { ...res, cost: effectiveCost };
              }
              return res;
            }),
            __modified: true,
          };
        }
      }
      newEvents.push(event);
    }
    return newEvents;
  }

  isExterminateBuff(event: AnyEvent): boolean {
    return (
      HasAbility(event) &&
      (event.ability.guid === SPELLS.EXTERMINATE_BUFF.id ||
        event.ability.guid === SPELLS.EXTERMINATE_PAINFUL_DEATH_BUFF.id)
    );
  }

  isExterminateConsumer(event: AnyEvent): event is CastEvent {
    return (
      HasAbility(event) &&
      event.type === EventType.Cast &&
      (event.ability.guid === talents.MARROWREND_TALENT.id ||
        event.ability.guid === talents.OBLITERATE_TALENT.id)
    );
  }

  effectiveCost(event: CastEvent, activeBuff: number): number | undefined {
    if (activeBuff === SPELLS.EXTERMINATE_BUFF.id) {
      return 0;
    } else if (activeBuff === SPELLS.EXTERMINATE_PAINFUL_DEATH_BUFF.id) {
      const rawCost = event.classResources?.find(
        (res) => res.type === RESOURCE_TYPES.RUNES.id,
      )?.cost;
      return rawCost ? rawCost / 2 : undefined;
    }

    return undefined;
  }
}
