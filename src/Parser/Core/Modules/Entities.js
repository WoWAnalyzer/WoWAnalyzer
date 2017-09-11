import Module from 'Parser/Core/Module';

const debug = false;

const APPLY = 'apply';
const REMOVE = 'remove';

class Entities extends Module {
  //noinspection JSMethodCanBeStatic
  getEntities() {
    throw new Error('Not implemented');
  }
  //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  getEntity(event) {
    throw new Error('Not implemented');
  }

  on_applybuff(event) {
    this.applyBuff(event);
  }
  // TODO: Add a sanity check to the `refreshbuff` event that checks if a buff that's being refreshed was applied, if it wasn't it might be a broken pre-combat applied buff not shown in the combatantinfo event
  // We don't store/use durations, so refreshing buff is useless. Removing the buff actually interferes with the `minimalActiveTime` parameter of `getBuff`.
  // on_refreshbuff(event) {
  //   this.removeActiveBuff(event);
  //   this.applyActiveBuff(event);
  // }
  on_applybuffstack(event) {
    this.updateBuffStack(event);
  }
  on_removebuffstack(event) {
    this.updateBuffStack(event);
  }
  on_removebuff(event) {
    this.removeBuff(event);
  }

  on_applydebuff(event) {
    this.applyBuff(event, true);
  }
  on_applydebuffstack(event) {
    this.updateBuffStack(event, true);
  }
  on_removedebuffstack(event) {
    this.updateBuffStack(event, true);
  }
  on_removedebuff(event) {
    this.removeBuff(event, true);
  }

  applyBuff(event, isDebuff) {
    if (!this.owner.byPlayer(event) && !this.owner.toPlayer(event)) {
      // We don't need to know about debuffs on bosses or buffs on other players not caused by us, but we do want to know about our outgoing buffs, and other people's buffs on us
      return;
    }
    const entity = this.getEntity(event);
    if (!entity) {
      return;
    }

    if (debug) {
      const secondsIntoFight = (event.timestamp - this.owner.fight.start_time) / 1000;
      console.log(secondsIntoFight, event.timestamp, `Apply buff ${event.ability.name} to ${entity.name}`);
    }

    entity.buffs.push({
      ...event,
      start: event.timestamp,
      end: null,
      isDebuff,
    });
  }
  updateBuffStack(event, isDebuff) {
    if (!this.owner.byPlayer(event) && !this.owner.toPlayer(event)) {
      // We don't need to know about debuffs on bosses or buffs on other players not caused by us, but we do want to know about our outgoing buffs, and other people's buffs on us
      return;
    }
    const entity = this.getEntity(event);
    if (!entity) {
      return;
    }

    if (debug) {
      const secondsIntoFight = (event.timestamp - this.owner.fight.start_time) / 1000;
      console.log(secondsIntoFight, event.timestamp, `Apply buff stack ${event.ability.name} to ${entity.name}`);
    }

    const existingBuff = entity.buffs.find(item => item.ability.guid === event.ability.guid && item.end === null);
    const oldStacks = existingBuff.stacks || 1; // the original spell counts as 1 stack
    if (existingBuff) {
      existingBuff.stacks = event.stack;
    }

    const type = isDebuff ? 'changedebuffstack' : 'changebuffstack';

    this.triggerEvent(type, {
      ...event,
      type,
      oldStacks,
      newStacks: event.stack,
      stacksGained: event.stack - oldStacks,
      stack: undefined,
    });
  }
  removeBuff(event, isDebuff) {
    if (!this.owner.byPlayer(event) && !this.owner.toPlayer(event)) {
      // We don't need to know about debuffs on bosses or buffs on other players not caused by us, but we do want to know about our outgoing buffs, and other people's buffs on us
      return;
    }
    const entity = this.getEntity(event);
    if (!entity) {
      return;
    }

    if (debug) {
      const secondsIntoFight = (event.timestamp - this.owner.fight.start_time) / 1000;
      console.log(secondsIntoFight, event.timestamp, `Remove buff ${event.ability.name} from ${entity.name}`);
    }

    const existingBuff = entity.buffs.find(item => item.ability.guid === event.ability.guid && item.end === null);
    if (existingBuff) {
      existingBuff.end = event.timestamp;

      if (existingBuff.stacks) {
        const oldStacks = existingBuff.stacks;
        const type = isDebuff ? 'changedebuffstack' : 'changebuffstack';

        this.triggerEvent(type, {
          ...event,
          type,
          oldStacks,
          newStacks: 0,
          stacksGained: 0 - oldStacks,
          stack: undefined,
        });
      }
    } else {
      entity.buffs.push({
        ...event,
        start: this.owner.fight.start_time,
        end: event.timestamp,
        isDebuff,
      });
    }
  }

  // Surely this can be done with a couple less loops???
  getBuffUptime(spellId) {
    const events = [];

    const entities = this.getEntities();
    Object.keys(entities).map(k => entities[k]).forEach(enemy => {
      enemy.buffs.forEach(buff => {
        if (buff.ability.guid !== spellId) {
          return;
        }
        events.push({
          timestamp: buff.start,
          type: APPLY,
          buff,
        });
        events.push({
          timestamp: buff.end || this.owner.currentTimestamp,
          type: REMOVE,
          buff,
        });
      });
    });

    let active = 0;
    let start = null;
    return events.sort((a, b) => a.timestamp - b.timestamp).reduce((uptime, event) => {
      if (event.type === APPLY) {
        if (active === 0) {
          start = event.timestamp;
        }
        active += 1;
      }
      if (event.type === REMOVE) {
        active -= 1;
        if (active === 0) {
          uptime += event.timestamp - start;
        }
      }
      return uptime;
    }, 0);
  }
}

export default Entities;
