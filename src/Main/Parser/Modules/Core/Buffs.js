import Module from 'Main/Parser/Module';

// Requires: Combatants
class Buffs extends Module {
  on_combatantinfo(event) {
    event.auras.forEach(aura => {
      this.applyActiveBuff({
        ability: {
          abilityIcon: aura.icon,
          guid: aura.ability,
        },
        sourceID: aura.source,
        targetID: event.sourceID,
        timestamp: event.timestamp,
      });
    });
  }
  on_applybuff(event) {
    this.applyActiveBuff(event);
  }
  on_refreshbuff(event) {
    this.removeActiveBuff(event);
    this.applyActiveBuff(event);
  }
  on_removebuff(event) {
    this.removeActiveBuff(event);
  }
  on_removebuffstack(buff) {
    const targetId = buff.targetID;
    const combatant = this.owner.combatants.players[targetId];
    if (!combatant) {
      return; // a pet or something probably, either way we don't care.
    }
    // In the case of Maraad's Dying Breath it calls a `removebuffstack` that removes all additional stacks from the buff before it calls a `removebuff`, with this we can find the amount of stacks it had. The `buff.stacks` only includes the amount of removed stacks, which (at least for Maraad's) are all stacks minus one since the original buff is also considered a stack.
    const existingBuff = combatant.buffs.find(item => item.ability.guid === buff.ability.guid && item.end === null);
    existingBuff.stacks = buff.stack + 1;
  }

  applyActiveBuff(buff) {
    const targetId = buff.targetID;
    const combatant = this.owner.combatants.players[targetId];
    if (!combatant) {
      return; // a pet or something probably, either way we don't care.
    }
    combatant.buffs.push({
      ...buff,
      start: buff.timestamp,
      end: null,
    });
  }
  removeActiveBuff(buff) {
    const targetId = buff.targetID;
    const combatant = this.owner.combatants.players[targetId];
    if (!combatant) {
      return; // a pet or something probably, either way we don't care.
    }
    const existingBuff = combatant.buffs.find(item => item.ability.guid === buff.ability.guid && item.end === null);
    if (existingBuff) {
      existingBuff.end = buff.timestamp;
    } else {
      combatant.buffs.push({
        ...buff,
        start: this.owner.fight.start_time,
        end: buff.timestamp,
      });
    }
  }
}

export default Buffs;
