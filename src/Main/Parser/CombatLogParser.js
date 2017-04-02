import Buffs from './Modules/Core/Buffs';
import Combatants from './Modules/Core/Combatants';
import BeaconHealing from './Modules/Core/BeaconHealing';

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
    beaconHealing: BeaconHealing,
    buffs: Buffs,
    combatants: Combatants,

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

  modules = {};

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
  finished() {
    this.triggerEvent('finished', null);
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

  byPlayer(event) {
    return (event.sourceID === this.player.id);
  }
  toPlayer(event) {
    return (event.targetID === this.player.id);
  }

  totalHealing = 0;
  on_heal(event) {
    if (this.byPlayer(event)) {
      this.totalHealing += event.amount; // event.absorbed contains absorbed healing (e.g. by Time Release), should we include that?
    }
  }
  on_absorbed(event) {
    if (this.byPlayer(event)) {
      this.totalHealing += event.amount;
    }
  }
  // TODO: Damage taken from LOTM
}

export default CombatLogParser;
