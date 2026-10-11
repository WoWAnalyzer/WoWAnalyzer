import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';

const BUFFER_MS = 100;

const HAMMERS = [TALENTS.BLESSED_HAMMER_TALENT.id, TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT.id];

export default class GrandCrusaderAfterHammer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const playerId = this.owner.playerId;
    const isHammerCast = (event: AnyEvent) =>
      event.type === EventType.Cast &&
      event.sourceID === playerId &&
      HAMMERS.includes(event.ability.guid);
    const isGrandCrusaderProc = (event: AnyEvent) =>
      (event.type === EventType.ApplyBuff || event.type === EventType.RefreshBuff) &&
      event.targetID === playerId &&
      event.ability.guid === SPELLS.GRAND_CRUSADER_BUFF.id;

    const result: AnyEvent[] = [];
    let hammerTimestamp: number | undefined;
    let delayed: AnyEvent[] = [];
    const flush = () => {
      result.push(...delayed);
      delayed = [];
      hammerTimestamp = undefined;
    };

    events.forEach((event) => {
      if (hammerTimestamp !== undefined && event.timestamp > hammerTimestamp) {
        flush();
      }

      if (isHammerCast(event)) {
        for (let i = result.length - 1; i >= 0; i -= 1) {
          if (event.timestamp - result[i].timestamp > BUFFER_MS) {
            break;
          }
          if (isGrandCrusaderProc(result[i])) {
            delayed.unshift({ ...result.splice(i, 1)[0], timestamp: event.timestamp + 1 });
          }
        }
        hammerTimestamp = event.timestamp;
        result.push(event);
        return;
      }

      if (hammerTimestamp !== undefined && isGrandCrusaderProc(event)) {
        delayed.push({ ...event, timestamp: hammerTimestamp + 1 });
        return;
      }

      result.push(event);
    });
    flush();
    return result;
  }
}
