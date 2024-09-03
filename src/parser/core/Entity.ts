import CombatLogParser from 'parser/core/CombatLogParser';
import { BuffEvent, HasSource } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';

type StackHistoryElement = { stacks: number; timestamp: number };
export interface TrackedBuffEvent extends BuffEvent<any> {
  start: number;
  end: number | null;
  stackHistory: Array<StackHistoryElement>;
  refreshHistory: number[];
  stacks: number;
}

class Entity {
  owner: CombatLogParser;
  constructor(owner: CombatLogParser) {
    this.owner = owner;
  }

  /**
   * This also tracks debuffs in the exact same array. There are no parameters to filter results by debuffs. I don't think this should be necessary as debuffs and buffs usually have different spell IDs.
   */
  buffs: TrackedBuffEvent[] = [];

  private activeBuffSet: Map<number, Set<number>> = new Map();

  /**
   * @param {number} timestamp - Timestamp (in ms) to be considered, or the current timestamp if null. Won't work right for timestamps after the currentTimestamp.
   * @param {number} bufferTime - Time (in ms) after buff's expiration where it will still be included. There's a bug in the combat log where if a spell consumes a buff that buff may disappear a short time before the heal or damage event it's buffing is logged. This can sometimes go up to hundreds of milliseconds.
   * @param {number} minimalActiveTime - Time (in ms) the buff must have been active before timestamp for it to be included.
   * @returns {function} The buffs within the time period.
   */
  private activeAtTimestampFilter(timestamp: number, bufferTime = 0, minimalActiveTime = 0) {
    return (buff: TrackedBuffEvent) =>
      timestamp - minimalActiveTime >= buff.start &&
      (buff.end === null || buff.end + bufferTime >= timestamp);
  }

  private spellIdFilter(spellId: number) {
    return (buff: TrackedBuffEvent) => buff.ability.guid === spellId;
  }

  private sourceIdFilter(sourceID: number | null) {
    if (sourceID === null) {
      return () => true;
    }
    return (buff: TrackedBuffEvent) => HasSource(buff) && buff.sourceID === sourceID;
  }

  // Override in extended classes
  get name(): string {
    throw new Error('attempted to access name of unimplemented Entity');
  }

  activeBuffs(forTimestamp: number | null = null, bufferTime = 0, minimalActiveTime = 0) {
    const currentTimestamp = forTimestamp !== null ? forTimestamp : this.owner.currentTimestamp;
    return this.buffs.filter(
      this.activeAtTimestampFilter(currentTimestamp, bufferTime, minimalActiveTime),
    );
  }

  /**
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number} forTimestamp Timestamp (in ms) to be considered, or the current timestamp if null. Won't work right for timestamps after the currentTimestamp.
   * @param {number} bufferTime Time (in ms) after buff's expiration where it will still be included. There's a bug in the combat log where if a spell consumes a buff that buff may disappear a short time before the heal or damage event it's buffing is logged. This can sometimes go up to hundreds of milliseconds.
   * @param {number} minimalActiveTime - Time (in ms) the buff must have been active before timestamp for it to be included.
   * @param {number} sourceID - source ID the buff must have come from, or any source if null
   * @returns {boolean} - Whether the buff is present with the given specifications.
   */
  hasBuff(
    spell: number | Spell,
    forTimestamp: number | null = null,
    bufferTime = 0,
    minimalActiveTime = 0,
    sourceID: number | null = null,
  ): boolean {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    if (forTimestamp === null && bufferTime === 0 && minimalActiveTime === 0) {
      // fast-path for common case
      if (sourceID !== null) {
        return this.activeBuffSet.get(spellId)?.has(sourceID) ?? false;
      } else {
        return (this.activeBuffSet.get(spellId)?.size ?? 0) > 0;
      }
    }
    return (
      this.getBuff(spellId, forTimestamp, bufferTime, minimalActiveTime, sourceID) !== undefined
    );
  }

  /**
   * Simplified version of {@link hasBuff} that looks only for buffs whose source is the selectedCombatant.
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number} bufferTime Time (in ms) after buff's expiration where it will still be included.
   * @param {number} minimalActiveTime - Time (in ms) the buff must have been active before timestamp for it to be included.
   * @returns {boolean} - Whether the buff is present with the given specifications.
   */
  hasOwnBuff(
    spell: number | Spell,
    bufferTime: number = 0,
    minimalActiveTime: number = 0,
  ): boolean {
    return this.hasBuff(
      spell,
      null,
      bufferTime,
      minimalActiveTime,
      this.owner.selectedCombatant.id,
    );
  }

  /**
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number} forTimestamp Timestamp (in ms) to be considered, or the current timestamp if null. Won't work right for timestamps after the currentTimestamp.
   * @param {number} bufferTime Time (in ms) after buff's expiration where it will still be included. There's a bug in the combat log where if a spell consumes a buff that buff may disappear a short time before the heal or damage event it's buffing is logged. This can sometimes go up to hundreds of milliseconds.
   * @param {number} minimalActiveTime - Time (in ms) the buff must have been active before timestamp for it to be included.
   * @param {number} sourceID - source ID the buff must have come from, or any source if null.
   * @returns {Object} - A buff with the given specifications. The buff object will have all the properties of the associated applybuff event, along with a start timestamp, an end timestamp if the buff has fallen, and an isDebuff flag. If multiple buffs meet the specifications, there's no guarantee which you'll get (this could happen if multiple spells with the same spellId but from different sources are on the same target)
   */
  getBuff(
    spell: number | Spell,
    forTimestamp: number | null = null,
    bufferTime = 0,
    minimalActiveTime = 0,
    sourceID: number | null = null,
  ) {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    const currentTimestamp = forTimestamp !== null ? forTimestamp : this.owner.currentTimestamp;
    const isCorrectSpell = this.spellIdFilter(spellId);
    const isActive = this.activeAtTimestampFilter(currentTimestamp, bufferTime, minimalActiveTime);
    const isCorrectSource = this.sourceIdFilter(sourceID);
    return this.buffs.find(
      (buff) => isCorrectSpell(buff) && isActive(buff) && isCorrectSource(buff),
    );
  }

  /**
   * Simplified version of {@link getBuff} that looks only for buffs whose source is the selectedCombatant.
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number} bufferTime Time (in ms) after buff's expiration where it will still be included.
   * @param {number} minimalActiveTime - Time (in ms) the buff must have been active before timestamp for it to be included.
   * @returns {Object} - A buff with the given specifications. The buff object will have all the properties of the associated applybuff event, along with a start timestamp, an end timestamp if the buff has fallen, and an isDebuff flag.
   */
  getOwnBuff(
    spell: number | Spell,
    bufferTime: number = 0,
    minimalActiveTime: number = 0,
  ): TrackedBuffEvent | undefined {
    return this.getBuff(
      spell,
      null,
      bufferTime,
      minimalActiveTime,
      this.owner.selectedCombatant.id,
    );
  }

  /**
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number} forTimestamp Timestamp (in ms) to be considered, or the current timestamp if null. Won't work right for timestamps after the currentTimestamp.
   * @param {number} bufferTime Time (in ms) after buff's expiration where it will still be included. There's a bug in the combat log where if a spell consumes a buff that buff may disappear a short time before the heal or damage event it's buffing is logged. This can sometimes go up to hundreds of milliseconds.
   * @param {number} minimalActiveTime - Time (in ms) the buff must have been active before timestamp for it to be included.
   * @param {number} sourceID - source ID the buff must have come from, or any source if null.
   * @returns {number} - The number of stacks of the buff or 0 if the buff isn't present.
   */
  getBuffStacks(
    spell: number | Spell,
    forTimestamp: number | null = null,
    bufferTime: number = 0,
    minimalActiveTime: number = 0,
    sourceID: number | null = null,
  ): number {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    const buff: TrackedBuffEvent | undefined = this.getBuff(
      spellId,
      forTimestamp,
      bufferTime,
      minimalActiveTime,
      sourceID,
    );
    const currentTimestamp = forTimestamp !== null ? forTimestamp : this.owner.currentTimestamp;

    let maxStackForTimestamp: StackHistoryElement = { timestamp: 0, stacks: 0 };
    buff?.stackHistory.forEach((stack) => {
      if (maxStackForTimestamp.timestamp < stack.timestamp && stack.timestamp < currentTimestamp) {
        maxStackForTimestamp = stack;
      }
    });

    return maxStackForTimestamp.stacks;
  }

  /**
   * Simplified version of {@link getBuffStacks} that looks only for buffs whose source is the selectedCombatant.
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number} bufferTime Time (in ms) after buff's expiration where it will still be included.
   * @param {number} minimalActiveTime - Time (in ms) the buff must have been active before timestamp for it to be included.
   * @return {number} - The number of stacks of the buff or 0 if the buff isn't present.
   */
  getOwnBuffStacks(
    spell: number | Spell,
    bufferTime: number = 0,
    minimalActiveTime: number = 0,
  ): number {
    return this.getBuffStacks(
      spell,
      null,
      bufferTime,
      minimalActiveTime,
      this.owner.selectedCombatant.id,
    );
  }

  /**
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number} sourceID - source ID the buff must have come from, or any source if null.
   * @returns {array} The buff activations.
   */
  getBuffHistory(spell: number | Spell, sourceID: number | null = null): TrackedBuffEvent[] {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    const isCorrectSpell = this.spellIdFilter(spellId);
    const isCorrectSource = this.sourceIdFilter(sourceID);
    return this.buffs.filter((buff) => isCorrectSpell(buff) && isCorrectSource(buff));
  }
  /**
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number} sourceID - source ID the buff must have come from, or any source if null.
   * @returns {number} - Time (in ms) the specified buff has been active.
   */
  getBuffUptime(spell: number | Spell, sourceID: number | null = null) {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    return this.getBuffHistory(spellId, sourceID).reduce(
      (uptime, buff) =>
        uptime + (buff.end !== null ? buff.end : this.owner.currentTimestamp) - buff.start,
      0,
    );
  }
  /**
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number|null} sourceID - source ID the buff must have come from, or any source if null.
   * @returns {number} - The number of times the specified buff has been applied (only applications count, not stack changes or refreshes).
   */
  getBuffTriggerCount(spell: number | Spell, sourceID: number | null = null) {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    return this.getBuffHistory(spellId, sourceID).length;
  }

  /**
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number|null} sourceID - source ID the buff must have come from, or any source if null.
   * @returns {array} - Time (in ms) the specified buff has been active at each stack count.
   */
  getStackBuffUptimes(
    spell: number | Spell,
    sourceID: number | null = null,
  ): { [stack: number]: number } {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    const stackUptimes: { [key: number]: number } = { 0: this.owner.fightDuration };
    this.getBuffHistory(spellId, sourceID).forEach((buff, idx, arr) => {
      let startTime: number;
      let startStacks: number;
      buff.stackHistory.forEach((stack, idx, arr) => {
        if (startStacks !== undefined) {
          const duration = !startTime ? 0 : stack.timestamp - startTime;
          stackUptimes[startStacks] = (stackUptimes[startStacks] || 0) + duration;
          stackUptimes[0] -= duration; //reduce time spent at no stacks by time spent at current stack
        }

        startTime = stack.timestamp;
        startStacks = stack.stacks;
        if (buff.end === null && idx === arr.length - 1) {
          // If the buff instance didn't end (usually because it was still active at the end of the fight) we need to manually account for it
          const finalStackUptime = this.owner.currentTimestamp - startTime;
          stackUptimes[startStacks] = (stackUptimes[startStacks] || 0) + finalStackUptime;
          stackUptimes[0] -= finalStackUptime; //reduce time spent at no stacks by time spent at current stack
        }
      });
    });
    return stackUptimes;
  }

  /**
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number|null} sourceID - source ID the buff must have come from, or any source if null.
   * @returns {number} - Time (in ms) the specified buff has been active weighted by the number of stacks active.
   *      For example if buff was up for 10000ms with 1 stack and 20000ms with 2 stacks, would return 50000.
   */
  getStackWeightedBuffUptime(spell: number | Spell, sourceID: number | null = null) {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    const stackBuffUptimes = this.getStackBuffUptimes(spellId, sourceID);
    return Object.keys(stackBuffUptimes)
      .map((stack) => stackBuffUptimes[Number(stack)] * Number(stack))
      .reduce((total, cur) => total + cur, 0);
  }

  /**
   * Determine the non-inclusive remaining time of a given debuff/buff at each application/re-application of the buff.
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number} baseBuffLength - the base number of ms added to the buff timer by a single application
   * @param {number} maxBuffLength - the maximum number of ms a buff can have.
   * @param {number | null} sourceId - source ID the buff must have come from, or any source if null.
   */
  getRemainingBuffTimeAtApplication(
    spell: number | Spell,
    baseBuffLength: number,
    maxBuffLength: number,
    sourceId: number | null = null,
  ): Map<number, number> {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    const buffTimesAtApplication: Map<number, number> = new Map<number, number>();

    const sortedApplicationTimestamps: number[] = this.getBuffHistory(spellId, sourceId).flatMap(
      (e) => [e.timestamp, ...e.refreshHistory],
    );

    sortedApplicationTimestamps.sort((a, b) => a - b);

    if (sortedApplicationTimestamps.length === 0) {
      return buffTimesAtApplication;
    }
    let lastApplicationTimestamp: number = sortedApplicationTimestamps[0];
    let buffTimeAtLastApplication: number = baseBuffLength;
    buffTimesAtApplication.set(lastApplicationTimestamp, buffTimeAtLastApplication);
    for (let i = 1; i < sortedApplicationTimestamps.length; i += 1) {
      const timeDiffBetweenApplications = sortedApplicationTimestamps[i] - lastApplicationTimestamp;
      const buffAmountAtCurrentApplication = Math.max(
        0,
        buffTimeAtLastApplication - timeDiffBetweenApplications,
      );
      lastApplicationTimestamp = sortedApplicationTimestamps[i];
      buffTimeAtLastApplication = Math.min(
        buffAmountAtCurrentApplication + baseBuffLength,
        maxBuffLength,
      );
      buffTimesAtApplication.set(sortedApplicationTimestamps[i], buffTimeAtLastApplication);
    }
    return buffTimesAtApplication;
  }

  /**
   * Determine the remaining time of a given debuff/buff at a given timestamp. If a
   * buff is applied at the given timestamp, the returned value is non-inclusive.
   * @param {number | Spell} spell buff (ID) to check for
   * @param {number} baseBuffLength - the base number of ms added to the buff timer by a single application
   * @param {number} maxBuffLength - the maximum number of ms a buff can have.
   * @param {number} timestamp - the timestamp to determine the remaining time of a buff/debuff.
   * @param {number | null} sourceId - source ID the buff must have come from, or any source if null.
   * @return The remaining buff time at the provided timestamp.
   */
  getRemainingBuffTimeAtTimestamp(
    spell: number | Spell,
    baseBuffLength: number,
    maxBuffLength: number,
    timestamp: number,
    sourceId: number | null = null,
  ): number {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    const buffApplicationTimes: Map<number, number> = this.getRemainingBuffTimeAtApplication(
      spellId,
      baseBuffLength,
      maxBuffLength,
      sourceId,
    );
    const keys: number[] = Array.from(buffApplicationTimes.keys()).sort((a, b) => a - b);
    if (keys.length === 0) {
      return 0;
    }
    let closestKey: number = keys[0];
    for (const key of keys) {
      if (Math.abs(timestamp - key) < closestKey) {
        closestKey = key;
      }
    }
    const buffTimeAtClosestKey: number = buffApplicationTimes.get(closestKey) as number;
    const timeDiff: number = Math.abs(closestKey - timestamp);
    if (closestKey > timestamp) {
      return Math.min(buffTimeAtClosestKey + timeDiff, maxBuffLength);
    } else if (closestKey < timestamp) {
      return Math.max(buffTimeAtClosestKey - timeDiff, 0);
    } else {
      return buffTimeAtClosestKey;
    }
  }

  applyBuff(buff: BuffEvent<any> & { start: number }) {
    this.buffs.push({
      end: null,
      stackHistory: [{ stacks: 1, timestamp: buff.timestamp }],
      refreshHistory: [],
      stacks: 1,
      ...buff,
    });

    if (buff.sourceID !== undefined) {
      let set = this.activeBuffSet.get(buff.ability.guid);
      if (!set) {
        this.activeBuffSet.set(buff.ability.guid, new Set());
        set = this.activeBuffSet.get(buff.ability.guid);
      }

      set!.add(buff.sourceID);
    }
  }

  removeBuffSource(buffId: number, sourceId: number | undefined) {
    if (sourceId === undefined) {
      return;
    }
    this.activeBuffSet.get(buffId)?.delete(sourceId);
  }
}

export default Entity;
