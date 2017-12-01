import { formatNumber, formatPercentage } from 'common/format';

import Status from './Modules/Status';
import HealingDone from './Modules/HealingDone';
import DamageDone from './Modules/DamageDone';
import DamageTaken from './Modules/DamageTaken';

import Combatants from './Modules/Combatants';
import AbilityTracker from './Modules/AbilityTracker';
import Haste from './Modules/Haste';
import AlwaysBeCasting from './Modules/AlwaysBeCasting';
import CastEfficiency from './Modules/CastEfficiency';
import SpellUsable from './Modules/SpellUsable';
import Enemies from './Modules/Enemies';
import EnemyInstances from './Modules/EnemyInstances';
import Pets from './Modules/Pets';
import HealEventTracker from './Modules/HealEventTracker';
import ManaValues from './Modules/ManaValues';
import SpellManaCost from './Modules/SpellManaCost';
import DistanceMoved from './Modules/DistanceMoved';

import CritEffectBonus from './Modules/Helpers/CritEffectBonus';
import ApplyBuffFixer from './Modules/Helpers/ApplyBuffFixer';

// Shared Legendaries
import Prydaz from './Modules/Items/Prydaz';
import Velens from './Modules/Items/Velens';
import SephuzsSecret from './Modules/Items/SephuzsSecret';
import KiljaedensBurningWish from './Modules/Items/KiljaedensBurningWish';
import ArchimondesHatredReborn from './Modules/Items/ArchimondesHatredReborn';
import Cinidaria from './Modules/Items/Cinidaria';
// Shared Epics
import DrapeOfShame from './Modules/Items/DrapeOfShame';
import DarkmoonDeckPromises from './Modules/Items/DarkmoonDeckPromises';
import AmalgamsSeventhSpine from './Modules/Items/AmalgamsSeventhSpine';
import ArchiveOfFaith from './Modules/Items/ArchiveOfFaith';
import BarbaricMindslaver from './Modules/Items/BarbaricMindslaver';
import SeaStar from './Modules/Items/SeaStarOfTheDepthmother';
import DeceiversGrandDesign from './Modules/Items/DeceiversGrandDesign';
import PrePotion from './Modules/Items/PrePotion';
import LegendaryUpgradeChecker from './Modules/Items/LegendaryUpgradeChecker';
import GnawedThumbRing from './Modules/Items/GnawedThumbRing';
import VialOfCeaselessToxins from './Modules/Items/VialOfCeaselessToxins';
import SpecterOfBetrayal from './Modules/Items/SpecterOfBetrayal';
import EngineOfEradication from './Modules/Items/EngineOfEradication';
import TarnishedSentinelMedallion from './Modules/Items/TarnishedSentinelMedallion';
import SpectralThurible from './Modules/Items/SpectralThurible';
import TerrorFromBelow from './Modules/Items/TerrorFromBelow';
import TomeOfUnravelingSanity from './Modules/Items/TomeOfUnravelingSanity';
import InfernalCinders from './Modules/Items/InfernalCinders';
import UmbralMoonglaives from './Modules/Items/UmbralMoonglaives';
import CarafeOfSearingLight from './Modules/Items/CarafeOfSearingLight';

import ConcordanceUptimeTracker from './Modules/ConcordanceUptimeTracker';

// Shared Buffs
import VantusRune from './Modules/VantusRune';

// Netherlight Crucible Traits
import DarkSorrows from './Modules/NetherlightCrucibleTraits/DarkSorrows';
import TormentTheWeak from './Modules/NetherlightCrucibleTraits/TormentTheWeak';
import ChaoticDarkness from './Modules/NetherlightCrucibleTraits/ChaoticDarkness';
import Shadowbind from './Modules/NetherlightCrucibleTraits/Shadowbind';
import LightsEmbrace from './Modules/NetherlightCrucibleTraits/LightsEmbrace';
import InfusionOfLight from './Modules/NetherlightCrucibleTraits/InfusionOfLight';
import SecureInTheLight from './Modules/NetherlightCrucibleTraits/SecureInTheLight';
import Shocklight from './Modules/NetherlightCrucibleTraits/Shocklight';
import MurderousIntent from './Modules/NetherlightCrucibleTraits/MurderousIntent';
import RefractiveShell from './Modules/NetherlightCrucibleTraits/RefractiveShell';
import NLCTraits from './Modules/NetherlightCrucibleTraits/NLCTraits';

import ParseResults from './ParseResults';

const debug = false;

let _modulesDeprectatedWarningSent = false;

class CombatLogParser {
  static abilitiesAffectedByHealingIncreases = [];

  static defaultModules = {
    status: Status,
    healingDone: HealingDone,
    damageDone: DamageDone,
    damageTaken: DamageTaken,

    combatants: Combatants,
    enemies: Enemies,
    enemyInstances: EnemyInstances,
    pets: Pets,
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
    healEventTracker: HealEventTracker,
    haste: Haste,
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    spellUsable: SpellUsable,
    manaValues: ManaValues,
    vantusRune: VantusRune,
    distanceMoved: DistanceMoved,

    critEffectBonus: CritEffectBonus,
    applyBuffFixer: ApplyBuffFixer,

    // Items:
    // Legendaries:
    prydaz: Prydaz,
    velens: Velens,
    sephuzsSecret: SephuzsSecret,
    kiljaedensBurningWish: KiljaedensBurningWish,
    archimondesHatredReborn: ArchimondesHatredReborn,
    cinidaria: Cinidaria,
    // Epics:
    drapeOfShame: DrapeOfShame,
    amalgamsSeventhSpine: AmalgamsSeventhSpine,
    darkmoonDeckPromises: DarkmoonDeckPromises,
    prePotion: PrePotion,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    gnawedThumbRing: GnawedThumbRing,
    // Tomb trinkets:
    archiveOfFaith: ArchiveOfFaith,
    barbaricMindslaver: BarbaricMindslaver,
    seaStar: SeaStar,
    deceiversGrandDesign: DeceiversGrandDesign,
    vialCeaslessToxins: VialOfCeaselessToxins,
    specterOfBetrayal: SpecterOfBetrayal,
    engineOfEradication: EngineOfEradication,
    tarnishedSentinelMedallion: TarnishedSentinelMedallion,
    spectralThurible: SpectralThurible,
    terrorFromBelow: TerrorFromBelow,
    tomeOfUnravelingSanity: TomeOfUnravelingSanity,
    // Antorus trinkets:
    carafeOfSearingLight: CarafeOfSearingLight,

    // Concordance of the Legionfall
    concordanceUptimeTracker: ConcordanceUptimeTracker,
    // Netherlight Crucible Traits
    darkSorrows: DarkSorrows,
    tormentTheWeak: TormentTheWeak,
    chaoticDarkness: ChaoticDarkness,
    shadowbind: Shadowbind,
    lightsEmbrace: LightsEmbrace,
    infusionOfLight: InfusionOfLight,
    secureInTheLight: SecureInTheLight,
    shocklight: Shocklight,
    refractiveShell: RefractiveShell,
    murderousIntent: MurderousIntent,
    nlcTraits: NLCTraits,

    infernalCinders: InfernalCinders,
    umbralMoonglaives: UmbralMoonglaives,
  };
  // Override this with spec specific modules
  static specModules = {};

  report = null;
  player = null;
  playerPets = null;
  fight = null;

  _modules = {};
  get modules() {
    if (!_modulesDeprectatedWarningSent) {
      console.error('Using `this.owner.modules` is deprectated. You should add the module you want to use as a dependency and use the property that\'s added to your module instead.');
      _modulesDeprectatedWarningSent = true;
    }
    return this._modules;
  }
  get activeModules() {
    return Object.keys(this._modules)
      .map(key => this._modules[key])
      .filter(module => module.active);
  }

  get playerId() {
    return this.player.id;
  }

  _timestamp = null;
  get currentTimestamp() {
    return this.finished ? this.fight.end_time : this._timestamp;
  }
  get fightDuration() {
    return this.currentTimestamp - this.fight.start_time;
  }
  get finished() {
    return this._modules.status.finished;
  }

  get playersById() {
    return this.report.friendlies.reduce((obj, player) => {
      obj[player.id] = player;
      return obj;
    }, {});
  }

  constructor(report, player, playerPets, fight) {
    this.report = report;
    this.player = player;
    this.playerPets = playerPets;
    this.fight = fight;

    this.initializeModules({
      ...this.constructor.defaultModules,
      ...this.constructor.specModules,
    });
  }

  initializeModules(modules) {
    const failedModules = [];
    Object.keys(modules).forEach((desiredModuleName) => {
      const moduleConfig = modules[desiredModuleName];
      if (!moduleConfig) {
        return;
      }
      let moduleClass;
      let options;
      if (moduleConfig instanceof Array) {
        moduleClass = moduleConfig[0];
        options = moduleConfig[1];
      } else {
        moduleClass = moduleConfig;
        options = null;
      }

      const availableDependencies = {};
      const missingDependencies = [];
      if (moduleClass.dependencies) {
        Object.keys(moduleClass.dependencies).forEach((desiredDependencyName) => {
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
        if (debug) {
          if (Object.keys(availableDependencies).length === 0) {
            console.log('Loading', moduleClass.name);
          } else {
            console.log('Loading', moduleClass.name, 'with dependencies:', Object.keys(availableDependencies));
          }
        }
        // eslint-disable-next-line new-cap
        const module = new moduleClass(this, availableDependencies, Object.keys(this._modules).length);
        // We can't set the options via the constructor since a parent constructor can't override the values of a child's class properties.
        // See https://github.com/Microsoft/TypeScript/issues/6110 for more info
        if (options) {
          Object.keys(options).forEach(key => module[key] = options[key]);
        }
        this._modules[desiredModuleName] = module;
      } else {
        debug && console.warn(moduleClass.name, 'could not be loaded, missing dependencies:', missingDependencies.map(d => d.name));
        failedModules.push(desiredModuleName);
      }
    });

    if (failedModules.length !== 0) {
      debug && console.warn(`${failedModules.length} modules failed to load, trying again:`, failedModules.map(key => modules[key].name));
      const newBatch = {};
      failedModules.forEach((key) => {
        newBatch[key] = modules[key];
      });
      this.initializeModules(newBatch);
    }
  }
  findModule(type) {
    return Object.keys(this._modules)
      .map(key => this._modules[key])
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
      events.forEach((event) => {
        if (this.error) {
          throw new Error(this.error);
        }
        this._timestamp = event.timestamp;

        // Triggering a lot of events here for development pleasure; does this have a significant performance impact?
        this.triggerEvent(event.type, event);
      });

      resolve(events.length);
    });
  }

  reorderEvents(events) {
    this.activeModules
      .sort((a, b) => a.priority - b.priority) // lowest should go first, as `priority = 0` will have highest prio
      .forEach((module) => {
        if (module.reorderEvents) {
          events = module.reorderEvents(events);
        }
      });
    return events;
  }

  triggerEvent(eventType, event, ...args) {
    this.activeModules
      .sort((a, b) => a.priority - b.priority) // lowest should go first, as `priority = 0` will have highest prio
      .forEach(module => module.triggerEvent(eventType, event, ...args));
  }

  byPlayer(event, playerId = this.player.id) {
    return (event.sourceID === playerId);
  }
  toPlayer(event, playerId = this.player.id) {
    return (event.targetID === playerId);
  }
  byPlayerPet(event) {
    return this.playerPets.some(pet => pet.id === event.sourceID);
  }
  toPlayerPet(event) {
    return this.playerPets.some(pet => pet.id === event.targetID);
  }

  // TODO: Damage taken from LOTM

  getPercentageOfTotalHealingDone(healingDone) {
    return healingDone / this._modules.healingDone.total.effective;
  }
  formatItemHealingDone(healingDone) {
    return `${formatPercentage(this.getPercentageOfTotalHealingDone(healingDone))} % / ${formatNumber(healingDone / this.fightDuration * 1000)} HPS`;
  }
  formatItemAbsorbDone(absorbDone) {
    return `${formatNumber(absorbDone)}`;
  }
  getPercentageOfTotalDamageDone(damageDone) {
    return damageDone / this._modules.damageDone.total.effective;
  }
  formatItemDamageDone(damageDone) {
    return `${formatPercentage(this.getPercentageOfTotalDamageDone(damageDone))} % / ${formatNumber(damageDone / this.fightDuration * 1000)} DPS`;
  }

  generateResults() {
    const results = new ParseResults();

    this.activeModules
      .sort((a, b) => b.priority - a.priority)
      .forEach((module) => {
        if (module.statistic) {
          const statistic = module.statistic();
          if (statistic) {
            results.statistics.push({
              statistic,
              order: module.statisticOrder,
            });
          }
        }
        if (module.item) {
          const item = module.item();
          if (item) {
            results.items.push(item);
          }
        }
        if (module.tab) {
          const tab = module.tab();
          if (tab) {
            results.tabs.push(tab);
          }
        }
        if (module.suggestions) {
          module.suggestions(results.suggestions.when);
        }
      });

    return results;
  }
}

export default CombatLogParser;
