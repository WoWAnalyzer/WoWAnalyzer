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
   * @param spellId
   * @param forTimestamp
   * @param bufferTime Time (in MS) the buff may have expired. There's a bug in the combat log where if a spell consumes a buff that buff may disappear a few MS earlier than the heal event is logged. I've seen this go up to 32ms.
   * @param minimalActiveTime
   * @returns {boolean}
   */
  hasBuff(spellId, forTimestamp = null, bufferTime = 0, minimalActiveTime = 0) {
    return this.getBuff(spellId, forTimestamp, bufferTime, minimalActiveTime) !== undefined;
  }
  getBuff(spellId, forTimestamp = null, bufferTime = 0, minimalActiveTime = 0) {
    const currentTimestamp = forTimestamp || this.owner.currentTimestamp;
    const nSpellId = Number(spellId);
    return this.buffs.find(buff => buff.ability.guid === nSpellId && (currentTimestamp - minimalActiveTime) >= buff.start && (buff.end === null || (buff.end + bufferTime) >= currentTimestamp));
  }
  getBuffUptime(buffAbilityId) {
    return this.buffs
      .filter(buff => buff.ability.guid === buffAbilityId)
      .reduce((uptime, buff) => uptime + (buff.end || this.owner.currentTimestamp) - buff.start, 0);
  }
  getBuffTriggerCount(buffAbilityId) {
    return this.buffs
      .filter(buff => buff.ability.guid === buffAbilityId)
      .length;
  }
}

export default Entity;
