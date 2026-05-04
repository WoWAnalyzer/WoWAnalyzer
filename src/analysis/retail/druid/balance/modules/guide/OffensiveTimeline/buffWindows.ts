import { AnyEvent, EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { cdSpell } from 'analysis/retail/druid/balance/constants';
import Combatant from 'parser/core/Combatant';

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

const CD_COLOR = '#26d4c8';
const SOLAR_COLOR = '#e58a3a';
const LUNAR_COLOR = '#7ab2ff';

/**
 * Walks events for the given buffs on the player and produces fight-relative
 * {startTime, endTime} windows. Handles buffs that were already up at pull
 * (start = fightStart) and buffs still active at fight end (end = fightEnd).
 * Endpoints are clamped to [fightStart, fightEnd].
 */
export function extractBuffWindows(
  events: AnyEvent[],
  combatant: Combatant,
  fightStart: number,
  fightEnd: number,
): BuffWindow[] {
  const windows: BuffWindow[] = [];
  const mainSpell = cdSpell(combatant);
  const trackedBuffs: TrackedBuff[] = [
    { spellId: mainSpell.id, color: CD_COLOR },
    { spellId: SPELLS.ECLIPSE_SOLAR.id, color: SOLAR_COLOR },
    { spellId: SPELLS.ECLIPSE_LUNAR.id, color: LUNAR_COLOR },
  ];

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
      if (event.targetID !== combatant.id) {
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

  // Remove or update Solar/Lunar Eclipse windows that overlap a CA/Incarn window
  const mainSpellWindows = windows.filter((window) => window.spellId === mainSpell.id);
  const eclipseWindows = windows.filter((window) => window.spellId !== mainSpell.id);
  const trimmedEclipseWindows: BuffWindow[] = [];
  for (const eclipseWindow of eclipseWindows) {
    // Remove eclipe windows that are entirely contained within a CA/Incarn window
    // Use 100ms precision to account for events not being perfectly on time
    const isInsideMainSpellWindow = mainSpellWindows.some(
      (mainWindow) =>
        Math.abs(mainWindow.endTime - eclipseWindow.endTime) < 100 &&
        Math.abs(mainWindow.startTime - eclipseWindow.startTime) < 100,
    );
    if (isInsideMainSpellWindow) {
      continue;
    }

    // Update eclipe windows that start within a CA/Incarn window
    // Use 100ms precision to account for events not being perfectly on time
    const mainSpellWindowSameStartTime = mainSpellWindows.find(
      (mainWindow) => Math.abs(mainWindow.startTime - eclipseWindow.startTime) < 200,
    );
    if (mainSpellWindowSameStartTime != undefined) {
      eclipseWindow.startTime = mainSpellWindowSameStartTime.endTime;
    }

    // Update eclipe windows that end within a CA/Incarn window
    // Use 100ms precision to account for events not being perfectly on time
    const mainSpellWindowSameEndTime = mainSpellWindows.find(
      (mainWindow) => Math.abs(mainWindow.endTime - eclipseWindow.endTime) < 200,
    );
    if (mainSpellWindowSameEndTime != undefined) {
      eclipseWindow.endTime = mainSpellWindowSameEndTime.startTime;
    }

    trimmedEclipseWindows.push(eclipseWindow);
  }

  return [...mainSpellWindows, ...trimmedEclipseWindows];
}
