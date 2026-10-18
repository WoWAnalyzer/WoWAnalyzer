import SPELLS from 'common/SPELLS/evoker';
import Spell from 'common/SPELLS/Spell';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Options } from 'parser/core/Module';

const DEFAULT_BUFFER_MS = 25;

type StackEventType = EventType.ApplyBuffStack | EventType.RemoveBuffStack;

export interface BuffStackRefreshPairing {
  buff: Spell;
  /** The stack events that are followed by a refresh of the same buff */
  pairedWith: StackEventType[];
  /** Max delay between the stack event and its refresh. Defaults to 25ms. */
  bufferMs?: number;
}

/** Essence Burst is shared by all specs, so it's always included */
const ESSENCE_BURST_REFRESH_PAIRINGS: BuffStackRefreshPairing[] = [
  SPELLS.ESSENCE_BURST_BUFF,
  SPELLS.ESSENCE_BURST_DEV_BUFF,
  SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF,
].map((buff) => ({ buff, pairedWith: [EventType.RemoveBuffStack] }));

/**
 * Some buffs log a refresh event right after a stack is applied or removed. This messes with our analysis.
 *
 * Each stack event removes at most one refresh, so a real refresh logged right after it is kept.
 */
class BuffStackRefreshRemover extends EventsNormalizer {
  private readonly pairings: Map<number, Required<BuffStackRefreshPairing>>;

  constructor(options: Options, extraPairings: BuffStackRefreshPairing[] = []) {
    super(options);
    this.pairings = new Map(
      [...ESSENCE_BURST_REFRESH_PAIRINGS, ...extraPairings].map((pairing) => [
        pairing.buff.id,
        { ...pairing, bufferMs: pairing.bufferMs ?? DEFAULT_BUFFER_MS },
      ]),
    );
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    /** Timestamp of the last stack event that is still waiting for its refresh, by buff */
    const lastStackEventTimestamps = new Map<number, number>();

    return events.filter((event) => {
      if (
        event.type !== EventType.ApplyBuffStack &&
        event.type !== EventType.RemoveBuffStack &&
        event.type !== EventType.RefreshBuff
      ) {
        return true;
      }
      const pairing = this.pairings.get(event.ability.guid);
      if (!pairing) {
        return true;
      }

      if (event.type !== EventType.RefreshBuff) {
        if (pairing.pairedWith.includes(event.type)) {
          lastStackEventTimestamps.set(event.ability.guid, event.timestamp);
        }
        return true;
      }

      const lastStackEventTimestamp = lastStackEventTimestamps.get(event.ability.guid);
      if (
        lastStackEventTimestamp !== undefined &&
        event.timestamp - lastStackEventTimestamp <= pairing.bufferMs
      ) {
        lastStackEventTimestamps.delete(event.ability.guid);
        return false;
      }
      return true;
    });
  }
}

export default BuffStackRefreshRemover;
