import Initialize from './Modules/Core/Initialize';
import Buffs from './Modules/Core/Buffs';
import Combatants from './Modules/Core/Combatants';
import CastCounter from './Modules/Core/CastCounter';

import BeaconHealing from './Modules/PaladinCore/BeaconHealing';
import BeaconTargets from './Modules/PaladinCore/BeaconTargets';
import VerifySpec from './Modules/PaladinCore/VerifySpec';

import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import SacredDawn from './Modules/Features/SacredDawn';
import TyrsDeliverance from './Modules/Features/TyrsDeliverance';

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
    initialize: Initialize,
    buffs: Buffs,
    combatants: Combatants,
    castCounter: CastCounter,

    // PaladinCore
    beaconHealing: BeaconHealing,
    beaconTargets: BeaconTargets,
    verifySpec: VerifySpec,

    // Features
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    sacredDawn: SacredDawn,
    tyrsDeliverance: TyrsDeliverance,

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

  /** @returns Combatants */
  get combatants() {
    return this.modules.combatants;
  }

  /** @returns {Combatant} */
  get selectedCombatant() {
    return this.combatants.selected;
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
        if (this.error) {
          throw new Error(this.error);
        }
        this._timestamp = event.timestamp;

        // Triggering a lot of events here for development pleasure; does this have a significant performance impact?
        this.triggerEvent('event', event);
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
    Object.keys(this.modules)
      .map(key => this.modules[key])
      .filter(module => module.active)
      .forEach(module => {
        this.constructor.tryCall(module, methodName, event);
      });
  }
  static tryCall(object, methodName, event) {
    const method = object[methodName];
    if (method) {
      method.call(object, event);
    }
  }

  byPlayer(event, playerId = this.player.id) {
    return (event.sourceID === playerId);
  }
  toPlayer(event, playerId = this.player.id) {
    return (event.targetID === playerId);
  }

  initialized = false;
  error = null;
  on_initialized() {
    this.initialized = true;
    if (!this.selectedCombatant) {
      this.error = 'The selected player could not be found in this fight. Make sure the log is recorded with Advanced Combat Logging enabled.';
    }
  }
  finished = false;
  on_finished() {
    this.finished = true;
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
