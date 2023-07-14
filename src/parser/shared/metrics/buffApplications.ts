import { MappedEvent, EventType } from 'parser/core/Events';
import metric from 'parser/core/metric';

/**
 * Returns the index of the last element in the array where predicate is true, and -1
 * otherwise.
 * Source: https://stackoverflow.com/a/53187807/684353
 * @param array The source array to search in
 * @param predicate find calls predicate once for each element of the array, in descending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findLast immediately returns that element. Otherwise, findLast returns undefined.
 */
export function findLast<T>(
  array: T[],
  predicate: (value: T, index: number, obj: T[]) => boolean,
): T | undefined {
  let l = array.length;
  while (l !== 0) {
    l -= 1;
    if (predicate(array[l], l, array)) {
      return array[l];
    }
  }
  return undefined;
}

/**
 * Returns an object with all buff applications. Should probably not be used
 * directly in configs, but only internally by other shared stats.
 */
const buffApplications = (events: MappedEvent[]) =>
  events.reduce<{
    [spellId: number]: {
      [sourceId: number]: Array<{
        targetId: number;
        targetInstance?: number;
        start?: number;
        end?: number;
      }>;
    };
  }>((obj, event) => {
    if (
      event.type !== EventType.ApplyBuff &&
      event.type !== EventType.RemoveBuff &&
      event.type !== EventType.ApplyDebuff &&
      event.type !== EventType.RemoveDebuff
    ) {
      return obj;
    }

    const spellBuffs = (obj[event.ability.guid] = obj[event.ability.guid] || {});
    const sourceSpellBuffs = (spellBuffs[event.sourceID || 0] =
      spellBuffs[event.sourceID || 0] || []);

    if (event.type === EventType.ApplyBuff || event.type === EventType.ApplyDebuff) {
      sourceSpellBuffs.push({
        targetId: event.targetID,
        targetInstance: event.targetInstance,
        start: event.timestamp,
        end: undefined,
      });
    } else if (event.type === EventType.RemoveBuff || event.type === EventType.RemoveDebuff) {
      const item = findLast(
        sourceSpellBuffs,
        (item) => item.targetId === event.targetID && item.targetInstance === event.targetInstance,
      );

      if (item) {
        item.end = event.timestamp;
      } else {
        sourceSpellBuffs.push({
          targetId: event.targetID,
          targetInstance: event.targetInstance,
          start: undefined,
          end: event.timestamp,
        });
      }
    }
    return obj;
  }, {});

export default metric(buffApplications);
