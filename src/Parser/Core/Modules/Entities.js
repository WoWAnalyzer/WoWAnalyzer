import { formatMilliseconds } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

const APPLY = 'apply';
const REMOVE = 'remove';

class Entities extends Analyzer {
  getEntities() {
    throw new Error('Not implemented');
  }
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
      const fightDuration = formatMilliseconds(event.timestamp - this.owner.fight.start_time);
      console.log(fightDuration, 'Entities', `Apply buff ${event.ability.name} to ${entity.name}`);
    }

    const buff = {
      ...event,
      start: event.timestamp,
      end: null,
      stackHistory: [{ stacks: 1, timestamp: event.timestamp }],
      isDebuff,
    };

    // The initial buff counts as 1 stack, to make the `changebuffstack` event complete it's fired for all applybuff events, including buffs that aren't actually stackable.
    buff.stacks = 1;
    this._triggerChangeBuffStack(buff, event.timestamp, 0, 1);

    entity.buffs.push(buff);
  }

  updateBuffStack(event) {
    if (!this.owner.byPlayer(event) && !this.owner.toPlayer(event)) {
      // We don't need to know about debuffs on bosses or buffs on other players not caused by us, but we do want to know about our outgoing buffs, and other people's buffs on us
      return;
    }
    const entity = this.getEntity(event);
    if (!entity) {
      return;
    }

    if (debug) {
      const fightDuration = formatMilliseconds(event.timestamp - this.owner.fight.start_time);
      console.log(fightDuration, 'Entities', `Apply buff stack ${event.ability.name} to ${entity.name}`);
    }

    const existingBuff = entity.buffs.find(item => item.ability.guid === event.ability.guid && item.end === null);
    if (existingBuff) {
      const oldStacks = existingBuff.stacks || 1; // the original spell counts as 1 stack
      existingBuff.stacks = event.stack;
      existingBuff.stackHistory.push({ stacks: event.stack, timestamp: event.timestamp });

      this._triggerChangeBuffStack(existingBuff, event.timestamp, oldStacks, existingBuff.stacks);
    } else {
      console.error('Buff stack updated while active buff wasn\'t known. Was this buff applied pre-combat? Maybe we should register the buff with start time as fight start when this happens, but it might also be a basic case of erroneous combatlog ordering.');
    }
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
      const fightDuration = formatMilliseconds(event.timestamp - this.owner.fight.start_time);
      console.log(fightDuration, 'Entities', `Remove buff ${event.ability.name} from ${entity.name}`);
    }

    const existingBuff = entity.buffs.find(item => item.ability.guid === event.ability.guid && item.end === null);
    if (existingBuff) {
      existingBuff.end = event.timestamp;
      existingBuff.stackHistory.push({ stacks: 0, timestamp: event.timestamp });

      this._triggerChangeBuffStack(existingBuff, event.timestamp, existingBuff.stacks, 0);
    } else {
      const buff = {
        ...event,
        start: this.owner.fight.start_time,
        end: event.timestamp,
        stackHistory: [{ stacks: 1, timestamp: this.owner.fight.start_time }, { stacks: 0, timestamp: event.timestamp }],
        isDebuff,
      };
      entity.buffs.push(buff);

      this._triggerChangeBuffStack(buff, event.timestamp, 1, 0);
    }
  }

  /**
   * Trigger a custom `changebuffstack` event that provides all information available about the buff and its stacks, most notably `oldStacks`, `newStacks` and `stacksGained`.
   * This event is also fired for `applybuff` where `oldStacks` will be 0 and `newStacks` will be 1. NOTE: This event is usually fired before the `applybuff` event!
   * This event is also fired for `removebuff` where `oldStacks` will be either the old stacks (if there were multiple) or 1 and `newStacks` will be 0. NOTE: This event is usually fired before the `removebuff` event!
   */
  _triggerChangeBuffStack(buff, timestamp, oldStacks, newStacks) {
    this.owner.fabricateEvent({
      ...buff,
      type: buff.isDebuff ? 'changedebuffstack' : 'changebuffstack',
      timestamp,
      oldStacks,
      newStacks,
      stacksGained: newStacks - oldStacks,
      stack: undefined,
    }, buff);
  }

  // Surely this can be done with a couple less loops???
  getBuffUptime(spellId, sourceID = this.owner.playerId) {
    const events = [];

    const entities = this.getEntities();
    Object.values(entities)
      .forEach(enemy => {
        enemy.getBuffHistory(spellId, sourceID)
          .forEach(buff => {
            events.push({
              timestamp: buff.start,
              type: APPLY,
              buff,
            });
            events.push({
              timestamp: buff.end !== null ? buff.end : this.owner.currentTimestamp, // buff end is null if it's still active, it can also be 0 if buff ended at pull
              type: REMOVE,
              buff,
            });
          });
      });

    let active = 0;
    let start = null;
    return events
      .sort((a, b) => a.timestamp - b.timestamp)
      .reduce((uptime, event) => {
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
