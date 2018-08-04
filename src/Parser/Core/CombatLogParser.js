import React from 'react';

import { findByBossId } from 'Raids';
import { formatNumber, formatPercentage, formatThousands, formatDuration } from 'common/format';
import ItemIcon from 'common/ItemIcon';
import ItemLink from 'common/ItemLink';
import ChangelogTab from 'Interface/Others/ChangelogTab';
import ChangelogTabTitle from 'Interface/Others/ChangelogTabTitle';
import DeathRecapTracker from 'Interface/Others/DeathRecapTracker';
import ItemStatisticBox from 'Interface/Others/ItemStatisticBox';

import ApplyBuffNormalizer from './Normalizers/ApplyBuff';
import CancelledCastsNormalizer from './Normalizers/CancelledCasts';

import HealingDone from './Modules/HealingDone';
import DamageDone from './Modules/DamageDone';
import DamageTaken from './Modules/DamageTaken';
import DeathTracker from './Modules/DeathTracker';

import Combatants from './Modules/Combatants';
import AbilityTracker from './Modules/AbilityTracker';
import Haste from './Modules/Haste';
import StatTracker from './Modules/StatTracker';
import AlwaysBeCasting from './Modules/AlwaysBeCasting';
import Abilities from './Modules/Abilities';
import CastEfficiency from './Modules/CastEfficiency';
import SpellUsable from './Modules/SpellUsable';
import SpellHistory from './Modules/SpellHistory';
import GlobalCooldown from './Modules/GlobalCooldown';
import Enemies from './Modules/Enemies';
import EnemyInstances from './Modules/EnemyInstances';
import Pets from './Modules/Pets';
import ManaValues from './Modules/ManaValues';
import SpellManaCost from './Modules/SpellManaCost';
import Channeling from './Modules/Channeling';
import TimelineBuffEvents from './Modules/TimelineBuffEvents';
import DeathDowntime from './Modules/Downtime/DeathDowntime';
import TotalDowntime from './Modules/Downtime/TotalDowntime';

import DistanceMoved from './Modules/Others/DistanceMoved';

import CharacterPanel from './Modules/Features/CharacterPanel';
import StatsDisplay from './Modules/Features/StatsDisplay';
import TalentsDisplay from './Modules/Features/TalentsDisplay';

import EncounterPanel from './Modules/Features/EncounterPanel';

// Tabs
import TimelineTab from './Modules/Features/TimelineTab';
import ManaTab from './Modules/Features/ManaTab';
import RaidHealthTab from './Modules/Features/RaidHealthTab';

import CritEffectBonus from './Modules/Helpers/CritEffectBonus';

import PrePotion from './Modules/Items/PrePotion';
import LegendaryUpgradeChecker from './Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from './Modules/Items/LegendaryCountChecker';
import EnchantChecker from './Modules/Items/EnchantChecker';
import Healthstone from './Modules/Items/Healthstone';
import HealthPotion from './Modules/Items/HealthPotion';
import CombatPotion from './Modules/Items/CombatPotion';

import ArcaneTorrent from './Modules/Racials/BloodElf/ArcaneTorrent';

// Legendaries
import PrydazXavaricsMagnumOpus from './Modules/Items/Legion/Legendaries/PrydazXavaricsMagnumOpus';
import VelensFutureSight from './Modules/Items/Legion/Legendaries/VelensFutureSight';
import SephuzsSecret from './Modules/Items/Legion/Legendaries/SephuzsSecret';
import KiljaedensBurningWish from './Modules/Items/Legion/Legendaries/KiljaedensBurningWish';
import ArchimondesHatredReborn from './Modules/Items/Legion/Legendaries/ArchimondesHatredReborn';
import CinidariaTheSymbiote from './Modules/Items/Legion/Legendaries/CinidariaTheSymbiote';
import InsigniaOfTheGrandArmy from './Modules/Items/Legion/Legendaries/InsigniaOfTheGrandArmy';
import AmanthulsVision from './Modules/Items/Legion/Legendaries/AmanthulsVision';
// Dungeons/crafted
import DrapeOfShame from './Modules/Items/Legion/DrapeOfShame';
import DarkmoonDeckPromises from './Modules/Items/Legion/DarkmoonDeckPromises';
import DarkmoonDeckImmortality from './Modules/Items/Legion/DarkmoonDeckImmortality';
import AmalgamsSeventhSpine from './Modules/Items/Legion/AmalgamsSeventhSpine';
import GnawedThumbRing from './Modules/Items/Legion/GnawedThumbRing';
import EyeOfCommand from './Modules/Items/Legion/EyeOfCommand';
import MementoOfAngerboda from './Modules/Items/Legion/MementoOfAngerboda';

// The Nighthold (T19)
import ErraticMetronome from './Modules/Items/Legion/TheNighthold/ErraticMetronome';
// Tomb of Sargeras (T20)
import ArchiveOfFaith from './Modules/Items/Legion/TombOfSargeras/ArchiveOfFaith';
import TarnishedSentinelMedallion from './Modules/Items/Legion/TombOfSargeras/TarnishedSentinelMedallion';
import SeaStarOfTheDepthmother from './Modules/Items/Legion/TombOfSargeras/SeaStarOfTheDepthmother';
import DeceiversGrandDesign from './Modules/Items/Legion/TombOfSargeras/DeceiversGrandDesign';
import BarbaricMindslaver from './Modules/Items/Legion/TombOfSargeras/BarbaricMindslaver';
import CharmOfTheRisingTide from './Modules/Items/Legion/TombOfSargeras/CharmOfTheRisingTide';
import EngineOfEradication from './Modules/Items/Legion/TombOfSargeras/EngineOfEradication';
import InfernalCinders from './Modules/Items/Legion/TombOfSargeras/InfernalCinders';
import SpecterOfBetrayal from './Modules/Items/Legion/TombOfSargeras/SpecterOfBetrayal';
import SpectralThurible from './Modules/Items/Legion/TombOfSargeras/SpectralThurible';
import TerrorFromBelow from './Modules/Items/Legion/TombOfSargeras/TerrorFromBelow';
import TomeOfUnravelingSanity from './Modules/Items/Legion/TombOfSargeras/TomeOfUnravelingSanity';
import UmbralMoonglaives from './Modules/Items/Legion/TombOfSargeras/UmbralMoonglaives';
import VialOfCeaselessToxins from './Modules/Items/Legion/TombOfSargeras/VialOfCeaselessToxins';
// Antorus, the Burning Throne (T21)
// Healing
import TarratusKeystone from './Modules/Items/Legion/AntorusTheBurningThrone/TarratusKeystone';
import HighFathersMachination from './Modules/Items/Legion/AntorusTheBurningThrone/HighfathersMachination';
import EonarsCompassion from './Modules/Items/Legion/AntorusTheBurningThrone/EonarsCompassion';
import GarothiFeedbackConduit from './Modules/Items/Legion/AntorusTheBurningThrone/GarothiFeedbackConduit';
import CarafeOfSearingLight from './Modules/Items/Legion/AntorusTheBurningThrone/CarafeOfSearingLight';
import IshkarsFelshieldEmitter from './Modules/Items/Legion/AntorusTheBurningThrone/IshkarsFelshieldEmitter';
// DPS
import SeepingScourgewing from './Modules/Items/Legion/AntorusTheBurningThrone/SeepingScourgewing';
import GorshalachsLegacy from './Modules/Items/Legion/AntorusTheBurningThrone/GorshalachsLegacy';
import GolgannethsVitality from './Modules/Items/Legion/AntorusTheBurningThrone/GolgannethsVitality';
import ForgefiendsFabricator from './Modules/Items/Legion/AntorusTheBurningThrone/ForgefiendsFabricator';
import KhazgorothsCourage from './Modules/Items/Legion/AntorusTheBurningThrone/KhazgorothsCourage';
import TerminusSignalingBeacon from './Modules/Items/Legion/AntorusTheBurningThrone/TerminusSignalingBeacon';
import PrototypePersonnelDecimator from './Modules/Items/Legion/AntorusTheBurningThrone/PrototypePersonnelDecimator';
import SheathOfAsara from './Modules/Items/Legion/AntorusTheBurningThrone/SheathOfAsara';
import NorgannonsProwess from './Modules/Items/Legion/AntorusTheBurningThrone/NorgannonsProwess';
import AcridCatalystInjector from './Modules/Items/Legion/AntorusTheBurningThrone/AcridCatalystInjector';
import ShadowSingedFang from './Modules/Items/Legion/AntorusTheBurningThrone/ShadowSingedFang';
// Tanking
import AggramarsConviction from './Modules/Items/Legion/AntorusTheBurningThrone/AggramarsConviction';
import SmolderingTitanguard from './Modules/Items/Legion/AntorusTheBurningThrone/SmolderingTitanguard';
import DiimasGlacialAegis from './Modules/Items/Legion/AntorusTheBurningThrone/DiimasGlacialAegis';
import RiftworldCodex from './Modules/Items/Legion/AntorusTheBurningThrone/RiftworldCodex';
import EyeOfHounds from './Modules/Items/Legion/AntorusTheBurningThrone/EyeOfHounds';

// Shared Buffs
import VantusRune from './Modules/Spells/VantusRune';

// BFA
import GildedLoaFigurine from './Modules/Items/BFA/GildedLoaFigurine';
import FirstMatesSpyglass from './Modules/Items/BFA/FirstMatesSpyglass';
// Dungeons
import RevitalizingVoodooTotem from './Modules/Items/BFA/Dungeons/RevitalizingVoodooTotem';
import LingeringSporepods from './Modules/Items/BFA/Dungeons/LingeringSporepods';
import FangsOfIntertwinedEssence from './Modules/Items/BFA/Dungeons/FangsOfIntertwinedEssence';
import BalefireBranch from './Modules/Items/BFA/Dungeons/BalefireBranch';
import ConchofDarkWhispers from './Modules/Items/BFA/Dungeons/ConchofDarkWhispers';
// Crafted
import DarkmoonDeckTides from './Modules/Items/BFA/Crafted/DarkmoonDeckTides';
// Azerite Traits
import Gemhide from './Modules/Spells/BFA/AzeriteTraits/Gemhide';
// Uldir
import TwitchingTentacleofXalzaix from './Modules/Items/BFA/Raids/Uldir/TwitchingTentacleofXalzaix';
import VigilantsBloodshaper from './Modules/Items/BFA/Raids/Uldir/VigilantsBloodshaper';
import InoculatingExtract from './Modules/Items/BFA/Raids/Uldir/InoculatingExtract';
import FreneticCorpuscle from './Modules/Items/BFA/Raids/Uldir/FreneticCorpuscle';
import ConstructOvercharger from './Modules/Items/BFA/Raids/Uldir/ConstructOvercharger';

import ParseResults from './ParseResults';
import Analyzer from './Analyzer';
import EventsNormalizer from './EventsNormalizer';

// This prints to console anything that the DI has to do
const debugDependencyInjection = false;

class CombatLogParser {
  static abilitiesAffectedByHealingIncreases = [];

  static internalModules = {
    combatants: Combatants,
    deathDowntime: DeathDowntime,
    totalDowntime: TotalDowntime,
  };
  static defaultModules = {
    // Normalizers
    applyBuffNormalizer: ApplyBuffNormalizer,
    cancelledCastsNormalizer: CancelledCastsNormalizer,

    // Analyzers
    healingDone: HealingDone,
    damageDone: DamageDone,
    damageTaken: DamageTaken,
    deathTracker: DeathTracker,

    enemies: Enemies,
    enemyInstances: EnemyInstances,
    pets: Pets,
    spellManaCost: SpellManaCost,
    channeling: Channeling,
    abilityTracker: AbilityTracker,
    haste: Haste,
    statTracker: StatTracker,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    CastEfficiency: CastEfficiency,
    spellUsable: SpellUsable,
    spellHistory: SpellHistory,
    globalCooldown: GlobalCooldown,
    manaValues: ManaValues,
    vantusRune: VantusRune,
    distanceMoved: DistanceMoved,
    timelineBuffEvents: TimelineBuffEvents,
    deathRecapTracker: DeathRecapTracker,

    critEffectBonus: CritEffectBonus,

    characterPanel: CharacterPanel,
    statsDisplay: StatsDisplay,
    talentsDisplay: TalentsDisplay,

    encounterPanel: EncounterPanel,
    // Tabs
    timelineTab: TimelineTab,
    manaTab: ManaTab,
    raidHealthTab: RaidHealthTab,

    prePotion: PrePotion,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    enchantChecker: EnchantChecker,
    healthstone: Healthstone,
    healthPotion: HealthPotion,
    combatPotion: CombatPotion,

    // Racials
    arcaneTorrent: ArcaneTorrent,

    // Items:
    // Legendaries:
    prydazXavaricsMagnumOpus: PrydazXavaricsMagnumOpus,
    velensFutureSight: VelensFutureSight,
    sephuzsSecret: SephuzsSecret,
    kiljaedensBurningWish: KiljaedensBurningWish,
    archimondesHatredReborn: ArchimondesHatredReborn,
    cinidariaTheSymbiote: CinidariaTheSymbiote,
    insigniaOfTheGrandArmy: InsigniaOfTheGrandArmy,
    amanthulsVision: AmanthulsVision,
    // Epics:
    drapeOfShame: DrapeOfShame,
    amalgamsSeventhSpine: AmalgamsSeventhSpine,
    darkmoonDeckPromises: DarkmoonDeckPromises,
    darkmoonDeckImmortality: DarkmoonDeckImmortality,
    gnawedThumbRing: GnawedThumbRing,
    ishkarsFelshieldEmitter: IshkarsFelshieldEmitter,
    erraticMetronome: ErraticMetronome,
    eyeOfCommand: EyeOfCommand,
    mementoOfAngerboda: MementoOfAngerboda,
    // Tomb trinkets:
    archiveOfFaith: ArchiveOfFaith,
    barbaricMindslaver: BarbaricMindslaver,
    charmOfTheRisingTide: CharmOfTheRisingTide,
    seaStarOfTheDepthmother: SeaStarOfTheDepthmother,
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
    khazgorothsCourage: KhazgorothsCourage,
    terminusSignalingBeacon: TerminusSignalingBeacon,
    prototypePersonnelDecimator: PrototypePersonnelDecimator,
    sheathOfAsara: SheathOfAsara,
    norgannonsProwess: NorgannonsProwess,
    acridCatalystInjector: AcridCatalystInjector,
    shadowSingedFang: ShadowSingedFang,

    // T21 Tanking Trinkets
    aggramarsConviction: AggramarsConviction,
    smolderingTitanguard: SmolderingTitanguard,
    diimasGlacialAegis: DiimasGlacialAegis,
    riftworldCodex: RiftworldCodex,
    eyeOfHounds: EyeOfHounds,

    infernalCinders: InfernalCinders,
    umbralMoonglaives: UmbralMoonglaives,

    // BFA
    gildedLoaFigurine: GildedLoaFigurine,
    firstMatesSpyglass: FirstMatesSpyglass,
    revitalizingVoodooTotem: RevitalizingVoodooTotem,
    // Dungeons
    lingeringSporepods: LingeringSporepods,
    fangsOfIntertwinedEssence: FangsOfIntertwinedEssence,
    balefireBranch: BalefireBranch,
    conchofDarkWhispers: ConchofDarkWhispers,
    // Crafted
    darkmoonDeckTides: DarkmoonDeckTides,
    // Azerite Traits
    gemhide: Gemhide,
    // Uldir
    twitchingTentacleofXalzaix: TwitchingTentacleofXalzaix,
    vigilantsBloodshaper: VigilantsBloodshaper,
    inoculatingExtract: InoculatingExtract,
    freneticCorpuscle: FreneticCorpuscle,
    constructOvercharger: ConstructOvercharger,
  };
  // Override this with spec specific modules when extending
  static specModules = {};

  report = null;
  // Player info from WCL - required
  player = null;
  playerPets = null;
  fight = null;
  combatantInfoEvents = null;
  // Character info from the Battle.net API (optional)
  characterProfile = null;

  adjustForDowntime = true;
  get hasDowntime() {
    return this._modules.totalDowntime.totalBaseDowntime > 0;
  }

  _modules = {};
  _activeAnalyzers = {};
  get activeModules() {
    return Object.keys(this._modules)
      .map(key => this._modules[key])
      .filter(module => module.active);
  }

  get playerId() {
    return this.player.id;
  }
  get fightId() {
    return this.fight.id;
  }

  _timestamp = null;
  _event = null;
  get currentTimestamp() {
    return this.finished ? this.fight.end_time : this._timestamp;
  }
  get fightDuration() {
    return this.currentTimestamp - this.fight.start_time - (this.adjustForDowntime ? this._modules.totalDowntime.totalBaseDowntime : 0);
  }
  finished = false;

  get playersById() {
    return this.report.friendlies.reduce((obj, player) => {
      obj[player.id] = player;
      return obj;
    }, {});
  }
  get selectedCombatant() {
    return this._modules.combatants.selected;
  }

  constructor(report, selectedPlayer, selectedFight, combatantInfoEvents, characterProfile) {
    this.report = report;
    this.player = selectedPlayer;
    this.playerPets = report.friendlyPets.filter(pet => pet.petOwner === selectedPlayer.id);
    this.fight = selectedFight;
    this.combatantInfoEvents = combatantInfoEvents;
    this.characterProfile = characterProfile;
    this._timestamp = selectedFight.start_time;
    this.boss = findByBossId(selectedFight.boss);

    this.initializeModules({
      ...this.constructor.internalModules,
      ...this.constructor.defaultModules,
      ...this.constructor.specModules,
    });
  }
  finish() {
    this.finished = true;
    this.fabricateEvent({
      type: 'finished',
    });
  }

  // TODO: Refactor and test, this dependency injection thing works really well but it's hard to understand or change.
  initializeModules(modules, iteration = 0) {
    const failedModules = [];
    Object.keys(modules).forEach(desiredModuleName => {
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

      // region Resolve dependencies
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
      // endregion

      if (missingDependencies.length === 0) {
        if (debugDependencyInjection) {
          if (Object.keys(availableDependencies).length === 0) {
            console.log('Loading', moduleClass.name);
          } else {
            console.log('Loading', moduleClass.name, 'with dependencies:', Object.keys(availableDependencies));
          }
        }
        const priority = Object.keys(this._modules).length;
        // region Load Module
        // eslint-disable-next-line new-cap
        const module = new moduleClass(this, availableDependencies, priority);
        if (options) {
          // We can't set the options via the constructor since a parent constructor can't override the values of a child's class properties.
          // See https://github.com/Microsoft/TypeScript/issues/6110 for more info
          Object.keys(options).forEach(key => {
            module[key] = options[key];
          });
        }
        this._modules[desiredModuleName] = module;
        // endregion
      } else {
        debugDependencyInjection && console.warn(moduleClass.name, 'could not be loaded, missing dependencies:', missingDependencies.map(d => d.name));
        failedModules.push(desiredModuleName);
      }
    });

    if (failedModules.length !== 0) {
      debugDependencyInjection && console.warn(`${failedModules.length} modules failed to load, trying again:`, failedModules.map(key => modules[key].name));
      const newBatch = {};
      failedModules.forEach(key => {
        newBatch[key] = modules[key];
      });
      if (iteration > 100) {
        // Sometimes modules can't be imported at all because they depend on modules not enabled or have a circular dependency. Stop trying after a while.
        throw new Error(`Failed to load modules: ${Object.keys(newBatch).join(', ')}`);
      }
      this.initializeModules(newBatch, iteration + 1);
    } else {
      this.allModulesInitialized();
    }
  }
  allModulesInitialized() {
    this._activeAnalyzers = Object.values(this._modules)
      .filter(module => module instanceof Analyzer)
      .sort((a, b) => a.priority - b.priority); // lowest should go first, as `priority = 0` will have highest prio
  }
  findModule(type) {
    return Object.keys(this._modules)
      .map(key => this._modules[key])
      .find(module => module instanceof type);
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

  /** @type {number} The amount of events parsed. This can reliably be used to determine if something should re-render. */
  eventCount = 0;
  eventHistory = [];
  _eventListeners = {};
  addEventListener(type, listener, options = null) {
    // Wrap the listener in filters to exclude events that do not match the desired options. We compile a handler using the options so checking the options is only done once. If this turns out to prevent something from being implemented, don't worry about it as it has no (noticable) performance impact.
    let handler = listener;
    if (options.byPlayer) {
      const oldHandler = handler;
      handler = event => {
        if (this.byPlayer(event)) {
          oldHandler(event);
        }
      };
    }
    if (options.toPlayer) {
      const oldHandler = handler;
      handler = event => {
        if (this.toPlayer(event)) {
          oldHandler(event);
        }
      };
    }
    if (options.byPlayerPet) {
      const oldHandler = handler;
      handler = event => {
        if (this.byPlayerPet(event)) {
          oldHandler(event);
        }
      };
    }
    if (options.toPlayerPet) {
      const oldHandler = handler;
      handler = event => {
        if (this.toPlayerPet(event)) {
          oldHandler(event);
        }
      };
    }

    const existingEventListener = this._eventListeners[type];
    this._eventListeners[type] = existingEventListener ? function (...args) {
      existingEventListener(...args);
      handler(...args);
    } : handler;
  }
  triggerEvent(event) {
    if (process.env.NODE_ENV === 'development') {
      if (!event.type) {
        console.log(event);
        throw new Error('Events should have a type. No type received. See the console for the event.');
      }
    }

    // When benchmarking the event triggering make sure to disable the event batching and turn the listener into a dummy so you get the performance of just this piece of code. At the time of writing the event triggering code only takes about 12ms for a full log.

    this._timestamp = event.timestamp;
    this._event = event;

    {
      // Handle on_event (listeners of all events)
      const listener = this._eventListeners.event;
      if (listener) {
        listener(event);
      }
    }
    {
      const listener = this._eventListeners[event.type];
      if (listener) {
        listener(event);
      }
    }

    this.eventHistory.push(event);
    // Some modules need to have a primitive value to cause re-renders
    // TODO: This can probably be removed since we only render upon completion now
    this.eventCount += 1;
  }
  fabricateEvent(event = null, trigger = null) {
    this.triggerEvent({
      // When no timestamp is provided in the event (you should always try to), the current timestamp will be used by default.
      timestamp: this.currentTimestamp,
      // If this event was triggered you should pass it along
      trigger: trigger ? trigger : undefined,
      ...event,
      __fabricated: true,
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
  formatTimestamp(timestamp, precision = 0) {
    return formatDuration((timestamp - this.fight.start_time) / 1000, precision);
  }

  generateResults({ i18n, adjustForDowntime }) {
    this.adjustForDowntime = adjustForDowntime;

    const results = new ParseResults();

    results.tabs = [];
    results.tabs.push({
      title: <ChangelogTabTitle />,
      url: 'changelog',
      order: 1000,
      render: () => <ChangelogTab />,
    });

    Object.keys(this._modules)
      .filter(key => this._modules[key].active)
      .sort((a, b) => this._modules[b].priority - this._modules[a].priority)
      .forEach((key, index) => {
        const module = this._modules[key];

        if (module.statistic) {
          const statistic = module.statistic({ i18n });
          if (statistic) {
            let position = index;
            if (statistic.props.position !== undefined) {
              position = statistic.props.position;
            } else if (module.statisticOrder !== undefined) {
              position = module.statisticOrder;
              console.warn('DEPRECATED', 'Setting the position of a statistic via a module\'s `statisticOrder` prop is deprecated. Set the `position` prop on the `StatisticBox` instead. Example commit: https://github.com/WoWAnalyzer/WoWAnalyzer/commit/ece1bbeca0d3721ede078d256a30576faacb803d');
            }

            results.statistics.push(
              React.cloneElement(statistic, {
                key: `${key}-statistic`,
                position,
              })
            );
          }
        }
        if (module.item) {
          const item = module.item({ i18n });
          if (item) {
            if (React.isValidElement(item)) {
              results.statistics.push(React.cloneElement(item, {
                key: `${key}-item`,
                position: index,
              }));
            } else {
              const id = item.id || item.item.id;
              const itemDetails = id && this.selectedCombatant.getItem(id);
              const icon = item.icon || <ItemIcon id={item.item.id} details={itemDetails} />;
              const title = item.title || <ItemLink id={item.item.id} details={itemDetails} icon={false} />;

              results.statistics.push(
                <ItemStatisticBox
                  key={`${key}-item`}
                  position={index}
                  icon={icon}
                  label={title}
                  value={item.result}
                />
              );
            }
          }
        }
        if (module.tab) {
          const tab = module.tab({ i18n });
          if (tab) {
            results.tabs.push(tab);
          }
        }
        if (module.suggestions) {
          module.suggestions(results.suggestions.when, { i18n });
        }
      });

    return results;
  }
}

export default CombatLogParser;
