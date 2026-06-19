import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

export const SOUL_REAPER_CD_MS = 6_000;

// T15 4pc (Onslaught Battlegear) raises Soul Reaper execute threshold 35% → 45%.
// Item IDs: Head / Chest / Shoulders / Legs / Gloves across Heroic / Normal / LFR.
const T15_DPS_ITEM_IDS = new Set([
  96571,
  95227,
  95827, // Head
  96569,
  95225,
  95825, // Chest
  96573,
  95229,
  95829, // Shoulders
  96572,
  95228,
  95828, // Legs
  96570,
  95226,
  95826, // Gloves
]);

const THRESHOLD_BASE = 0.35;
const THRESHOLD_T15_4P = 0.45;

/**
 * Shared Soul Reaper execute tracker for MoP Death Knights.
 *
 * Features:
 *  - T15 4pc detection via equipped item IDs (threshold 35% → 45%)
 *  - Per-boss execute interval tracking with interval merging for multi-boss fights
 *  - Possible casts = ceil(merged execute duration / 6s CD)
 *
 * Frost DK subclass adds an AoE excuse (HB hitting 3+ targets during execute
 * excuses a missed Soul Reaper window).
 */
class SoulReaperEfficiency extends Analyzer {
  static dependencies = {
    ...Analyzer.dependencies,
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  protected _executeThreshold: number;
  protected _hasT15_4p: boolean;

  // boss actor ID → fight-relative timestamp when it first entered execute range
  protected _executeStart = new Map<number, number>();
  protected _srCasts: number[] = [];

  constructor(options: Options) {
    super(options);

    // Detect T15 4pc from equipped gear
    const t15Count = this.selectedCombatant.gear.filter((item) =>
      T15_DPS_ITEM_IDS.has(item.id),
    ).length;
    this._hasT15_4p = t15Count >= 4;
    this._executeThreshold = this._hasT15_4p ? THRESHOLD_T15_4P : THRESHOLD_BASE;

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.SOUL_REAPER_FROST, SPELLS.SOUL_REAPER_UNHOLY, SPELLS.SOUL_REAPER_BLOOD]),
      this.onSoulReaper,
    );
  }

  private onDamage(event: DamageEvent) {
    if (event.targetIsFriendly || event.hitPoints === undefined || !event.maxHitPoints) {
      return;
    }
    // Only track actual boss enemies, not trash or adds
    const enemy = this.enemies.getEntity(event);
    if (!enemy || enemy.subType !== 'Boss') {
      return;
    }
    const bossId = event.targetID;
    const hpPct = event.hitPoints / event.maxHitPoints;
    if (hpPct < this._executeThreshold && !this._executeStart.has(bossId)) {
      const relativeTs = event.timestamp - this.owner.fight.start_time;
      this._executeStart.set(bossId, relativeTs);
    }
  }

  private onSoulReaper(event: CastEvent) {
    this._srCasts.push(event.timestamp - this.owner.fight.start_time);
  }

  /** Merged (start, end) execute intervals in fight-relative ms. */
  getExecuteIntervals(): [number, number][] {
    const fightDuration = this.owner.fight.end_time - this.owner.fight.start_time;
    const raw: [number, number][] = Array.from(this._executeStart.values()).map((start) => [
      start,
      fightDuration,
    ]);
    if (raw.length === 0) return [];

    raw.sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [[...raw[0]]];
    for (let i = 1; i < raw.length; i++) {
      const last = merged[merged.length - 1];
      const [start, end] = raw[i];
      if (start <= last[1]) {
        last[1] = Math.max(last[1], end);
      } else {
        merged.push([start, end]);
      }
    }
    return merged;
  }

  /** Execute intervals as absolute timestamps for CooldownBar activeWindows. */
  get absoluteExecuteWindows() {
    const base = this.owner.fight.start_time;
    return this.getExecuteIntervals().map(([s, e]) => ({
      startTime: base + s,
      endTime: base + e,
    }));
  }

  protected inExecute(relativeTs: number): boolean {
    return this.getExecuteIntervals().some(([s, e]) => relativeTs >= s && relativeTs <= e);
  }

  get executeThreshold() {
    return this._executeThreshold;
  }

  get hasT15_4p() {
    return this._hasT15_4p;
  }

  get hadExecutePhase() {
    return this._executeStart.size > 0;
  }

  get executeDurationMs() {
    return this.getExecuteIntervals().reduce((sum, [s, e]) => sum + (e - s), 0);
  }

  get castsInExecute() {
    return this._srCasts.filter((ts) => this.inExecute(ts)).length;
  }

  get possibleCasts() {
    if (!this.hadExecutePhase) return 0;
    return Math.max(this.castsInExecute, Math.ceil(this.executeDurationMs / SOUL_REAPER_CD_MS));
  }

  /** Subclasses may override to subtract excused misses (e.g. Frost AoE). */
  // oxlint-disable-next-line typescript-eslint/class-literal-property-style -- intentional override point, not a constant
  get excusedMisses(): number {
    return 0;
  }

  get effectivePossibleCasts() {
    return Math.max(this.castsInExecute, this.possibleCasts - this.excusedMisses);
  }

  get castEfficiency() {
    return this.effectivePossibleCasts > 0 ? this.castsInExecute / this.effectivePossibleCasts : 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.castEfficiency,
      isLessThan: { minor: 1.0, average: 0.85, major: 0.7 },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    if (!this.hadExecutePhase) return null;
    const excDuration = (this.executeDurationMs / 1000).toFixed(1);
    const threshold = Math.round(this._executeThreshold * 100);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            Execute phase: {excDuration}s total (threshold: {threshold}%
            {this._hasT15_4p && ' — T15 4pc'})
            {this.excusedMisses > 0 && (
              <>
                , {this.excusedMisses} missed cast{this.excusedMisses > 1 ? 's' : ''} excused (AoE)
              </>
            )}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SOUL_REAPER_FROST}>
          {formatPercentage(this.castEfficiency)}%{' '}
          <small>
            {this.castsInExecute} / {this.effectivePossibleCasts} casts
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulReaperEfficiency;
