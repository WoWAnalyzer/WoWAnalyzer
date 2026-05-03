import Spell from 'common/SPELLS/Spell';
import { AnyEvent, EventType } from 'parser/core/Events';

export interface BuffSpec {
  spell: Spell;
  color?: string;
}

export interface BuffWindow {
  /** fight-relative milliseconds */
  startTime: number;
  /** fight-relative milliseconds */
  endTime: number;
  color?: string;
}

/**
 * Walks events for the given buff specs on the player and produces
 * fight-relative {startTime, endTime} windows. Handles buffs that were
 * already up at pull (start = 0) and buffs still active at fight end
 * (end = fightDuration).
 */
export function extractBuffWindows(
  events: AnyEvent[],
  buffs: BuffSpec[],
  playerId: number,
  fightStart: number,
  fightEnd: number,
): BuffWindow[] {
  const windows: BuffWindow[] = [];

  for (const buff of buffs) {
    const spellId = buff.spell.id;
    let openStart: number | undefined;

    for (const event of events) {
      if (event.type !== EventType.ApplyBuff && event.type !== EventType.RemoveBuff) {
        continue;
      }
      if (event.ability.guid !== spellId) {
        continue;
      }
      if (event.targetID !== playerId) {
        continue;
      }

      if (event.type === EventType.ApplyBuff) {
        openStart = event.timestamp;
      } else if (event.type === EventType.RemoveBuff) {
        const start = openStart ?? fightStart;
        windows.push({
          startTime: start - fightStart,
          endTime: event.timestamp - fightStart,
          color: buff.color,
        });
        openStart = undefined;
      }
    }

    if (openStart !== undefined) {
      windows.push({
        startTime: openStart - fightStart,
        endTime: fightEnd - fightStart,
        color: buff.color,
      });
    }
  }

  return windows;
}
