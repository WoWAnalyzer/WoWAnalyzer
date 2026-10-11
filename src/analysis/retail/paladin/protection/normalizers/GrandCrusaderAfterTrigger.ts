import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import HIT_TYPES from 'game/HIT_TYPES';

export const GRAND_CRUSADER_WINDOW_MS = 5;

export const GRAND_CRUSADER_HAMMERS = [
  TALENTS.BLESSED_HAMMER_TALENT,
  TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT,
];

export const GRAND_CRUSADER_AVOIDANCE_HIT_TYPES = [HIT_TYPES.DODGE, HIT_TYPES.PARRY];

export default class GrandCrusaderAfterTrigger extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const playerId = this.owner.playerId;
    const isTrigger = (event: AnyEvent) =>
      (event.type === EventType.Cast &&
        event.sourceID === playerId &&
        GRAND_CRUSADER_HAMMERS.some((spell) => spell.id === event.ability.guid)) ||
      (event.type === EventType.Damage &&
        event.targetID === playerId &&
        GRAND_CRUSADER_AVOIDANCE_HIT_TYPES.includes(event.hitType)) ||
      (event.type === EventType.Absorbed &&
        event.sourceID === playerId &&
        event.ability.guid === SPELLS.HOLY_BULWARK_ABSORB.id);
    const isProc = (event: AnyEvent) =>
      (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff) &&
      event.targetID === playerId &&
      event.ability.guid === SPELLS.GRAND_CRUSADER_BUFF.id;

    const result: AnyEvent[] = [];
    let triggerTimestamp: number | undefined;
    let delayed: AnyEvent[] = [];
    const flush = () => {
      result.push(...delayed);
      delayed = [];
      triggerTimestamp = undefined;
    };

    events.forEach((event) => {
      if (triggerTimestamp !== undefined && event.timestamp > triggerTimestamp) {
        flush();
      }

      if (isTrigger(event)) {
        for (let i = result.length - 1; i >= 0; i -= 1) {
          if (
            event.timestamp - result[i].timestamp > GRAND_CRUSADER_WINDOW_MS ||
            isTrigger(result[i])
          ) {
            break;
          }
          if (isProc(result[i])) {
            delayed.unshift({ ...result.splice(i, 1)[0], timestamp: event.timestamp + 1 });
          }
        }
        triggerTimestamp = event.timestamp;
        result.push(event);
        return;
      }

      if (triggerTimestamp !== undefined && isProc(event)) {
        delayed.push({ ...event, timestamp: triggerTimestamp + 1 });
        return;
      }

      result.push(event);
    });
    flush();
    return result;
  }
}
