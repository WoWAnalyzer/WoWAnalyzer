import Module from 'Main/Parser/Module';

class Buffs extends Module {
  buffs = [];

  on_combatantinfo(event) {
    if (this.owner.byPlayer(event)) {
      event.auras.forEach(aura => {
        this.applyActiveBuff({
          ability: {
            abilityIcon: aura.icon,
            guid: aura.ability,
          },
          sourceID: aura.source,
          timestamp: this.owner.currentTimestamp,
        });
      });
    }
  }
  on_applybuff(event) {
    if (!this.owner.toPlayer(event)) return;

    this.applyActiveBuff(event);
  }
  on_refreshbuff(event) {
    if (!this.owner.toPlayer(event)) return;

    this.removeActiveBuff(event);
    this.applyActiveBuff(event);
  }
  on_removebuff(event) {
    if (!this.owner.toPlayer(event)) return;

    this.removeActiveBuff(event);
  }

  /**
   * @param spellId
   * @param bufferTime Time (in MS) the buff may have expired. There's a bug in the combat log where if a spell consumes a buff that buff may disappear a few MS earlier than the heal event is logged. I've seen this go up to 32ms.
   * @returns {boolean}
   */
  hasBuff(spellId, bufferTime = 0) {
    return this.getBuff(spellId, bufferTime) !== undefined;
  }
  getBuff(spellId, bufferTime = 0) {
    const currentTimestamp = this.owner.currentTimestamp;
    return this.buffs.find(buff => buff.ability.guid === spellId && buff.start < currentTimestamp && (buff.end === null || (buff.end + bufferTime) >= currentTimestamp));
  }
  getBuffUptime(buffAbilityId) {
    return this.buffs.reduce((uptime, buff) => {
      if (buff.ability.guid === buffAbilityId) {
        uptime += (buff.end || this.owner.currentTimestamp) - buff.start;
      }
      return uptime;
    }, 0);
  }

  applyActiveBuff(buff) {
    this.buffs.push({
      ...buff,
      start: buff.timestamp,
      end: null,
    });
  }
  removeActiveBuff(buff) {
    const existingBuff = this.buffs.find(item => item.ability.guid === buff.ability.guid && item.end === null);
    if (existingBuff) {
      existingBuff.end = buff.timestamp;
    } else {
      this.buffs.push({
        ...buff,
        start: this.owner.fight.start_time,
        end: buff.timestamp,
      });
    }
  }
}

export default Buffs;
