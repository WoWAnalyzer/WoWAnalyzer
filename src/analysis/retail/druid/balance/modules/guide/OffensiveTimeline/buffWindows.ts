import { AnyEvent, EventType } from 'parser/core/Events';

export interface BuffWindow {
  /** fight-relative milliseconds */
  startTime: number;
  /** fight-relative milliseconds */
  endTime: number;
  color: string;
  spellId: number;
}

interface TrackedBuff {
  spellId: number;
  color: string;
}

/**
 * Walks events for the given buffs on the player and produces fight-relative
 * {startTime, endTime} windows. Handles buffs that were already up at pull
 * (start = fightStart) and buffs still active at fight end (end = fightEnd).
 * Endpoints are clamped to [fightStart, fightEnd].
 */
export function extractBuffWindows(
  events: AnyEvent[],
  trackedBuffs: TrackedBuff[],
  playerId: number,
  fightStart: number,
  fightEnd: number,
): BuffWindow[] {
  const windows: BuffWindow[] = [];

  const pushWindow = (start: number, end: number, spellId: number, color: string) => {
    const clampedStart = Math.max(start, fightStart);
    const clampedEnd = Math.min(end, fightEnd);
    if (clampedEnd <= clampedStart) {
      return;
    }
    windows.push({
      startTime: clampedStart - fightStart,
      endTime: clampedEnd - fightStart,
      color,
      spellId,
    });
  };

  for (const buff of trackedBuffs) {
    let openStart: number | undefined;

    for (const event of events) {
      if (event.type !== EventType.ApplyBuff && event.type !== EventType.RemoveBuff) {
        continue;
      }
      if (event.ability.guid !== buff.spellId) {
        continue;
      }
      if (event.targetID !== playerId) {
        continue;
      }

      if (event.type === EventType.ApplyBuff) {
        openStart = event.timestamp;
      } else if (event.type === EventType.RemoveBuff) {
        pushWindow(openStart ?? fightStart, event.timestamp, buff.spellId, buff.color);
        openStart = undefined;
      }
    }

    if (openStart !== undefined) {
      pushWindow(openStart, fightEnd, buff.spellId, buff.color);
    }
  }

  return windows;
}
