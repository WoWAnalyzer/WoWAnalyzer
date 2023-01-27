import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import Events, {
  ApplyDebuffEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
  TargettedEvent,
} from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import { UptimeBarSpec } from 'parser/ui/UptimeBarSubStatistic';
import { ClosedTimePeriod, mergeTimePeriods } from 'parser/core/mergeTimePeriods';
import Combatant from 'parser/core/Combatant';

// Largest found in logs is 149ms:
// https://www.warcraftlogs.com/reports/8Ddyzh9nRjrxv3JA/#fight=16&source=21
// Moonfire DoT tick at 8:13.300, expected to expire at 8:13.151
/** Buffer in ms to use when determining if a buff was present when a DoT was applied */
export const BUFF_DROP_BUFFER = 200;

/** Default fraction of DoT duration carried over to new applications */
export const DEFAULT_PANDEMIC_FRACTION = 0.3;

export function hasSpec(snapshots: SnapshotSpec[], sss: StaticSnapshotSpec) {
  return snapshots.find((ss) => ss.name === sss.name) !== undefined;
}

/**
 * Many DoT spells 'snapshot' certain buffs on cast, benefitting from them over the DoT's
 * full duration. This abstract class can be extended to track the snapshots for a specific DoT.
 */
abstract class DotSnapshots extends Analyzer {
  /** The spell for the DoT cast */
  spell: Spell;
  /** The spell for the DoT debuff */
  debuff: Spell;
  /** The snapshots that could apply to this DoT */
  applicableSnapshots: SnapshotSpec[];
  /** Data on the current DoT / snapshot state per target */
  snapshotsByTarget: { [key: string]: DotUptime[] } = {};
  /** Fraction of DoT duration carried over to new applications, subclasses can override */
  pandemicFraction = DEFAULT_PANDEMIC_FRACTION;

  protected constructor(
    spell: Spell,
    debuff: Spell,
    applicableSnapshots: StaticSnapshotSpec[],
    options: Options,
  ) {
    super(options);
    this.spell = spell;
    this.debuff = debuff;
    this.applicableSnapshots = applicableSnapshots
      .filter((as) => as.isActive(this.selectedCombatant))
      .map((as) => ({
        name: as.name,
        spells: as.spellFunc(this.selectedCombatant),
        isPresent: as.isPresent,
        displayColor: as.displayColor,
        boostStrength: as.boostStrength(this.selectedCombatant),
      }));

    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(debuff), this.onApplyDot);
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(debuff),
      this.onRefreshDot,
    );
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(debuff), this.onRemoveDot);
  }

  /** DoT's expected duration, from its application */
  abstract getDotExpectedDuration(event: ApplyDebuffEvent | RefreshDebuffEvent): number;

  /** DoT's full duration */
  abstract getDotFullDuration(): number;

  /** DoT's total uptime (active on at least one target) */
  abstract getTotalDotUptime(): number;

  /**
   * Will be called when the DoT is applied or refreshed - allows for spell specific handling
   * @param application the DoT application event we're handling
   * @param snapshots the snapshots that apply to this application
   * @param prevSnapshots the snapshots that apply to the DoT we're overwriting,
   *     or null if this is a fresh application
   * @param power the power multiplier for this application, as determined by snapshots.
   *     The power of a no-snapshot application will be 1.
   * @param prevPower the power multiplier for the DoT we're overwriting,
   *     or 0 if this is a fresh application
   * @param remainingOnPrev the ms remaining on the DoT we're overwriting,
   *     or 0 if this is a fresh application
   * @param clipped the ms clipped from the DoT we're overwriting due to pandemic,
   *     or 0 if nothing is clipped or this is a fresh application
   */
  abstract handleApplication(
    application: ApplyDebuffEvent | RefreshDebuffEvent,
    snapshots: SnapshotSpec[],
    prevSnapshots: SnapshotSpec[] | null,
    power: number,
    prevPower: number,
    remainingOnPrev: number,
    clipped: number,
  ): void;

  onApplyDot(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    this.startDot(event);
  }

  onRemoveDot(event: RemoveDebuffEvent | RefreshDebuffEvent) {
    this.finishDot(event);
  }

  onRefreshDot(event: RefreshDebuffEvent) {
    const prev = this.finishDot(event);
    this.startDot(event, prev);
  }

  getUptimesForTarget(event: TargettedEvent<any>): DotUptime[] {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.snapshotsByTarget[targetString]) {
      this.snapshotsByTarget[targetString] = [];
    }
    return this.snapshotsByTarget[targetString];
  }

  private startDot(event: ApplyDebuffEvent | RefreshDebuffEvent, previousUptime?: DotUptime) {
    const uptimes = this.getUptimesForTarget(event);

    const duration = this.getDotExpectedDuration(event);
    const remainingOnPrev =
      previousUptime && previousUptime.end !== undefined
        ? Math.max(previousUptime.expectedEnd - previousUptime.end, 0)
        : 0;

    // calculate durations
    const combinedDuration = duration + remainingOnPrev;
    const maxDuration = this.getDotFullDuration() * (1 + this.pandemicFraction);
    const clipped = Math.max(combinedDuration - maxDuration, 0);
    const newDuration = Math.min(combinedDuration, maxDuration);
    const expectedEnd = event.timestamp + newDuration;

    // call DoT specific handlers
    const snapshots = this.getActiveSnapshots(event.timestamp);
    const power = snapshots.reduce((acc, ss) => acc * (1 + ss.boostStrength), 1);
    const previousSnapshots = previousUptime ? previousUptime.snapshots : null;
    const prevPower =
      previousSnapshots === null
        ? 0
        : previousSnapshots.reduce((acc, ss) => acc * (1 + ss.boostStrength), 1);

    this.handleApplication(
      event,
      snapshots,
      previousSnapshots,
      power,
      prevPower,
      remainingOnPrev,
      clipped,
    );

    uptimes.push({
      start: event.timestamp,
      expectedEnd,
      snapshots,
      previousSnapshots,
    });
  }

  private finishDot(event: RemoveDebuffEvent | RefreshDebuffEvent): DotUptime | undefined {
    const uptimes = this.getUptimesForTarget(event);
    if (uptimes.length > 0) {
      const latestUptime = uptimes[uptimes.length - 1];
      latestUptime.end = event.timestamp;
      return latestUptime;
    } else {
      console.warn(event.type + ' on target when we have no record of an applydebuff', event);
      return undefined;
    }
  }

  private getActiveSnapshots(timestamp: number): SnapshotSpec[] {
    return this.applicableSnapshots.filter((as) => as.isPresent(this.selectedCombatant, timestamp));
  }

  get snapshotUptimes(): UptimeBarSpec[] {
    return this.applicableSnapshots.map((as) => this.getSnapshotUptimesForBuff(as));
  }

  /** Gets the specific uptime periods where at least one active DoT has the given snapshot */
  getSnapshotCombinedUptimes(snapshotName: string): ClosedTimePeriod[] {
    return mergeTimePeriods(
      Object.values(this.snapshotsByTarget)
        .flatMap((uptimes) => uptimes)
        .filter((uptime) => uptime.snapshots.find((ss) => ss.name === snapshotName) !== undefined),
      this.owner.currentTimestamp,
    );
  }

  /** Gets the duration in ms where at least one active DoT has the given snapshot */
  getSnapshotCombinedUptimeDuration(snapshotName: string): number {
    return this.getSnapshotCombinedUptimes(snapshotName).reduce(
      (acc, up) => acc + up.end - up.start,
      0,
    );
  }

  /** Gets the percent of the DoT's total uptime that a snapshotted DoT was active on at least one target */
  getPercentUptimeWithSnapshot(snapshotName: string): number {
    const totalUptime = this.getTotalDotUptime();
    return totalUptime === 0
      ? 0
      : this.getSnapshotCombinedUptimeDuration(snapshotName) / totalUptime;
  }

  /** Gets the time remaining on the DoT active on the given event's target at the time of the event (zero if DoT isn't active) */
  getTimeRemaining(event: TargettedEvent<any>): number {
    const uptimes = this.getUptimesForTarget(event);
    if (uptimes.length > 0) {
      const latestUptime = uptimes[uptimes.length - 1];
      return Math.max(0, latestUptime.expectedEnd - event.timestamp);
    } else {
      return 0;
    }
  }

  /** Builds an uptime bar for the given shapshot spec */
  protected getSnapshotUptimesForBuff(spec: SnapshotSpec): UptimeBarSpec {
    return {
      uptimes: this.getSnapshotCombinedUptimes(spec.name),
      color: spec.displayColor,
      spells: spec.spells,
    };
  }
}

/** Static specification of a snapshotting buff */
export type StaticSnapshotSpec = {
  /** The name of this snapshot */
  name: string;
  /** The spell or spells the combatant has that could cause this snapshot */
  spellFunc: (c: Combatant) => Spell[];
  /** True iff the combatant can gain this snapshot buff */
  isActive: (c: Combatant) => boolean;
  /** True iff the combatant has the snapshot buff at the given timestamp */
  isPresent: (c: Combatant, timestamp: number) => boolean;
  /** Color with which to display this snapshot on the chart */
  displayColor: string;
  /** The strength of this snapshot's boost */
  boostStrength: (c: Combatant) => number;
};

/** Specification of a snapshotting buff specific to the combatant, generated from StaticSnapshotSpecs */
export type SnapshotSpec = {
  /** The name of this snapshot */
  name: string;
  /** The spell or spells that cause this snapshot */
  spells: Spell[]; // filled from StaticSnapshotSpec spellFunc
  /** True iff the combatant has the snapshot buff at the given timestamp */
  isPresent: (c: Combatant, timestamp: number) => boolean;
  /** Color with which to display this snapshot on the chart */
  displayColor: string;
  /** The strength of this snapshot's boost */
  boostStrength: number;
};

/** Data object recording a period of time that a DoT was active, and which snapshots it benfitted from */
export type DotUptime = {
  /** Timestamp when this debuff was applied or refreshed */
  start: number;
  /** Timestamp when we expect the debuff to expire */
  expectedEnd: number;
  /** Timestamp when this debuff was removed or refreshed, or undefined if it's still active */
  end?: number;
  /** Snapshots applicable to this DoT application */
  snapshots: SnapshotSpec[];
  /** Snapshots applicable to the previous DoT application, or null if this was a fresh application */
  previousSnapshots?: SnapshotSpec[] | null;
};

export default DotSnapshots;
