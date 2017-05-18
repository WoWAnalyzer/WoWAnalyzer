import Module from 'Parser/Core/Module';

const debug = false;

const APPLY = 'apply';
const REMOVE = 'remove';

class Enemies extends Module {
  //noinspection JSMethodCanBeStatic
  getEntities() {
    throw new Error('Not implemented');
  }
  //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  getEntity(event) {
    throw new Error('Not implemented');
  }

  on_byPlayer_applybuff(event) {
    this.applyBuff(event);
  }
  // We don't store/use durations, so refreshing buff is useless. Removing the buff actually interferes with the `minimalActiveTime` parameter of `getBuff`.
  // on_refreshbuff(event) {
  //   this.removeActiveBuff(event);
  //   this.applyActiveBuff(event);
  // }
  on_byPlayer_removebuff(event) {
    this.removeBuff(event);
  }
  on_byPlayer_removebuffstack(event) {
    this.removeBuffStack(event);
  }
  on_byPlayer_applydebuff(event) {
    this.applyBuff(event, true);
  }
  on_byPlayer_removedebuff(event) {
    this.removeBuff(event, true);
  }
  on_byPlayer_removedebuffstack(event) {
    this.removeBuffStack(event, true);
  }

  applyBuff(event, isDebuff) {
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
  removeBuff(event, isDebuff) {
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
    } else {
      entity.buffs.push({
        ...event,
        start: this.owner.fight.start_time,
        end: event.timestamp,
        isDebuff,
      });
    }
  }
  removeBuffStack(event, isDebuff) {
    const entity = this.getEntity(event);
    if (!entity) {
      return;
    }

    if (debug) {
      const secondsIntoFight = (event.timestamp - this.owner.fight.start_time) / 1000;
      console.log(secondsIntoFight, event.timestamp, `Remove buff stack ${event.ability.name} from ${entity.name}`);
    }

    // In the case of Maraad's Dying Breath it calls a `removebuffstack` that removes all additional stacks from the buff before it calls a `removebuff`, with this we can find the amount of stacks it had. The `buff.stacks` only includes the amount of removed stacks, which (at least for Maraad's) are all stacks minus one since the original buff is also considered a stack.
    const existingBuff = entity.buffs.find(item => item.ability.guid === event.ability.guid && item.end === null);
    if (existingBuff) {
      existingBuff.stacks = event.stack + 1;
    }
  }

  // Surely this can be done with a couple less loops???
  getBuffUptime(spellId) {
    const events = [];

    const entities = this.getEntities();
    Object.keys(entities).map(k => entities[k]).forEach((enemy) => {
      enemy.buffs.forEach((buff) => {
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

export default Enemies;
