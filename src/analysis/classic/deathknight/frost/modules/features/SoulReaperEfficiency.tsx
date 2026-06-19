import SPELLS from 'common/SPELLS/classic/deathknight';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SharedSoulReaperEfficiency from 'analysis/classic/deathknight/shared/SoulReaperEfficiency';

/**
 * Frost DK Soul Reaper — extends the shared tracker with an AoE excuse:
 *
 * If Howling Blast hits 3+ unique targets within ±500ms of a HB cast during
 * an execute window, that "slot" is excused (AoE priority over Soul Reaper).
 *
 * This mirrors the Python FrostSoulReaperAnalyzer's hb_targets check.
 */

const HB_AOE_WINDOW_MS = 500;
const HB_AOE_MIN_TARGETS = 3;

class SoulReaperEfficiency extends SharedSoulReaperEfficiency {
  /** Each entry: [timestamp of HB cast, Set of target IDs hit] */
  private _hbWindows: [number, Set<number>][] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.HOWLING_BLAST),
      this.onHbDamage,
    );
  }

  private onHbDamage(event: DamageEvent) {
    const ts = event.timestamp - this.owner.fight.start_time;

    // Find an existing HB window within ±500ms, or open a new one.
    const existing = this._hbWindows.find(([wts]) => Math.abs(wts - ts) <= HB_AOE_WINDOW_MS);
    if (existing) {
      existing[1].add(event.targetID);
    } else {
      this._hbWindows.push([ts, new Set([event.targetID])]);
    }
  }

  /**
   * Count how many 6s Soul Reaper "slots" during execute were covered by an
   * HB hitting 3+ targets (AoE scenario, SR not the right choice).
   */
  override get excusedMisses(): number {
    const intervals = this.getExecuteIntervals();
    if (intervals.length === 0) return 0;

    // Build a list of 6s slot start times across all execute intervals.
    const slots: number[] = [];
    for (const [start, end] of intervals) {
      for (let t = start; t < end; t += 6_000) {
        slots.push(t);
      }
    }

    // A slot is excused if there is a HB hitting 3+ targets within ±500ms of it
    // and that slot wasn't already covered by a real SR cast.
    const srRelative = this._srCasts; // already fight-relative from base class

    let excused = 0;
    for (const slotStart of slots) {
      // Check if player already cast SR in this slot window.
      const hadSR = srRelative.some((ts) => ts >= slotStart && ts < slotStart + 6_000);
      if (hadSR) continue;

      // Check if an HB AoE covers this slot.
      const hbAoE = this._hbWindows.some(
        ([wts, targets]) =>
          targets.size >= HB_AOE_MIN_TARGETS && Math.abs(wts - slotStart) <= HB_AOE_WINDOW_MS,
      );
      if (hbAoE) excused += 1;
    }

    return excused;
  }
}

export default SoulReaperEfficiency;
