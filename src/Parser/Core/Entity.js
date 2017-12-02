class Entity {
  owner = null;
  constructor(owner) {
    this.owner = owner;
  }

  /**
   * This also tracks debuffs in the exact same array. There are no parameters to filter results by debuffs. I don't think this should be necessary as debuffs and buffs usually have different spell IDs.
   */

  buffs = [];

  /**
   * @param {number} forTimestamp - Timestamp (in ms) to be considered, or the current timestamp if null. Won't work right for timestamps after the currentTimestamp.
   * @param {number} bufferTime - Time (in ms) after buff's expiration where it will still be included. There's a bug in the combat log where if a spell consumes a buff that buff may disappear a short time before the heal or damage event it's buffing is logged. This can sometimes go up to hundreds of milliseconds.
   * @param {number} minimalActiveTime - Time (in ms) the buff must have been active before timestamp for it to be included.
   * @returns {Array} - All buffs on the Entity at the given timestamp
   */
  activeBuffs(forTimestamp = null, bufferTime = 0, minimalActiveTime = 0) {
    const currentTimestamp = forTimestamp || this.owner.currentTimestamp;
    return this.buffs.filter(buff => (currentTimestamp - minimalActiveTime) >= buff.start && (buff.end === null || (buff.end + bufferTime) >= currentTimestamp));
  }

  /**
   * @param {number} spellId buff ID to check for
   * @param {number} forTimestamp Timestamp (in ms) to be considered, or the current timestamp if null. Won't work right for timestamps after the currentTimestamp.
   * @param {number} bufferTime Time (in ms) after buff's expiration where it will still be included. There's a bug in the combat log where if a spell consumes a buff that buff may disappear a short time before the heal or damage event it's buffing is logged. This can sometimes go up to hundreds of milliseconds.
   * @param {number} minimalActiveTime - Time (in ms) the buff must have been active before timestamp for it to be included.
   * @param {number} sourceID - source ID the buff must have come from, or any source if null
   * @returns {boolean} - Whether the buff is present with the given specifications.
   */
  hasBuff(spellId, forTimestamp = null, bufferTime = 0, minimalActiveTime = 0, sourceID = null) {
    return this.getBuff(spellId, forTimestamp, bufferTime, minimalActiveTime, sourceID) !== undefined;
  }

  /**
   * @param {number} spellId - buff ID to check for
   * @param {number} forTimestamp Timestamp (in ms) to be considered, or the current timestamp if null. Won't work right for timestamps after the currentTimestamp.
   * @param {number} bufferTime Time (in ms) after buff's expiration where it will still be included. There's a bug in the combat log where if a spell consumes a buff that buff may disappear a short time before the heal or damage event it's buffing is logged. This can sometimes go up to hundreds of milliseconds.
   * @param {number} minimalActiveTime - Time (in ms) the buff must have been active before timestamp for it to be included.
   * @param {number} sourceID - source ID the buff must have come from, or any source if null.
   * @returns {Object} - A buff with the given specifications. The buff object will have all the properties of the associated applybuff event, along with a start timestamp, an end timestamp if the buff has fallen, and an isDebuff flag. If multiple buffs meet the specifications, there's no guarantee which you'll get (this could happen if multiple spells with the same spellId but from different sources are on the same target)
   */
  getBuff(spellId, forTimestamp = null, bufferTime = 0, minimalActiveTime = 0, sourceID = null) {
    const currentTimestamp = forTimestamp || this.owner.currentTimestamp;
    const nSpellId = Number(spellId);
    return this.buffs.find(buff =>
      buff.ability.guid === nSpellId &&
      (currentTimestamp - minimalActiveTime) >= buff.start &&
      (buff.end === null || (buff.end + bufferTime) >= currentTimestamp) &&
      (sourceID === null || sourceID === buff.sourceID));
  }

  /**
   * @param {number} buffAbilityId - buff ID to check for
   * @param {number} sourceID - source ID the buff must have come from, or any source if null.
   * @returns {number} - Time (in ms) the specified buff has been active.
   */
  getBuffUptime(buffAbilityId, sourceID = null) {
    return this.buffs
      .filter(buff => (buff.ability.guid === buffAbilityId) && (sourceID === null || sourceID === buff.sourceID))
      .reduce((uptime, buff) => uptime + (buff.end !== null ? buff.end : this.owner.currentTimestamp) - buff.start, 0);
  }

  /**
   * @param {number} buffAbilityId - buff ID to check for
   * @param {number} sourceID - source ID the buff must have come from, or any source if null.
   * @returns {number} - The number of times the specified buff has been applied (only applications count, not stack changes or refreshes).
   */
  getBuffTriggerCount(buffAbilityId, sourceID = null) {
    return this.buffs
      .filter(buff => (buff.ability.guid === buffAbilityId) && (sourceID === null || sourceID === buff.sourceID))
      .length;
  }
}

export default Entity;
