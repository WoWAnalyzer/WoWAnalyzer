import Buffs from './Modules/Core/Buffs';
import Combatants from './Modules/Core/Combatants';
import BeaconHealing from './Modules/Core/BeaconHealing';
import BeaconTargets from './Modules/Core/BeaconTargets';

import CastRatios from './Modules/Features/CastRatios';
import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

import DrapeOfShame from './Modules/Legendaries/DrapeOfShame';
import Ilterendi from './Modules/Legendaries/Ilterendi';
import Velens from './Modules/Legendaries/Velens';
import ChainOfThrayn from './Modules/Legendaries/ChainOfThrayn';
import Prydaz from './Modules/Legendaries/Prydaz';
import ObsidianStoneSpaulders from './Modules/Legendaries/ObsidianStoneSpaulders';
import MaraadsDyingBreath from './Modules/Legendaries/MaraadsDyingBreath';

class CombatLogParser {
  static enabledModules = {
    // Core
    buffs: Buffs,
    combatants: Combatants,

    // Semi-core
    beaconHealing: BeaconHealing,
    beaconTargets: BeaconTargets,

    // Features
    castRatios: CastRatios,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,

    // Legendaries:
    drapeOfShame: DrapeOfShame,
    ilterendi: Ilterendi,
    velens: Velens,
    chainOfThrayn: ChainOfThrayn,
    prydaz: Prydaz,
    obsidianStoneSpaulders: ObsidianStoneSpaulders,
    maraadsDyingBreath: MaraadsDyingBreath,
  };

  report = null;
  player = null;
  fight = null;

  get playerId() {
    return this.player.id;
  }

  modules = {};

  get buffs() {
    return this.modules.buffs;
  }
  get combatants() {
    return this.modules.combatants;
  }

  get fightDuration() {
    return this.fight.end_time - this.fight.start_time;
  }
  _timestamp = null;
  get currentTimestamp() {
    return this._timestamp;
  }
  get playersById() {
    return this.report.friendlies.reduce((obj, player) => {
      obj[player.id] = player;
      return obj;
    }, {});
  }

  constructor(report, player, fight) {
    this.report = report;
    this.player = player;
    this.fight = fight;

    Object.keys(this.constructor.enabledModules).forEach(key => {
      const value = this.constructor.enabledModules[key];
      this.modules[key] = new value(this);
    });
  }

  parseEvents(events) {
    return new Promise((resolve, reject) => {
      events.forEach(event => {
        this._timestamp = event.timestamp;

        this.triggerEvent(event.type, event);
        if (this.byPlayer(event)) {
          this.triggerEvent(`byPlayer_${event.type}`, event);
        }
        if (this.toPlayer(event)) {
          this.triggerEvent(`toPlayer_${event.type}`, event);
        }
      });

      resolve(events.length);
    });
  }
  triggerEvent(eventType, event) {
    const methodName = `on_${eventType}`;
    this.constructor.tryCall(this, methodName, event);
    Object.keys(this.modules).forEach(key => {
      const module = this.modules[key];
      this.constructor.tryCall(module, methodName, event);
    });
  }
  static tryCall(object, methodName, event) {
    const method = object[methodName];
    if (method) {
      method.call(object, event);
    }
  }
  finished() {
    this.triggerEvent('finished', null);
  }

  byPlayer(event) {
    return (event.sourceID === this.player.id);
  }
  toPlayer(event) {
    return (event.targetID === this.player.id);
  }

  totalHealing = 0;
  on_byPlayer_heal(event) {
    this.totalHealing += event.amount + (event.absorbed || 0);
  }
  on_byPlayer_absorbed(event) {
    this.totalHealing += event.amount + (event.absorbed || 0);
  }
  // TODO: Damage taken from LOTM
}

export default CombatLogParser;
