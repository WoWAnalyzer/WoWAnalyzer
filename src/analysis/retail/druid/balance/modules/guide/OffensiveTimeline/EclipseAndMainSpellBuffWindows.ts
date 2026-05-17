import SPELLS from 'common/SPELLS';
import { cdSpell } from 'analysis/retail/druid/balance/constants';
import Combatant from 'parser/core/Combatant';
import { TimeWindow } from 'analysis/retail/druid/balance/modules/guide/OffensiveTimeline/timeWindow';

export interface BuffWindow extends TimeWindow {
  color: string;
  spellId: number;
}

const CD_COLOR = '#26d4c8';
const SOLAR_COLOR = '#e58a3a';
const LUNAR_COLOR = '#7ab2ff';

export function getEclipseAndMainSpellBuffWindows(
  combatant: Combatant,
  fightStart: number,
  fightEnd: number,
): BuffWindow[] {
  const windows: BuffWindow[] = [];
  const mainSpell = cdSpell(combatant);
  const trackedBuffs = [
    { spellId: mainSpell.id, color: CD_COLOR },
    { spellId: SPELLS.ECLIPSE_SOLAR.id, color: SOLAR_COLOR },
    { spellId: SPELLS.ECLIPSE_LUNAR.id, color: LUNAR_COLOR },
  ];

  for (const buff of trackedBuffs) {
    for (const trackedBuff of combatant.getBuffHistory(buff.spellId)) {
      const clampedStart = Math.max(trackedBuff.start, fightStart);
      const clampedEnd = Math.min(trackedBuff.end ?? fightEnd, fightEnd);
      if (clampedEnd <= clampedStart) {
        continue;
      }
      windows.push({
        startTime: clampedStart - fightStart,
        endTime: clampedEnd - fightStart,
        color: buff.color,
        spellId: buff.spellId,
      });
    }
  }

  const mainSpellWindows = windows.filter((window) => window.spellId === mainSpell.id);
  const trimmedMainSpellWindows = trimMainSpellWindows(mainSpellWindows);

  const eclipseWindows = windows.filter((window) => window.spellId !== mainSpell.id);
  const trimmedEclipseWindows = trimEclipseWindows(trimmedMainSpellWindows, eclipseWindows);

  return [...trimmedMainSpellWindows, ...trimmedEclipseWindows];
}

/**
 * Trims main spell (CN/Incarn) windows that overlap each other:
 * - If a new window starts before the previous one ends, shortens the previous window to end when the new one begins
 */
function trimMainSpellWindows<T extends TimeWindow>(windows: readonly T[]): T[] {
  const sorted = [...windows].sort((a, b) => a.startTime - b.startTime);
  return sorted.map((window, i) => {
    const next = sorted[i + 1];
    // If a new Main Spell window starts before this one finishes, trim the end timestamp
    if (next !== undefined && next.startTime < window.endTime) {
      return { ...window, endTime: next.startTime };
    }
    return window;
  });
}

/**
 * Trims Eclipse windows that overlap primary CD (CN/Incarn) windows:
 * - Drops Eclipse windows entirely within a primary CD window (within 100 ms)
 * - Start Eclipse window when primary CD ends (within 100 ms)
 * - End Eclipse window when primary CD starts (within 100 ms)
 */
function trimEclipseWindows<T extends TimeWindow>(
  primaryCdWindows: readonly TimeWindow[],
  eclipseWindows: readonly T[],
): T[] {
  const result: T[] = [];
  for (const eclipse of eclipseWindows) {
    // Drop Eclipse windows entirely within a primary CD window (within 100 ms)
    const isInsidePrimaryCd = primaryCdWindows.some(
      (primary) =>
        Math.abs(primary.endTime - eclipse.endTime) < 100 &&
        Math.abs(primary.startTime - eclipse.startTime) < 100,
    );
    if (isInsidePrimaryCd) {
      continue;
    }

    let { startTime, endTime } = eclipse;

    // Start Eclipse window when primary CD ends (within 100 ms)
    const primarySameStart = primaryCdWindows.find(
      (primary) => Math.abs(primary.startTime - startTime) < 100,
    );
    if (primarySameStart !== undefined) {
      startTime = primarySameStart.endTime;
    }

    // End Eclipse window when primary CD starts (within 100 ms)
    const primarySameEnd = primaryCdWindows.find(
      (primary) => Math.abs(primary.endTime - endTime) < 200,
    );
    if (primarySameEnd !== undefined) {
      endTime = primarySameEnd.startTime;
    }

    result.push({ ...eclipse, startTime, endTime });
  }

  return result;
}
