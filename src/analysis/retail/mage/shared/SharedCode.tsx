import { SpellInfo } from 'parser/core/EventFilter';
import { EventType, CastEvent } from 'parser/core/Events';
import CoreSharedCode from 'parser/core/SharedCode';

class SharedCode extends CoreSharedCode {
  /**
   * @param buffActive filters based on whether the buff is active or inactive (true for active, false for inactive)
   * @param buff the spell object for the buff
   * @returns an array containing each unique spell cast and the number of times it was cast
   */
  castBreakdownByBuff(buffActive: boolean, buff: SpellInfo) {
    const castEvents = buffActive
      ? this.getEventsByBuff(true, buff, EventType.Cast)
      : this.getEventsByBuff(false, buff, EventType.Cast);
    const castArray: number[][] = [];
    castEvents &&
      castEvents.forEach((c: CastEvent) => {
        const index = castArray.findIndex((arr) => arr.includes(c.ability.guid));
        if (index !== -1) {
          castArray[index][1] += 1;
        } else {
          castArray.push([c.ability.guid, 1]);
        }
      });
    return castArray;
  }
}

export default SharedCode;
