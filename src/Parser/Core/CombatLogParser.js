import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import ChangelogTab from 'Main/ChangelogTab';
import ChangelogTabTitle from 'Main/ChangelogTabTitle';
import Tab from 'Main/Tab';
import TimelineTab from 'Main/Timeline/TimelineTab';

import { formatNumber, formatPercentage, formatThousands, formatDuration } from 'common/format';

import ApplyBuffNormalizer from './Normalizers/ApplyBuff';

import Status from './Modules/Status';
import HealingDone from './Modules/HealingDone';
import DamageDone from './Modules/DamageDone';
import DamageTaken from './Modules/DamageTaken';

import Combatants from './Modules/Combatants';
import AbilityTracker from './Modules/AbilityTracker';
import Haste from './Modules/Haste';
import StatTracker from './Modules/StatTracker';
import AlwaysBeCasting from './Modules/AlwaysBeCasting';
import Abilities from './Modules/Abilities';
import CastEfficiency from './Modules/CastEfficiency';
import SpellUsable from './Modules/SpellUsable';
import SpellHistory from './Modules/SpellHistory';
import Enemies from './Modules/Enemies';
import EnemyInstances from './Modules/EnemyInstances';
import Pets from './Modules/Pets';
import HealEventTracker from './Modules/HealEventTracker';
import ManaValues from './Modules/ManaValues';
import SpellManaCost from './Modules/SpellManaCost';

import DistanceMoved from './Modules/Others/DistanceMoved';

import StatsDisplay from './Modules/Features/StatsDisplay';
import TalentsDisplay from './Modules/Features/TalentsDisplay';
import Checklist from './Modules/Features/Checklist';

import CritEffectBonus from './Modules/Helpers/CritEffectBonus';

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
import CharmOfTheRisingTide from './Modules/Items/CharmOfTheRisingTide';
import SeaStar from './Modules/Items/SeaStarOfTheDepthmother';
import DeceiversGrandDesign from './Modules/Items/DeceiversGrandDesign';
import PrePotion from './Modules/Items/PrePotion';
import LegendaryUpgradeChecker from './Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from './Modules/Items/LegendaryCountChecker';
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
// T21 Healing trinkets
import TarratusKeystone from './Modules/Items/TarratusKeystone';
import HighFathersMachination from './Modules/Items/HighfathersMachination';
import EonarsCompassion from './Modules/Items/EonarsCompassion';
import GarothiFeedbackConduit from './Modules/Items/GarothiFeedbackConduit';
import CarafeOfSearingLight from './Modules/Items/CarafeOfSearingLight';
import IshkarsFelshieldEmitter from './Modules/Items/IshkarsFelshieldEmitter';

// T21 Dps Trinkets
import SeepingScourgewing from './Modules/Items/SeepingScourgewing';
import GorshalachsLegacy from './Modules/Items/GorshalachsLegacy';
import GolgannethsVitality from './Modules/Items/GolgannethsVitality';
import ForgefiendsFabricator from './Modules/Items/ForgefiendsFabricator';
import TerminusSignalingBeacon from './Modules/Items/TerminusSignalingBeacon';
import PrototypePersonnelDecimator from './Modules/Items/PrototypePersonnelDecimator';

// Shared Buffs
import Concordance from './Modules/Spells/Concordance';
import VantusRune from './Modules/Spells/VantusRune';
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
import Analyzer from './Analyzer';
import EventsNormalizer from './EventsNormalizer';

const debug = false;
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

let _modulesDeprecatedWarningSent = false;

class CombatLogParser {
  static abilitiesAffectedByHealingIncreases = [];

  static defaultModules = {
    // Normalizers
    applyBuffNormalizer: ApplyBuffNormalizer,

    // Analyzers
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
    statTracker: StatTracker,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    CastEfficiency: CastEfficiency,
    spellUsable: SpellUsable,
    spellHistory: SpellHistory,
    manaValues: ManaValues,
    vantusRune: VantusRune,
    distanceMoved: DistanceMoved,

    critEffectBonus: CritEffectBonus,

    statsDisplay: StatsDisplay,
    talentsDisplay: TalentsDisplay,
    checklist: Checklist,

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
    legendaryCountChecker: LegendaryCountChecker,
    gnawedThumbRing: GnawedThumbRing,
    ishkarsFelshieldEmitter: IshkarsFelshieldEmitter,
    // Tomb trinkets:
    archiveOfFaith: ArchiveOfFaith,
    barbaricMindslaver: BarbaricMindslaver,
    charmOfTheRisingTide: CharmOfTheRisingTide,
    seaStar: SeaStar,
    deceiversGrandDesign: DeceiversGrandDesign,
    vialCeaslessToxins: VialOfCeaselessToxins,
    specterOfBetrayal: SpecterOfBetrayal,
    engineOfEradication: EngineOfEradication,
    tarnishedSentinelMedallion: TarnishedSentinelMedallion,
    spectralThurible: SpectralThurible,
    terrorFromBelow: TerrorFromBelow,
    tomeOfUnravelingSanity: TomeOfUnravelingSanity,
    // T21 Healing Trinkets
    tarratusKeystone: TarratusKeystone,
    highfathersMachinations: HighFathersMachination,
    eonarsCompassion: EonarsCompassion,
    garothiFeedbackConduit: GarothiFeedbackConduit,
    carafeOfSearingLight: CarafeOfSearingLight,

    // T21 DPS Trinkets
    seepingScourgewing: SeepingScourgewing,
    gorshalachsLegacy: GorshalachsLegacy,
    golgannethsVitality: GolgannethsVitality,
    forgefiendsFabricator: ForgefiendsFabricator,
    terminusSignalingBeacon: TerminusSignalingBeacon,
    prototypePersonnelDecimator: PrototypePersonnelDecimator,

    // Concordance of the Legionfall
    concordance: Concordance,
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
    if (!_modulesDeprecatedWarningSent) {
      console.error('Using `this.owner.modules` is deprecated. You should add the module you want to use as a dependency and use the property that\'s added to your module instead.');
      _modulesDeprecatedWarningSent = true;
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
  initialize(combatants) {
    this.initializeNormalizers(combatants);
    this.initializeAnalyzers(combatants);
  }
  initializeAnalyzers(combatants) {
    this.parseEvents(combatants);
    this.triggerEvent('initialized');
  }
  parseEvents(events) {
    if (process.env.NODE_ENV === 'development') {
      this._debugEventHistory = [
        ...this._debugEventHistory,
        ...events,
      ];
    }
    events.forEach((event) => {
      if (this.error) {
        throw new Error(this.error);
      }
      this._timestamp = event.timestamp;

      // Triggering a lot of events here for development pleasure; does this have a significant performance impact?
      this.triggerEvent(event.type, event);
    });
  }

  initializeNormalizers(combatants) {
    this.activeModules
      .filter(module => module instanceof EventsNormalizer)
      .sort((a, b) => a.priority - b.priority) // lowest should go first, as `priority = 0` will have highest prio
      .forEach(module => {
        if (module.initialize) {
          module.initialize(combatants);
        }
      });
  }
  normalize(events) {
    this.activeModules
      .filter(module => module instanceof EventsNormalizer)
      .sort((a, b) => a.priority - b.priority) // lowest should go first, as `priority = 0` will have highest prio
      .forEach(module => {
        if (module.normalize) {
          events = module.normalize(events);
        }
      });
    return events;
  }

  _moduleTime = {};
  triggerEvent(eventType, event, ...args) {
    Object.keys(this._modules)
      .filter(key => this._modules[key].active)
      .filter(key => this._modules[key] instanceof Analyzer)
      .sort((a, b) => this._modules[a].priority - this._modules[b].priority) // lowest should go first, as `priority = 0` will have highest prio
      .forEach(key => {
        const module = this._modules[key];
        if (IS_DEVELOPMENT) {
          const start = +new Date();
          module.triggerEvent(eventType, event, ...args);
          const duration = +new Date() - start;
          this._moduleTime[key] = this._moduleTime[key] || 0;
          this._moduleTime[key] += duration;
        } else {
          module.triggerEvent(eventType, event, ...args);
        }
      });
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
  formatManaRestored(manaRestored) {
    return `${formatThousands(manaRestored)} mana / ${formatThousands(manaRestored / this.fightDuration * 1000 * 5)} MP5`;
  }
  formatTimestamp(timestamp) {
    return formatDuration((timestamp - this.fight.start_time) / 1000);
  }

  generateResults() {
    const results = new ParseResults();

    results.tabs = [
      {
        title: 'Suggestions',
        url: 'suggestions',
        order: 0,
        render: () => <SuggestionsTab issues={results.issues} />,
      },
      {
        title: 'Timeline',
        url: 'timeline',
        order: 2,
        render: () => (
          <Tab title="Timeline">
            <TimelineTab
              start={this.fight.start_time}
              end={this.currentTimestamp}
              historyBySpellId={this.modules.spellHistory.historyBySpellId}
              abilities={this.modules.abilities}
            />
          </Tab>
        ),
      },
      {
        title: <ChangelogTabTitle />,
        url: 'changelog',
        order: 1000,
        render: () => <ChangelogTab />,
      },
    ];

    Object.keys(this._modules)
      .filter(key => this._modules[key].active)
      .sort((a, b) => this._modules[b].priority - this._modules[a].priority)
      .forEach(key => {
        const module = this._modules[key];

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
        if (module.extraPanel) {
          const extraPanel = module.extraPanel();
          if (extraPanel) {
            results.extraPanels.push({
              name: key,
              order: module.extraPanelOrder,
              content: extraPanel,
            });
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
