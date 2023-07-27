import Enemy from 'parser/core/Enemy';
import { TrackedBuffEvent } from 'parser/core/Entity';
import { AnyEvent, HasSource, HasTarget, SourcedEvent, TargettedEvent } from 'parser/core/Events';

import Entities from './Entities';

const debug = false;

type EnemyBuffHistory = {
  start: number;
  end: number;
};

/** Stack-based uptime events */
type StackUptime = {
  /** Timestamp in milliseconds of the uptime start */
  start: number;
  /** Timestamp in milliseconds of the uptime end */
  end: number;
  /** The number of stacks active during this time */
  stacks: number;
};

export function encodeEventTargetString(event: TargettedEvent<any>): string;
export function encodeEventTargetString(event: AnyEvent): string | null;
export function encodeEventTargetString(event: AnyEvent) {
  if (!HasTarget(event)) {
    return null;
  }
  return encodeTargetString(event.targetID, event.targetInstance);
}

export function encodeEventSourceString(event: SourcedEvent<any>): string;
export function encodeEventSourceString(event: AnyEvent): string | null;
export function encodeEventSourceString(event: AnyEvent) {
  if (!HasSource(event)) {
    return null;
  }
  return encodeTargetString(event.sourceID, event.sourceInstance);
}

export function encodeTargetString(id: number, instance = 0) {
  return `${id}.${instance}`;
}

export function decodeTargetString(string: string) {
  const [id, instance = 0] = string.split('.');
  return { id, instance };
}

class Enemies extends Entities<Enemy> {
  enemies: { [enemyId: string]: Enemy } = {};

  getEntities() {
    return this.enemies;
  }

  /**
   * Retrieves the enemy that was the target of given event.
   * @param {object} event
   * @returns {Enemy|null}
   */
  getEntity(event: AnyEvent): Enemy | null {
    if (!HasTarget(event)) {
      return null;
    }
    if (event.targetIsFriendly) {
      return null;
    }
    const targetId = event.targetID;
    const targetInstance = event.targetInstance || 0;

    const enemyId = encodeTargetString(targetId, targetInstance);

    let enemy = this.enemies[enemyId];

    if (!enemy) {
      const baseInfo = this.owner.report.enemies.find(
        (enemy: { id: number }) => enemy.id === targetId,
      );
      if (!baseInfo) {
        debug && console.warn('Enemy not noteworthy enough:', targetId, targetInstance, event);
        return null;
      }
      this.enemies[enemyId] = enemy = new Enemy(this.owner, baseInfo, targetInstance);
    }
    return enemy;
  }

  /**
   * Retrieves the enemy that was the source of given event.
   * @param {object} event
   * @returns {Enemy|null}
   */
  getSourceEntity(event: AnyEvent): Enemy | null {
    if (!HasSource(event)) {
      return null;
    }
    if (event.sourceIsFriendly) {
      return null;
    }

    const sourceId = event.sourceID;
    const sourceInstance = event.sourceInstance ?? 0;

    const enemyId = encodeTargetString(sourceId, sourceInstance);

    let enemy = this.enemies[enemyId];

    if (!enemy) {
      const baseInfo = this.owner.report.enemies.find(
        (enemy: { id: number }) => enemy.id === sourceId,
      );
      if (!baseInfo) {
        debug && console.warn('Enemy not noteworthy enough:', sourceId, sourceInstance, event);
        return null;
      }
      this.enemies[enemyId] = enemy = new Enemy(this.owner, baseInfo, sourceInstance);
    }
    return enemy;
  }

  /**
   * Gets the combined history of multiple debuffs. Works exactly like `getDebuffHistory` but this is meant to be used with multiple debuff IDs that are regarded as "same".
   * A perfect example is Unstable Affliction - while being a single spell, it applies up to 5 different debuffs to the same target
   * @param spellIds Variable number of debuff IDs
   * @returns {Array} Combined debuff history for the debuffs
   */
  getCombinedDebuffHistory(spellIds: number[]) {
    const events: EnemyBuffHistory[] = [];
    spellIds.forEach((spellId) => {
      events.push(...this.getDebuffHistory(spellId));
    });

    const history = [];
    let current: EnemyBuffHistory | null = null;
    events
      .sort((a, b) => a.start - b.start)
      .forEach((event) => {
        if (current === null) {
          current = event;
        } else {
          /*
           As, Ae = start, end of current buff A
           Bs, Be = start, end of another buff B

           3 situations can occur with 2 buffs A and B:

           1) B is "inside" A
             As ----- Bs ---- Be ---- Ae
             do nothing
           2) B is completely "outside" A
             As --- Ae --- Bs --- Be
             push A into history, current = B
           3) B overlaps A and ends later
             As --- Bs --- Ae --- Be
             set current end to Be (current: As - Be)
          */
          if (current.end <= event.start) {
            // situation 2
            history.push(current);
            current = event;
          } else if (event.start <= current.end && current.end < event.end) {
            // situation 3
            current.end = event.end;
          }
        }
      });
    // the latest processed event doesn't get added to history, push it
    history.push(current);
    return history;
  }

  /**
   * Gets history of the debuff given by the argument. Returns an array of objects with properties `start` and `end` (both timestamps), so we know when certain debuff was active (on any enemy) and when it dropped. Used e.g. with <UptimeBar />
   * @param spellId ID of the debuff
   * @returns {Array} History of the debuff
   */
  getDebuffHistory(spellId: number): EnemyBuffHistory[] {
    type TempBuffInfo = {
      timestamp: number;
      type: 'apply' | 'remove';
      buff: TrackedBuffEvent;
    };
    const events: TempBuffInfo[] = [];
    const enemies = this.getEntities();
    Object.values(enemies).forEach((enemy) => {
      enemy.getBuffHistory(spellId, this.owner.playerId).forEach((buff) => {
        events.push({
          timestamp: buff.start,
          type: 'apply',
          buff,
        });
        events.push({
          timestamp: buff.end !== null ? buff.end : this.owner.currentTimestamp, // buff end is null if it's still active, it can also be 0 if buff ended at pull
          type: 'remove',
          buff,
        });
      });
    });

    const history: EnemyBuffHistory[] = [];
    let current: EnemyBuffHistory | null = null;
    let active = 0;
    events
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((event) => {
        if (event.type === 'apply') {
          if (current === null) {
            current = { start: event.timestamp, end: this.owner.currentTimestamp };
          }
          active += 1;
        }
        if (event.type === 'remove') {
          active -= 1;
          if (active === 0) {
            // We know for a fact that there will be a temp 'apply' before a temp 'remove'
            // because of the previous forEach, so its safe to non-null assert these
            current!.end = event.timestamp;
            history.push(current!);
            current = null;
          }
        }
      });
    // if buff lasted till end of combat, maybe doesn't ever happen due to some normalizing
    if (current !== null) {
      history.push(current);
    }
    return history;
  }

  /**
   * Gets the debuff history with number of affected targets (stacks).  It
   * returns a history and the maximum number of stacks reached. Used e.g. with
   * <UptimeStackBar>
   */
  getDebuffStackHistory(spellId: number): { maxStacks: number; stackUptimeHistory: StackUptime[] } {
    // This first section gathers all the buff gain and loss from all enemies
    // and splits it into gain and loss events.
    type TempBuffInfo = {
      timestamp: number;
      type: 'apply' | 'remove';
      buff: TrackedBuffEvent;
    };
    const events: TempBuffInfo[] = [];
    const enemies = this.getEntities();
    Object.values(enemies).forEach((enemy) => {
      enemy.getBuffHistory(spellId, this.owner.playerId).forEach((buff) => {
        events.push({
          timestamp: buff.start,
          type: 'apply',
          buff,
        });
        events.push({
          // If the debuff was not removed it must have lasted until the end of the fight.
          timestamp: buff.end !== null ? buff.end : this.owner.fight.end_time,
          type: 'remove',
          buff,
        });
      });
    });

    // This second section sorts the events by time, then walks the array
    // building up a list of events where it changed.
    const stackUptimeHistory: StackUptime[] = [];
    let active = 0;
    let maxStacks = 0;
    let prevTimestamp: number | null = null;
    events
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((event) => {
        const prevActive = active;
        if (event.type === 'apply') {
          active += 1;
          if (active > maxStacks) {
            maxStacks = active;
          }
        }
        if (event.type === 'remove') {
          active -= 1;
        }
        if (prevTimestamp === null) {
          prevTimestamp = event.timestamp;
          return;
        }

        if (prevActive > 0) {
          stackUptimeHistory.push({
            start: prevTimestamp,
            end: event.timestamp,
            stacks: prevActive,
          });
        }
        prevTimestamp = event.timestamp;
      });
    return { maxStacks, stackUptimeHistory };
  }

  /** Get the longest duration remaining of the spell on any enemy
   *
   * @param spellId The spell to check
   * @param timestamp The timestamp to check at (in ms)
   * @param baseBuffLength The base duration of the buff (in ms)
   * @param maxBuffLength The maximum duration of the buff (in ms)
   *
   * @returns The longest duration remaining of the spell on any enemy (in ms)
   */
  getLongestDurationRemaining(
    spellId: number,
    baseBuffLength: number,
    maxBuffLength: number,
    timestamp: number,
  ) {
    const enemies = this.getEntities();
    let maxDuration = 0;
    Object.values(enemies).forEach((enemy) => {
      const time = enemy.getRemainingBuffTimeAtTimestamp(
        spellId,
        baseBuffLength,
        maxBuffLength,
        timestamp,
      );
      maxDuration = Math.max(maxDuration, time);
    });

    return maxDuration;
  }
}

export default Enemies;
