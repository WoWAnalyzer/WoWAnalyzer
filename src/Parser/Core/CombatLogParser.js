import { formatNumber, formatPercentage } from 'common/format';

import Combatants from './Modules/Combatants';
import AbilityTracker from './Modules/AbilityTracker';
import AlwaysBeCasting from './Modules/AlwaysBeCasting';
import Enemies from './Modules/Enemies';
import HealEventTracker from './Modules/HealEventTracker';
import ManaValues from './Modules/ManaValues';
import SpellManaCost from './Modules/SpellManaCost';

// Shared Legendaries
import Prydaz from './Modules/Items/Prydaz';
import Velens from './Modules/Items/Velens';
import SephuzsSecret from './Modules/Items/SephuzsSecret';
// Shared Epics
import DrapeOfShame from './Modules/Items/DrapeOfShame';
import DarkmoonDeckPromises from './Modules/Items/DarkmoonDeckPromises';
import AmalgamsSeventhSpine from './Modules/Items/AmalgamsSeventhSpine';
import ArchiveOfFaith from './Modules/Items/ArchiveOfFaith';
import BarbaricMindslaver from './Modules/Items/BarbaricMindslaver';
import SeaStar from './Modules/Items/SeaStarOfTheDepthmother';
import DeceiversGrandDesign from './Modules/Items/DeceiversGrandDesign';
import PrePotion from './Modules/Items/PrePotion';
import GnawedThumbRing from './Modules/Items/GnawedThumbRing';
import VialOfCeaselessToxins from './Modules/Items/VialOfCeaselessToxins';
import SpecterOfBetrayal from './Modules/Items/SpecterOfBetrayal';
import EngineOfEradication from './Modules/Items/EngineOfEradication';

// Shared Buffs
import VantusRune from './Modules/VantusRune';

import ParseResults from './ParseResults';

class CombatLogParser {
  static abilitiesAffectedByHealingIncreases = [];

  static defaultModules = {
    combatants: Combatants,
    enemies: Enemies,
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
    healEventTracker: HealEventTracker,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    vantusRune: VantusRune,

    // Items:
    // Legendaries:
    prydaz: Prydaz,
    velens: Velens,
    sephuzsSecret: SephuzsSecret,
    // Epics:
    drapeOfShame: DrapeOfShame,
    amalgamsSeventhSpine: AmalgamsSeventhSpine,
    darkmoonDeckPromises: DarkmoonDeckPromises,
    prePotion: PrePotion,
    gnawedThumbRing: GnawedThumbRing,
    // Tomb trinkets:
    archiveOfFaith: ArchiveOfFaith,
    barbaricMindslaver: BarbaricMindslaver,
    seaStar: SeaStar,
    deceiversGrandDesign: DeceiversGrandDesign,
    vialCeaslessToxins: VialOfCeaselessToxins,
    specterOfBetrayal: SpecterOfBetrayal,
    engineOfEradication: EngineOfEradication,
  };
  // Override this with spec specific modules
  static specModules = {};

  report = null;
  player = null;
  fight = null;

  modules = {};
  get activeModules() {
    return Object.keys(this.modules)
      .map(key => this.modules[key])
      .filter(module => module.active);
  }

  get playerId() {
    return this.player.id;
  }

  /** @returns Combatants */
  get combatants() {
    return this.modules.combatants;
  }
  get playerCount() {
    return this.modules.combatants.playerCount;
  }

  /** @returns {Combatant} */
  get selectedCombatant() {
    return this.combatants.selected;
  }

  get fightDuration() {
    return (this.finished ? this.fight.end_time : this.currentTimestamp) - this.fight.start_time;
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

    this.initializeModules({
      ...this.constructor.defaultModules,
      ...this.constructor.specModules,
    });
  }

  initializeModules(modules) {
    const failedModules = [];
    Object.keys(modules).forEach(desiredModuleName => {
      const moduleClass = modules[desiredModuleName];

      const availableDependencies = {};
      const missingDependencies = [];
      if (moduleClass.dependencies) {
        Object.keys(moduleClass.dependencies).forEach(desiredDependencyName => {
          const dependencyClass = moduleClass.dependencies[desiredDependencyName];

          const dependencyModule = this.findModule(dependencyClass);
          if (dependencyModule) {
            availableDependencies[desiredDependencyName] = dependencyModule;
          } else {
            missingDependencies.push(dependencyClass);
          }
        });
      }

      if (missingDependencies.length === 0) {
        if (Object.keys(availableDependencies).length === 0) {
          console.log('Loading', moduleClass.name);
        } else {
          console.log('Loading', moduleClass.name, 'with dependencies:', Object.keys(availableDependencies));
        }
        this.modules[desiredModuleName] = new moduleClass(this, availableDependencies, Object.keys(this.modules).length);
      } else {
        console.warn(moduleClass.name, 'could not be loaded, missing dependencies:', missingDependencies.map(d => d.name));
        failedModules.push(desiredModuleName);
      }
    });

    if (failedModules.length !== 0) {
      console.warn(`${failedModules.length} modules failed to load, trying again:`, failedModules.map(key => modules[key].name));
      const newBatch = {};
      failedModules.forEach(key => {
        newBatch[key] = modules[key];
      });
      this.initializeModules(newBatch);
    }
  }
  findModule(type) {
    return Object.keys(this.modules)
      .map(key => this.modules[key])
      .find(module => module instanceof type);
  }

  _debugEventHistory = [];
  parseEvents(events) {
    if (process.env.NODE_ENV === 'development') {
      this._debugEventHistory = [
        ...this._debugEventHistory,
        ...events,
      ];
    }
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
    })
      .then((results) => {
        this.triggerEvent('forceUpdate');
        return results;
      });
  }

  triggerEvent(eventType, event) {
    const methodName = `on_${eventType}`;
    this.constructor.tryCall(this, methodName, event);
    this.activeModules
      .sort((a, b) => a.priority - b.priority) // lowest should go first, as `priority = 0` will have highest prio
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

  // This used to be implemented as a sanity check, may be replaced by a cleaner solution.
  totalHealing = 0;
  totalOverhealingDone = 0;
  get totalRawHealingDone() {
    return this.totalHealing + this.totalOverhealingDone;
  }
  on_byPlayer_heal(event) {
    this.totalHealing += event.amount + (event.absorbed || 0);
    this.totalOverhealingDone += event.overheal || 0;
  }
  on_byPlayer_absorbed(event) {
    this.totalHealing += event.amount + (event.absorbed || 0);
  }
  on_byPlayer_removebuff(event) {
    if (event.absorb > 0) {
      this.totalOverhealingDone += event.absorb;
    }
  }

  totalDamageDone = 0;
  totalDamageDoneToFriendly = 0;
  on_byPlayer_damage(event) {
    const damageDone = event.amount + (event.absorbed || 0);
    if (event.targetIsFriendly) {
      this.totalDamageDoneToFriendly += damageDone;
    } else {
      this.totalDamageDone += damageDone;
    }
  }

  totalDamageTaken = 0;
  totalDamageTakenAbsorb = 0;
  on_toPlayer_damage(event) {
    this.totalDamageTaken += event.amount + (event.absorbed || 0);
    this.totalDamageTakenAbsorb += (event.absorbed || 0);
  }

  // TODO: Damage taken from LOTM

  getPercentageOfTotalHealingDone(healingDone) {
    return healingDone / this.totalHealing;
  }
  formatItemHealingDone(healingDone) {
    return `${formatPercentage(this.getPercentageOfTotalHealingDone(healingDone))} % / ${formatNumber(healingDone / this.fightDuration * 1000)} HPS`;
  }
  getPercentageOfTotalDamageDone(damageDone) {
    return damageDone / this.totalDamageDone;
  }
  formatItemDamageDone(damageDone) {
    return `${formatPercentage(this.getPercentageOfTotalDamageDone(damageDone))} % / ${formatNumber(damageDone / this.fightDuration * 1000)} DPS`;
  }

  generateResults() {
    const results = new ParseResults();

    // Epics:
    if (this.modules.drapeOfShame.active) {
      results.items.push({
        item: ITEMS.DRAPE_OF_SHAME,
        result: formatItemHealing(this.modules.drapeOfShame.healing),
      });
    }
    if (this.modules.darkmoonDeckPromises.active) {
      results.items.push({
        item: ITEMS.DARKMOON_DECK_PROMISES,
        result: (
          <dfn data-tip="The exact amount of mana saved by the Darkmoon Deck: Promises equip effect. This takes the different values per card into account at the time of the cast.">
            {formatThousands(this.modules.darkmoonDeckPromises.manaGained)} mana saved ({formatThousands(this.modules.darkmoonDeckPromises.manaGained / this.fightDuration * 1000 * 5)} MP5)
          </dfn>
        ),
      });
    }
    if (this.modules.amalgamsSeventhSpine.active) {
      results.items.push({
        item: ITEMS.AMALGAMS_SEVENTH_SPINE,
        result: (
          <dfn data-tip={`The exact amount of mana gained from the Amalgam's Seventh Spine equip effect. The buff expired successfully ${this.modules.amalgamsSeventhSpine.procs} times and the buff was refreshed ${this.modules.amalgamsSeventhSpine.refreshes} times (refreshing delays the buff expiration and is inefficient use of this trinket).`}>
            {formatThousands(this.modules.amalgamsSeventhSpine.manaGained)} mana gained ({formatThousands(this.modules.amalgamsSeventhSpine.manaGained / this.fightDuration * 1000 * 5)} MP5)
          </dfn>
        ),
      });
    }
    if (this.modules.gnawedThumbRing.active) {
      results.items.push({
        item: ITEMS.GNAWED_THUMB_RING,
        result: (<dfn data-tip={`The effective healing and damage contributed by Gnawed Thumb Ring.<br/> Damage: ${formatItemDamage(this.modules.gnawedThumbRing.damageIncreased)} <br/> Healing: ${formatItemHealing(this.modules.gnawedThumbRing.healingIncreaseHealing)}`}>
            {this.modules.gnawedThumbRing.healingIncreaseHealing > this.modules.gnawedThumbRing.damageIncreased ? formatItemHealing(this.modules.gnawedThumbRing.healingIncreaseHealing) : formatItemDamage(this.modules.gnawedThumbRing.damageIncreased)}
          </dfn>),
      });
    }
    if (this.modules.vialCeaslessToxins.active) {
      results.items.push({
        item: ITEMS.VIAL_OF_CEASELESS_TOXINS,
        result: (<dfn data-tip={`The effective damage contributed by Vial of Ceasless Toxins.<br/>Casts: ${this.modules.vialCeaslessToxins.totalToxinCast}<br/> Damage: ${formatItemDamage(this.modules.vialCeaslessToxins.damageIncreased)}<br/> Total Damage: ${formatNumber(this.modules.vialCeaslessToxins.damageIncreased)}`}>
            {formatItemDamage(this.modules.vialCeaslessToxins.damageIncreased)}
          </dfn>),
      });
    }
    if (this.modules.specterOfBetrayal.active) {
      results.items.push({
        item: ITEMS.SPECTER_OF_BETRAYAL,
        result: (<dfn data-tip={`The effective damage contributed by Specter of Betrayal.<br/>Casts: ${this.modules.specterOfBetrayal.totalCasts}<br/> Damage: ${formatItemDamage(this.modules.specterOfBetrayal.damageIncreased)}<br/> Total Damage: ${formatNumber(this.modules.specterOfBetrayal.damageIncreased)}`}>
            {formatItemDamage(this.modules.specterOfBetrayal.damageIncreased)}
          </dfn>),
      });
    }
    if (this.modules.engineOfEradication.active) {
      results.items.push({
        item: ITEMS.ENGINE_OF_ERADICATION,
        result: `${((this.modules.engineOfEradication.uptime / fightDuration * 100) || 0).toFixed(2)} % uptime`,
      });
    }
    if (this.modules.archiveOfFaith.active) {
      const archiveOfFaithHealing = this.modules.archiveOfFaith.healing / this.totalHealing;
      const archiveOfFaithHOTHealing = this.modules.archiveOfFaith.healingOverTime / this.totalHealing;
      const archiveOfFaithHealingTotal = (this.modules.archiveOfFaith.healing + this.modules.archiveOfFaith.healingOverTime) / this.totalHealing;
      results.items.push({
        item: ITEMS.ARCHIVE_OF_FAITH,
        result: (
          <dfn data-tip={`The effective healing contributed by the Archive of Faith on-use effect.<br />Channel: ${((archiveOfFaithHealing * 100) || 0).toFixed(2)} % / ${formatNumber(this.modules.archiveOfFaith.healing / fightDuration * 1000)} HPS<br />HOT: ${((archiveOfFaithHOTHealing * 100) || 0).toFixed(2)} % / ${formatNumber(this.modules.archiveOfFaith.healingOverTime / fightDuration * 1000)} HPS`}>
            {((archiveOfFaithHealingTotal * 100) || 0).toFixed(2)} % / {formatNumber((this.modules.archiveOfFaith.healing + this.modules.archiveOfFaith.healingOverTime) / fightDuration * 1000)} HPS
          </dfn>
        ),
      });
    }
    if (this.modules.barbaricMindslaver.active) {
      results.items.push({
        item: ITEMS.BARBARIC_MINDSLAVER,
        result: formatItemHealing(this.modules.barbaricMindslaver.healing),
      });
    }
    if (this.modules.seaStar.active) {
      results.items.push({
        item: ITEMS.SEA_STAR_OF_THE_DEPTHMOTHER,
        result: formatItemHealing(this.modules.seaStar.healing),
      });
    }
    if (this.modules.deceiversGrandDesign.active) {
      const deceiversGrandDesignHealingPercentage = this.modules.deceiversGrandDesign.healing / this.totalHealing;
      const deceiversGrandDesignAbsorbPercentage = this.modules.deceiversGrandDesign.healingAbsorb / this.totalHealing;
      const deceiversGrandDesignTotalPercentage = (this.modules.deceiversGrandDesign.healing + this.modules.deceiversGrandDesign.healingAbsorb) / this.totalHealing;
      results.items.push({
        item: ITEMS.DECEIVERS_GRAND_DESIGN,
        result: (
          <dfn data-tip={`The effective healing contributed by the Deciever's Grand Design on-use effect.<br />HOT: ${((deceiversGrandDesignHealingPercentage * 100) || 0).toFixed(2)} % / ${formatNumber(this.modules.deceiversGrandDesign.healing / fightDuration * 1000)} HPS<br />Shield Proc: ${((deceiversGrandDesignAbsorbPercentage * 100) || 0).toFixed(2)} % / ${formatNumber(this.modules.deceiversGrandDesign.healingAbsorb / fightDuration * 1000)} HPS`}>
            {((deceiversGrandDesignTotalPercentage * 100) || 0).toFixed(2)} % / {formatNumber((this.modules.deceiversGrandDesign.healing + this.modules.deceiversGrandDesign.healingAbsorb) / fightDuration * 1000)} HPS
          </dfn>
        ),
      });

    return results;
  }
}

export default CombatLogParser;
