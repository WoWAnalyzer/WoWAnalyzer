import Analyzer from 'parser/core/Analyzer';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, ApplyDebuffEvent, ApplyDebuffStackEvent, Event, EventType, RemoveBuffEvent, RemoveBuffStackEvent, RemoveDebuffEvent, RemoveDebuffStackEvent } from 'parser/core/Events';
import Entity, { TrackedBuffEvent } from 'parser/core/Entity';

const debug = false;

const APPLY = 'apply';
const REMOVE = 'remove';

class Entities extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
  };
  readonly eventEmitter!: EventEmitter;

  constructor(options: any) {
    super(options);
    this.addEventListener(Events.applybuff, (event: ApplyBuffEvent) => this.applyBuff(event));
    this.addEventListener(Events.applydebuff, (event: ApplyDebuffEvent) => this.applyBuff(event));
    this.addEventListener(Events.removebuff, (event: RemoveBuffEvent) => this.removeBuff(event));
    this.addEventListener(Events.removedebuff, (event: RemoveDebuffEvent) => this.removeBuff(event));
    // TODO: Add a sanity check to the `refreshbuff` event that checks if a buff that's being refreshed was applied, if it wasn't it might be a broken pre-combat applied buff not shown in the combatantinfo event
    // We don't store/use durations, so refreshing buff is useless. Removing the buff actually interferes with the `minimalActiveTime` parameter of `getBuff`.
    // on_refreshbuff(event) {
    //   this.removeActiveBuff(event);
    //   this.applyActiveBuff(event);
    // }
    this.addEventListener(Events.applybuffstack, (event: ApplyBuffStackEvent) => this.updateBuffStack(event));
    this.addEventListener(Events.applydebuffstack, (event: ApplyDebuffStackEvent) => this.updateBuffStack(event));
    this.addEventListener(Events.removebuffstack, (event: RemoveBuffStackEvent) => this.updateBuffStack(event));
    this.addEventListener(Events.removedebuffstack, (event: RemoveDebuffStackEvent) => this.updateBuffStack(event));
  }

  getEntities(): Array<Entity> {
    throw new Error('Not implemented');
  }

  getEntity(event: Event<any>): Entity | null {
    throw new Error('Not implemented');
  }

  applyBuff(event: ApplyBuffEvent | ApplyDebuffEvent) {
    if (!this.owner.byPlayer(event) && !this.owner.toPlayer(event)) {
      // We don't need to know about debuffs on bosses or buffs on other players not caused by us, but we do want to know about our outgoing buffs, and other people's buffs on us
      return;
    }
    const entity = this.getEntity(event);
    if (!entity) {
      return;
    }

    debug && this.log(`Apply buff ${event.ability.name} to ${entity.name}`);
    const isDebuff = event.type === EventType.ApplyDebuff;
    const buff = {
      ...event,
      start: event.timestamp,
      end: null,
      isDebuff,
      // The initial buff counts as 1 stack, to make the `changebuffstack` event complete it's fired for all applybuff events, including buffs that aren't actually stackable.
      stacks: 1,
    };

    this._triggerChangeBuffStack(buff, event.timestamp, 0, 1);

    if (event.prepull && event.__fromCombatantinfo) {
      // Prepull buffs were already applied in the Combatant constructor
      return;
    }

    entity.applyBuff(buff);
  }

  updateBuffStack(event: ApplyBuffStackEvent | ApplyDebuffStackEvent | RemoveBuffStackEvent | RemoveDebuffStackEvent) {
    if (!this.owner.byPlayer(event) && !this.owner.toPlayer(event)) {
      // We don't need to know about debuffs on bosses or buffs on other players not caused by us, but we do want to know about our outgoing buffs, and other people's buffs on us
      return;
    }
    const entity = this.getEntity(event);
    if (!entity) {
      return;
    }

    debug && this.log(`Apply buff stack ${event.ability.name} to ${entity.name}`);

    const existingBuff = entity.buffs.find(item => item.ability.guid === event.ability.guid && item.end === null && event.sourceID === item.sourceID);
    if (existingBuff) {
      const oldStacks = existingBuff.stacks || 1; // the original spell counts as 1 stack
      existingBuff.stacks = event.stack;
      existingBuff.stackHistory.push({ stacks: event.stack, timestamp: event.timestamp });

      this._triggerChangeBuffStack(existingBuff, event.timestamp, oldStacks, existingBuff.stacks);
    } else {
      console.error('Buff stack updated while active buff wasn\'t known. Was this buff applied pre-combat? Maybe we should register the buff with start time as fight start when this happens, but it might also be a basic case of erroneous combatlog ordering.');
    }
  }

  removeBuff(event: RemoveBuffEvent | RemoveDebuffEvent) {
    if (!this.owner.byPlayer(event) && !this.owner.toPlayer(event)) {
      // We don't need to know about debuffs on bosses or buffs on other players not caused by us, but we do want to know about our outgoing buffs, and other people's buffs on us
      return;
    }
    const entity = this.getEntity(event);
    if (!entity) {
      return;
    }

    debug && this.log(`Remove buff ${event.ability.name} from ${entity.name}`);

    const existingBuff = entity.buffs.find(item => item.ability.guid === event.ability.guid && item.end === null && event.sourceID === item.sourceID);
    if (existingBuff) {
      existingBuff.end = event.timestamp;
      existingBuff.stackHistory.push({ stacks: 0, timestamp: event.timestamp });

      this._triggerChangeBuffStack(existingBuff, event.timestamp, existingBuff.stacks, 0);
    } else {
      // The only possible legit way this could occur that I can imagine is if the log was bugged and had more removebuff events than applybuff events. This might be caused by range or phasing issues.
      // TODO: throw new Error(`Buff ${event.ability.name} wasn't correctly applied in the ApplyBuff normalizer.`);
      // TODO: Remove below and add above. http://localhost:3000/report/YcbxZv1hKX4GVr82/33-Mythic+Grong+-+Wipe+23+(4:26)/45-Teish has issues due to Tricks of the Trade being applied twice at the start by different people. Need to change ApplyBuff to fix this, probably not super complicated but too late to do now.
      const isDebuff = event.type === EventType.RemoveDebuff;
      const buff = {
        ...event,
        start: this.owner.fight.start_time,
        end: event.timestamp,
        stackHistory: [{ stacks: 1, timestamp: this.owner.fight.start_time }, { stacks: 0, timestamp: event.timestamp }],
        isDebuff,
        stacks: 0,
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
  _triggerChangeBuffStack(buff: any, timestamp: number, oldStacks: number, newStacks: number) {
    this.eventEmitter.fabricateEvent({
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
  getBuffUptime(spellId: number, sourceID = this.owner.playerId) {
    const events: Array<{timestamp: number, type: string, buff: TrackedBuffEvent}> = [];

    const entities = this.getEntities();
    Object.values(entities)
      .forEach(enemy => {
        enemy.getBuffHistory(spellId, sourceID)
          .forEach((buff: TrackedBuffEvent) => {
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
    let start: number;
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
