import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  CastEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

const PANDEMIC_WINDOW = 0.3;
const DEBUG = false;

export interface Debuff {
  startTimeStamp: number;
  endTimeStamp: number;
}

export interface DebuffHistory {
  currentDebuff: Debuff | undefined;
  history: Debuff[];
}

export enum CastImpactType {
  NewDebuff,
  RefreshDuringPandemicWindow,
  Overwrite,
}

export interface CastImpactPerTarget {
  castImpactType: CastImpactType;
  remainingDurationBeforeCast: number;
}

export interface CastImpact {
  castEvent: CastEvent;
  /* targetId is crafted to be unique, does not match the regular targetId. Check the implementation. */
  castImpactPerTargetId: Record<string, CastImpactPerTarget>;
}

class DebuffTracker extends Analyzer {
  debuffHistoryPerTargetId: Record<string, DebuffHistory> = {};
  castImpactsPerEvent: Record<number, CastImpact> = {};
  private readonly debuffDuration: number;
  private readonly debuffSpell: Spell;
  private readonly linkedEventRelation: string;

  constructor(
    debuffSpell: Spell,
    debuffDuration: number,
    linkedEventRelation: string,
    options: Options,
  ) {
    super(options);
    this.debuffDuration = debuffDuration;
    this.debuffSpell = debuffSpell;
    this.linkedEventRelation = linkedEventRelation;

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(this.debuffSpell),
      this.onApplyDebuff,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(this.debuffSpell),
      this.onRefreshDebuff,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(this.debuffSpell),
      this.onRemoveDebuff,
    );
  }

  getUptime(): number {
    const allCurrentDebuffs = Object.values(this.debuffHistoryPerTargetId)
      .map((debuffTracker) => debuffTracker.currentDebuff)
      .filter((debuff) => debuff !== undefined);
    const allHistoryDebuffs = Object.values(this.debuffHistoryPerTargetId).flatMap(
      (debuffTracker) => debuffTracker.history,
    );
    const allDebuffs = [...allCurrentDebuffs, ...allHistoryDebuffs];

    if (allDebuffs.length === 0) return 0;

    // 1. Sort by start time
    const sortedDebuffs = [...allDebuffs].sort((a, b) => a.startTimeStamp - b.startTimeStamp);

    let totalUptime = 0;
    let currentStart = sortedDebuffs[0].startTimeStamp;
    let currentEnd = sortedDebuffs[0].endTimeStamp;

    // 2. Iterate and merge
    for (let i = 1; i < sortedDebuffs.length; i++) {
      const next = sortedDebuffs[i];

      if (next.startTimeStamp <= currentEnd) {
        // Overlap: Extend the end time if the next one lasts longer
        currentEnd = Math.max(currentEnd, next.endTimeStamp);
      } else {
        // Gap: Add the completed interval to total and move to the next
        totalUptime += currentEnd - currentStart;
        currentStart = next.startTimeStamp;
        currentEnd = next.endTimeStamp;
      }
    }

    // 3. Add the very last interval
    currentEnd = Math.min(currentEnd, this.owner.fight.end_time);
    totalUptime += currentEnd - currentStart;

    return totalUptime;
  }

  getUptimePercent(): number {
    const uptime = this.getUptime();
    const totalFightDuration = this.owner.fight.end_time - this.owner.fight.start_time;

    return uptime / totalFightDuration;
  }

  private onApplyDebuff(event: ApplyDebuffEvent) {
    DEBUG &&
      console.info(
        '[%s] ApplyDebuffEvent for target ID=%d, Instance=%d',
        this.owner.formatTimestamp(event.timestamp, 3),
        event.targetID,
        event.targetInstance,
      );
    const targetId = this.buildTargetId(event);
    const correspondingCast = this.getCorrespondingCast(event);
    this.applyDebuff(targetId, event.timestamp, correspondingCast);
  }

  private onRefreshDebuff(event: RefreshDebuffEvent) {
    DEBUG &&
      console.info(
        '[%s] RefreshDebuffEvent for target ID=%d, Instance=%d',
        this.owner.formatTimestamp(event.timestamp, 3),
        event.targetID,
        event.targetInstance,
      );
    const targetId = this.buildTargetId(event);
    const correspondingCast = this.getCorrespondingCast(event);
    this.applyDebuff(targetId, event.timestamp, correspondingCast);
  }

  private onRemoveDebuff(event: RemoveDebuffEvent) {
    DEBUG &&
      console.info(
        '[%s] RemoveDebuffEvent for target ID=%d, Instance=%d',
        this.owner.formatTimestamp(event.timestamp, 3),
        event.targetID,
        event.targetInstance,
      );
    const targetId = this.buildTargetId(event);
    this.removeDebuff(targetId, event);
  }

  private removeDebuff(targetId: string, event: RemoveDebuffEvent) {
    const currentDebuff = this.debuffHistoryPerTargetId[targetId]?.currentDebuff;
    if (currentDebuff === undefined) {
      DEBUG &&
        console.warn(
          '[%s] Could not find current debuff for targetId=%d',
          this.owner.formatTimestamp(event.timestamp, 3),
          targetId,
        );
      return;
    }

    // Log Debuff in the history
    const debuff: Debuff = {
      startTimeStamp: currentDebuff.startTimeStamp,
      endTimeStamp: event.timestamp,
    };
    this.debuffHistoryPerTargetId[targetId].history.push(debuff);

    // Clear current debuf
    this.debuffHistoryPerTargetId[targetId].currentDebuff = undefined;
  }

  private applyDebuff(
    targetId: string,
    eventTimeStamp: number,
    correspondingCast: CastEvent | undefined,
  ) {
    if (!correspondingCast) {
      DEBUG &&
        console.warn(
          '[%s] Could not find corresponding cast for target ID=%d',
          this.owner.formatTimestamp(eventTimeStamp, 3),
          targetId,
        );
    } else {
      DEBUG &&
        console.info(
          '[%s] Found corresponding cast for target ID=%d',
          this.owner.formatTimestamp(eventTimeStamp, 3),
          targetId,
        );
    }

    // First time this target has the debuff
    if (!this.debuffHistoryPerTargetId[targetId]) {
      // Create new Debuff Tracker
      this.debuffHistoryPerTargetId[targetId] = {
        currentDebuff: undefined,
        history: [],
      };
    }

    // If there is no current debuff on the target
    if (this.debuffHistoryPerTargetId[targetId].currentDebuff === undefined) {
      this.startNewDebuff(targetId, eventTimeStamp, correspondingCast);
      return;
    }

    const remainingDuration =
      this.debuffHistoryPerTargetId[targetId].currentDebuff.endTimeStamp - eventTimeStamp;
    // We should always receive a RemoveDebuffEvent,
    // thus remaining duration should never be negative
    if (remainingDuration <= 0) {
      this.replaceExistingExpiredDebuff(
        eventTimeStamp,
        remainingDuration,
        targetId,
        correspondingCast,
      );
      return;
    }

    const isInPandemicWindow = remainingDuration <= PANDEMIC_WINDOW * this.debuffDuration;
    // Refresh during pandemic window
    if (isInPandemicWindow) {
      this.refreshDebuff(remainingDuration, targetId, eventTimeStamp, correspondingCast);
      return;
    }

    // Overwrite outside pandemic window
    this.overwriteDebuff(targetId, eventTimeStamp, correspondingCast, remainingDuration);
  }

  private replaceExistingExpiredDebuff(
    eventTimeStamp: number,
    remainingDuration: number,
    targetId: string,
    correspondingCast: CastEvent | undefined,
  ) {
    DEBUG &&
      console.warn(
        '[%s] Remaining duration is negative (%d) for targetId=%d',
        this.owner.formatTimestamp(eventTimeStamp, 3),
        remainingDuration,
        targetId,
      );

    // Log Debuff in the history
    const debuffHistoryEntry: Debuff = {
      startTimeStamp: this.debuffHistoryPerTargetId[targetId].currentDebuff!.startTimeStamp,
      endTimeStamp: this.debuffHistoryPerTargetId[targetId].currentDebuff!.endTimeStamp,
    };
    this.debuffHistoryPerTargetId[targetId].history.push(debuffHistoryEntry);

    // Create current Debuff
    const currentDebuff: Debuff = {
      startTimeStamp: eventTimeStamp,
      endTimeStamp: eventTimeStamp + this.debuffDuration,
    };
    this.debuffHistoryPerTargetId[targetId].currentDebuff = currentDebuff;

    // Log cast impact
    if (correspondingCast) {
      this.storeCastImpact(
        correspondingCast,
        targetId,
        CastImpactType.NewDebuff,
        remainingDuration,
      );
    }

    DEBUG &&
      console.info(
        '[%s] Created new Debuff for target ID=%d',
        this.owner.formatTimestamp(eventTimeStamp, 3),
        targetId,
      );
  }

  private overwriteDebuff(
    targetId: string,
    eventTimeStamp: number,
    correspondingCast: CastEvent | undefined,
    remainingDuration: number,
  ) {
    // Log Debuff in the history
    const debuffHistoryEntry: Debuff = {
      startTimeStamp: this.debuffHistoryPerTargetId[targetId].currentDebuff!.startTimeStamp,
      endTimeStamp: eventTimeStamp,
    };
    this.debuffHistoryPerTargetId[targetId].history.push(debuffHistoryEntry);

    // Create current Debuff
    const currentDebuff: Debuff = {
      startTimeStamp: eventTimeStamp,
      endTimeStamp: eventTimeStamp + this.debuffDuration,
    };
    this.debuffHistoryPerTargetId[targetId].currentDebuff = currentDebuff;

    // Log cast impact
    if (correspondingCast) {
      this.storeCastImpact(
        correspondingCast,
        targetId,
        CastImpactType.Overwrite,
        remainingDuration,
      );
    }

    DEBUG &&
      console.info(
        '[%s] Create current Debuff (overwrite) for target ID=%d',
        this.owner.formatTimestamp(eventTimeStamp, 3),
        targetId,
      );
  }

  private refreshDebuff(
    remainingDuration: number,
    targetId: string,
    eventTimeStamp: number,
    correspondingCast: CastEvent | undefined,
  ) {
    // Update current Debuff
    const newDebuffDurationMs = this.debuffDuration + remainingDuration;
    this.debuffHistoryPerTargetId[targetId].currentDebuff!.endTimeStamp =
      newDebuffDurationMs + eventTimeStamp;

    // Log cast impact
    if (correspondingCast) {
      this.storeCastImpact(
        correspondingCast,
        targetId,
        CastImpactType.RefreshDuringPandemicWindow,
        remainingDuration,
      );
    }

    DEBUG &&
      console.info(
        '[%s] Updated current Debuff (pandemic window) for target ID=%d',
        this.owner.formatTimestamp(eventTimeStamp, 3),
        targetId,
      );
  }

  private startNewDebuff(
    targetId: string,
    eventTimeStamp: number,
    correspondingCast: CastEvent | undefined,
  ) {
    // Create new Debuff
    this.debuffHistoryPerTargetId[targetId].currentDebuff = {
      startTimeStamp: eventTimeStamp,
      endTimeStamp: eventTimeStamp + this.debuffDuration,
    };

    // Log cast impact
    if (correspondingCast) {
      this.storeCastImpact(correspondingCast, targetId, CastImpactType.NewDebuff, 0);
    }

    DEBUG &&
      console.info(
        '[%s] Created new Debuff for target ID=%d',
        this.owner.formatTimestamp(eventTimeStamp, 3),
        targetId,
      );
  }

  private getCorrespondingCast(
    debuffEvent: ApplyDebuffEvent | RefreshDebuffEvent,
  ): CastEvent | undefined {
    return (debuffEvent._linkedEvents ?? [])
      .filter((linkedEvent) => linkedEvent.relation === this.linkedEventRelation)
      .map((linkedEvent) => linkedEvent.event)
      .find((e): e is CastEvent => e.type === 'cast');
  }

  private storeCastImpact(
    castEvent: CastEvent,
    targetId: string,
    castImpactType: CastImpactType,
    remainingDurationBeforeCast: number,
  ) {
    if (!this.castImpactsPerEvent[castEvent.timestamp]) {
      this.castImpactsPerEvent[castEvent.timestamp] = {
        castEvent: castEvent,
        castImpactPerTargetId: {},
      };
    }

    this.castImpactsPerEvent[castEvent.timestamp].castImpactPerTargetId[targetId] = {
      castImpactType: castImpactType,
      remainingDurationBeforeCast: remainingDurationBeforeCast,
    };
  }

  /** The targetId is not unique, it is the same for all adds of the same type.
   * Therefore, we also need to use the targetInstance which is an incrementing ID.
   */
  private buildTargetId(event: ApplyDebuffEvent | RefreshDebuffEvent | RemoveDebuffEvent): string {
    return encodeEventTargetString(event);
  }
}

export default DebuffTracker;
