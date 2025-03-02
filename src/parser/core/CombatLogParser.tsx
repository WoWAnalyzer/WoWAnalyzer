import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import { Boss, findByBossId } from 'game/raids';
import Guide, { GuideContainer, GuideContext, ModulesOf } from 'interface/guide';
import CharacterProfile from 'parser/core/CharacterProfile';
import {
  AnyEvent,
  CombatantInfoEvent,
  Event,
  EventType,
  HasSource,
  HasTarget,
} from 'parser/core/Events';
import ModuleError from 'parser/core/ModuleError';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import PotionChecker from 'parser/retail/modules/items/PotionChecker';
import WeaponEnhancementChecker from 'parser/retail/modules/items/WeaponEnhancementChecker';
import DeathRecapTracker from 'parser/shared/modules/DeathRecapTracker';
import EnemiesHealth from 'parser/shared/modules/EnemiesHealth';
import Haste from 'parser/shared/modules/Haste';
import ManaValues from 'parser/shared/modules/ManaValues';
import StatTracker from 'parser/shared/modules/StatTracker';
import * as React from 'react';
import { ExplanationContextProvider } from 'interface/guide/components/Explanation';

import Config from '../Config';
import AugmentRuneChecker from '../retail/modules/items/AugmentRuneChecker';
import CombatPotion from '../retail/modules/items/CombatPotion';
import EnchantChecker from '../retail/modules/items/EnchantChecker';
import FlaskChecker from '../retail/modules/items/FlaskChecker';
import FoodChecker from '../retail/modules/items/FoodChecker';
import HealthPotion from '../retail/modules/items/HealthPotion';
import Healthstone from '../retail/modules/items/Healthstone';
import SpellTimeWaitingOnGlobalCooldown from '../shared/enhancers/SpellTimeWaitingOnGlobalCooldown';
import AbilityTracker from '../shared/modules/AbilityTracker';
import AlwaysBeCasting from '../shared/modules/AlwaysBeCasting';
import CastEfficiency from '../shared/modules/CastEfficiency';
import Combatants from '../shared/modules/Combatants';
import CooldownHistory from '../shared/modules/CooldownHistory';
import DeathTracker from '../shared/modules/DeathTracker';
import DispelTracker from '../shared/modules/DispelTracker';
import DistanceMoved from '../shared/modules/DistanceMoved';
import DeathDowntime from '../shared/modules/downtime/DeathDowntime';
import TotalDowntime from '../shared/modules/downtime/TotalDowntime';
import Enemies from '../shared/modules/Enemies';
import EventHistory from '../shared/modules/EventHistory';
import RaidHealthTab from '../shared/modules/features/RaidHealthTab';
import FilteredActiveTime from '../shared/modules/FilteredActiveTime';
import GlobalCooldown from '../shared/modules/GlobalCooldown';
import CritEffectBonus from '../shared/modules/helpers/CritEffectBonus';
import OtherRacials from '../shared/modules/racials/OtherRacials';
import Pets from '../shared/modules/Pets';
import ArcaneTorrent from '../shared/modules/racials/bloodelf/ArcaneTorrent';
import GiftOfTheNaaru from '../shared/modules/racials/draenei/GiftOfTheNaaru';
import Stoneform from '../shared/modules/racials/dwarf/Stoneform';
import BloodFury from '../shared/modules/racials/orc/BloodFury';
import Berserking from '../shared/modules/racials/troll/Berserking';
import SpellHistory from '../shared/modules/SpellHistory';
import SpellManaCost from '../shared/modules/SpellManaCost';
import VantusRune from '../shared/modules/spells/VantusRune';
import SpellUsable from '../shared/modules/SpellUsable';
import DamageDone from '../shared/modules/throughput/DamageDone';
import DamageTaken from '../shared/modules/throughput/DamageTaken';
import HealingDone from '../shared/modules/throughput/HealingDone';
import ThroughputStatisticGroup from '../shared/modules/throughput/ThroughputStatisticGroup';
import ApplyBuffNormalizer from '../shared/normalizers/ApplyBuff';
import CancelledCastsNormalizer from '../shared/normalizers/CancelledCasts';
import Channeling from '../shared/normalizers/Channeling';
import FightEndNormalizer from '../shared/normalizers/FightEnd';
import MissingCastsNormalizer from '../shared/normalizers/MissingCasts';
import PhaseChangesNormalizer from '../shared/normalizers/PhaseChanges';
import PrePullCooldownsNormalizer from '../shared/normalizers/PrePullCooldowns';
import Analyzer from './Analyzer';
import Combatant from './Combatant';
import EventFilter from './EventFilter';
import EventsNormalizer from './EventsNormalizer';
import { EventListener } from './EventSubscriber';
import Fight from './Fight';
import { Info } from './metric';
import Module, { Options } from './Module';
import DebugAnnotations from './modules/DebugAnnotations';
import Abilities from './modules/Abilities';
import Auras from './modules/Auras';
import EventEmitter from './modules/EventEmitter';
import SpellInfo from './modules/SpellInfo';
import ParseResults from './ParseResults';
import { PetInfo } from './Pet';
import { PlayerInfo } from './Player';
import Report from './Report';
import { SpellUsageContextProvider } from 'parser/core/SpellUsage/core';
import BurningDevotion from 'parser/retail/modules/items/dragonflight/enchants/BurningDevotion';
import BurningWrit from 'parser/retail/modules/items/dragonflight/enchants/BurningWrit';
import EarthenDevotion from 'parser/retail/modules/items/dragonflight/enchants/EarthenDevotion';
import EarthenWrit from 'parser/retail/modules/items/dragonflight/enchants/EarthenWrit';
import FrozenDevotion from 'parser/retail/modules/items/dragonflight/enchants/FrozenDevotion';
import FrozenWrit from 'parser/retail/modules/items/dragonflight/enchants/FrozenWrit';
import InvigoratingSporeCloud from 'parser/retail/modules/items/dragonflight/enchants/InvigoratingSporeCloud';
import ShadowflameWreathe from 'parser/retail/modules/items/dragonflight/enchants/ShadowflameWreathe';
import SophicDevotion from 'parser/retail/modules/items/dragonflight/enchants/SophicDevotion';
import SophicWrit from 'parser/retail/modules/items/dragonflight/enchants/SophicWrit';
import SporeTender from 'parser/retail/modules/items/dragonflight/enchants/SporeTender';
import WaftingDevotion from 'parser/retail/modules/items/dragonflight/enchants/WaftingDevotion';
import WaftingWrit from 'parser/retail/modules/items/dragonflight/enchants/WaftingWrit';
import SignetOfThePriory from 'parser/retail/modules/items/thewarwithin/trinkets/SignetOfThePriory';
import SpymastersWeb from 'parser/retail/modules/items/thewarwithin/trinkets/SpymastersWeb';
import FriendlyCompatNormalizer from './FriendlyCompatNormalizer';
import {
  AuthorityOfRadiantPower,
  AuthorityOfStorms,
  AuthorityOfTheDepths,
  DarkmoonSigilAscension,
  StormridersFury,
} from 'parser/retail/modules/items/thewarwithin';
import CritRacial from 'parser/shared/modules/racials/CritRacial';
import TreacherousTransmitter from 'parser/retail/modules/items/thewarwithin/trinkets/TreacherousTransmitter';
import MadQueensMandate from 'parser/retail/modules/items/thewarwithin/trinkets/MadQueensMandate';
import SkardynsGrace from 'parser/retail/modules/items/thewarwithin/trinkets/SkardynsGrace';
import MereldarsToll from 'parser/retail/modules/items/thewarwithin/trinkets/MereldarsToll';
import CirralConcoctory from 'parser/retail/modules/items/thewarwithin/trinkets/CirralConcotory';
import { MeleeUptimeAnalyzer } from 'interface/guide/foundation/analyzers/MeleeUptimeAnalyzer';
import DowntimeDebuffAnalyzer from 'interface/guide/foundation/analyzers/DowntimeDebuffAnalyzer';
// This prints to console anything that the DI has to do
const debugDependencyInjection = false;
const MAX_DI_ITERATIONS = 100;
const isMinified = import.meta.env.PROD;

type DependencyDefinition = typeof Module | readonly [typeof Module, { [option: string]: any }];
export type DependenciesDefinition = { [desiredName: string]: DependencyDefinition };

export enum SuggestionImportance {
  Major = 'major',
  Regular = 'regular',
  Minor = 'minor',
}
export interface Suggestion {
  text: React.ReactNode;
  importance: SuggestionImportance;
  icon?: string;
  spell?: number;
  actual?: React.ReactNode;
  recommended?: React.ReactNode;
}

class CombatLogParser {
  static internalModules: DependenciesDefinition = {
    fightEndNormalizer: FightEndNormalizer,
    eventEmitter: EventEmitter,
    combatants: Combatants,
    deathDowntime: DeathDowntime,
    totalDowntime: TotalDowntime,
    spellInfo: SpellInfo,
    enemies: Enemies,
    friendlyCompat: FriendlyCompatNormalizer,
    debugAnnotations: DebugAnnotations,
  };
  static defaultModules: DependenciesDefinition = {
    // Normalizers
    applyBuffNormalizer: ApplyBuffNormalizer,
    cancelledCastsNormalizer: CancelledCastsNormalizer,
    prepullNormalizer: PrePullCooldownsNormalizer,
    phaseChangesNormalizer: PhaseChangesNormalizer,
    missingCastsNormalize: MissingCastsNormalizer,
    channeling: Channeling,

    // Enhancers
    spellTimeWaitingOnGlobalCooldown: SpellTimeWaitingOnGlobalCooldown,

    // Analyzers
    healingDone: HealingDone,
    damageDone: DamageDone,
    damageTaken: DamageTaken,
    throughputStatisticGroup: ThroughputStatisticGroup,
    deathTracker: DeathTracker,

    enemiesHealth: EnemiesHealth,
    pets: Pets,
    spellManaCost: SpellManaCost,

    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
    haste: Haste,
    statTracker: StatTracker,
    alwaysBeCasting: AlwaysBeCasting,
    meleeUptime: MeleeUptimeAnalyzer,
    downtimeDebuffs: DowntimeDebuffAnalyzer,
    filteredActiveTime: FilteredActiveTime,
    abilities: Abilities,
    buffs: Auras,
    CastEfficiency: CastEfficiency,
    spellUsable: SpellUsable,
    spellHistory: SpellHistory,
    cooldownHistory: CooldownHistory,
    globalCooldown: GlobalCooldown,
    manaValues: ManaValues,
    vantusRune: VantusRune,
    distanceMoved: DistanceMoved,
    deathRecapTracker: DeathRecapTracker,
    dispels: DispelTracker,

    critEffectBonus: CritEffectBonus,

    // Tabs
    raidHealthTab: RaidHealthTab,

    potionChecker: PotionChecker,
    enchantChecker: EnchantChecker,
    flaskChecker: FlaskChecker,
    foodChecker: FoodChecker,
    augmentRuneChecker: AugmentRuneChecker,
    healthstone: Healthstone,
    healthPotion: HealthPotion,
    combatPotion: CombatPotion,
    weaponEnhancementChecker: WeaponEnhancementChecker,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    // Racials
    arcaneTorrent: ArcaneTorrent,
    critRacial: CritRacial,
    giftOfTheNaaru: GiftOfTheNaaru,
    stoneform: Stoneform,
    berserking: Berserking,
    bloodFury: BloodFury,
    otherRacials: OtherRacials,

    // Items:
    authorityOfRadiantPower: AuthorityOfRadiantPower,
    authorityOfStorms: AuthorityOfStorms,
    stormridersFury: StormridersFury,
    authorityOfTheDepths: AuthorityOfTheDepths,
    signetOfThePriory: SignetOfThePriory,
    spymastersWeb: SpymastersWeb,
    treacherousTransmitter: TreacherousTransmitter,
    madQueensMandate: MadQueensMandate,
    skardynsGrace: SkardynsGrace,
    mereldarsToll: MereldarsToll,
    cirralConcoctory: CirralConcoctory,

    // Embellishments
    darkmoonSigilAscension: DarkmoonSigilAscension,

    // Enchants
    burningDevotion: BurningDevotion,
    burningWrit: BurningWrit,
    earthenDevotion: EarthenDevotion,
    earthenWrit: EarthenWrit,
    frozenDevotion: FrozenDevotion,
    frozenWrit: FrozenWrit,
    invigoratingSporeCloud: InvigoratingSporeCloud,
    shadowflameWreathe: ShadowflameWreathe,
    sophicDevotion: SophicDevotion,
    sophicWrit: SophicWrit,
    sporeTender: SporeTender,
    waftingDevotion: WaftingDevotion,
    waftingWrit: WaftingWrit,

    // Crafted

    // Dungeons

    // Raids
  };
  // Override this with spec specific modules when extending
  static specModules: DependenciesDefinition = {};

  applyTimeFilter = (start: number, end: number) => null; //dummy function gets filled in by event parser
  applyPhaseFilter = (phase: string, instance: any) => null; //dummy function gets filled in by event parser

  config: Config;
  report: Report;
  characterProfile: CharacterProfile;

  // Player info from WCL - required
  player: PlayerInfo;
  playerPets: PetInfo[];
  fight: Fight;
  boss: Boss | null;
  combatantInfoEvents: CombatantInfoEvent[];

  //Disabled Modules
  disabledModules!: { [state in ModuleError]: any[] };

  adjustForDowntime = false;
  get hasDowntime() {
    return this.getModule(TotalDowntime).totalBaseDowntime > 0;
  }

  _modules: { [name: string]: Module } = {};
  get activeModules() {
    return Object.values(this._modules).filter((module) => module.active);
  }

  get playerId() {
    return this.player.id;
  }
  get fightId() {
    return this.fight.id;
  }

  _timestamp: number;
  get currentTimestamp() {
    return this.finished ? this.fight.end_time : this._timestamp;
  }
  get fightDuration() {
    return (
      this.currentTimestamp -
      this.fight.start_time -
      (this.adjustForDowntime ? this.getModule(TotalDowntime).totalBaseDowntime : 0)
    );
  }
  finished = false;

  get players(): PlayerInfo[] {
    return this.report.friendlies;
  }
  get selectedCombatant(): Combatant {
    return this.getModule(Combatants).selected;
  }

  constructor(
    config: Config,
    report: Report,
    selectedPlayer: PlayerInfo,
    selectedFight: Fight,
    combatantInfoEvents: CombatantInfoEvent[],
    characterProfile: CharacterProfile,
  ) {
    this.config = config;
    this.report = report;
    this.player = selectedPlayer;
    this.playerPets = report.friendlyPets.filter((pet) => pet.petOwner === selectedPlayer.id);
    this.fight = selectedFight;
    this.combatantInfoEvents = combatantInfoEvents;
    // combatantinfo events aren't included in the regular events, but they're still used to analysis. We should have them show in the history to make it complete.
    combatantInfoEvents.forEach((event) => this.eventHistory.push(event));
    this.characterProfile = characterProfile;
    this._timestamp = selectedFight.start_time;
    this.boss = findByBossId(selectedFight.boss);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore populated dynamically but object keys still strongly typed
    this.disabledModules = {};
    //initialize disabled modules for each state
    Object.values(ModuleError).forEach((key) => {
      this.disabledModules[key] = [];
    });
    const ctor = this.constructor as typeof CombatLogParser;
    this.initializeModules({
      ...ctor.internalModules,
      ...ctor.defaultModules,
      ...ctor.specModules,
    });
  }
  finish() {
    this.finished = true;
    /** @var {EventEmitter} */
    const emitter = this.getModule(EventEmitter);
    console.log(
      'Events triggered:',
      emitter.numTriggeredEvents,
      'Event listeners added:',
      emitter.numEventListeners,
      'Listeners called:',
      emitter.numListenersCalled,
      'Listeners called (after filters):',
      emitter.numActualExecutions,
      'Listeners filtered away:',
      emitter.numListenersCalled - emitter.numActualExecutions,
    );
  }

  _getModuleClass(config: DependencyDefinition): [typeof Module, any] {
    let moduleClass;
    let options;
    if (config instanceof Array) {
      moduleClass = config[0];
      options = config[1];
    } else {
      moduleClass = config;
      options = {};
    }
    return [moduleClass, options];
  }
  _resolveDependencies(dependencies: { [desiredName: string]: typeof Module }) {
    const availableDependencies: { [name: string]: Module } = {};
    const missingDependencies: Array<typeof Module> = [];
    if (dependencies) {
      Object.keys(dependencies).forEach((desiredDependencyName) => {
        const dependencyClass = dependencies[desiredDependencyName];

        const dependencyModule = this.getOptionalModule(dependencyClass);
        if (dependencyModule) {
          availableDependencies[desiredDependencyName] = dependencyModule;
        } else {
          missingDependencies.push(dependencyClass);
        }
      });
    }
    return [availableDependencies, missingDependencies] as const;
  }
  /**
   * @param {Module} moduleClass
   * @param {object} [options]
   * @param {string} [desiredModuleName]  Deprecated: will be removed Soon™.
   */
  loadModule<T extends typeof Module>(
    moduleClass: T,
    options: { [prop: string]: any; priority: number },
    desiredModuleName = `module${Object.keys(this._modules).length}`,
  ) {
    const fullOptions = {
      ...options,
      owner: this,
    };
    // eslint-disable-next-line new-cap
    const module = new moduleClass(fullOptions);
    Module.applyDependencies(fullOptions, module);
    module.key = desiredModuleName;
    this._modules[desiredModuleName] = module;
    return module;
  }
  initializeModules(modules: DependenciesDefinition, iteration = 1) {
    // TODO: Refactor and test, this dependency injection thing works really well but it's hard to understand or change.
    const failedModules: string[] = [];
    Object.keys(modules).forEach((desiredModuleName) => {
      const moduleConfig = modules[desiredModuleName];
      if (!moduleConfig) {
        return;
      }
      const [moduleClass, options] = this._getModuleClass(moduleConfig);
      const [availableDependencies, missingDependencies] = this._resolveDependencies(
        moduleClass.dependencies,
      );
      const hasMissingDependency = missingDependencies.length === 0;

      if (hasMissingDependency) {
        if (debugDependencyInjection) {
          if (Object.keys(availableDependencies).length === 0) {
            console.log('Loading', moduleClass.name);
          } else {
            console.log(
              'Loading',
              moduleClass.name,
              'with dependencies:',
              Object.keys(availableDependencies),
            );
          }
        }
        // The priority goes from lowest (most important) to highest, seeing as modules are loaded after their dependencies are loaded, just using the count of loaded modules is sufficient.
        const priority = Object.keys(this._modules).length;
        try {
          this.loadModule(
            moduleClass,
            {
              ...options,
              ...availableDependencies,
              priority,
            },
            desiredModuleName,
          );
        } catch (e) {
          if (!import.meta.env.PROD) {
            throw e;
          }
          this.disabledModules[ModuleError.INITIALIZATION].push({
            key: isMinified ? desiredModuleName : moduleClass.name,
            module: moduleClass,
            error: e,
          });
          debugDependencyInjection &&
            console.warn(moduleClass.name, 'disabled due to error during initialization: ', e);
        }
      } else {
        const disabledDependencies = missingDependencies
          .map((d) => d.name)
          .filter((x) =>
            this.disabledModules[ModuleError.INITIALIZATION].map((d) => d.module.name).includes(x),
          ); // see if a dependency was previously disabled due to an error
        if (disabledDependencies.length !== 0) {
          // if a dependency was already marked as disabled due to an error, mark this module as disabled
          this.disabledModules[ModuleError.DEPENDENCY].push({
            key: isMinified ? desiredModuleName : moduleClass.name,
            module: moduleClass,
          });
          debugDependencyInjection &&
            console.warn(
              moduleClass.name,
              'disabled due to error during initialization of a dependency.',
            );
        } else {
          debugDependencyInjection &&
            console.warn(
              moduleClass.name,
              'could not be loaded, missing dependencies:',
              missingDependencies.map((d) => d.name),
            );
          failedModules.push(desiredModuleName);
        }
      }
    });

    if (failedModules.length !== 0) {
      debugDependencyInjection &&
        console.warn(
          `${failedModules.length} modules failed to load, trying again:`,
          failedModules.map((key) => {
            const def = modules[key];
            if (def instanceof Array) {
              return def[0].name;
            } else {
              return (def as typeof Module).name;
            }
          }),
        );
      const newBatch: DependenciesDefinition = {};
      failedModules.forEach((key) => {
        newBatch[key] = modules[key];
      });
      if (iteration > MAX_DI_ITERATIONS) {
        // Sometimes modules can't be imported at all because they depend on modules not enabled or have a circular dependency. Stop trying after a while.
        // eslint-disable-next-line no-debugger
        debugger;
        throw new Error(`Failed to load modules: ${Object.keys(newBatch).join(', ')}`);
      }
      this.initializeModules(newBatch, iteration + 1);
    } else {
      this.allModulesInitialized();
    }
  }
  allModulesInitialized() {
    // Executed when module initialization is complete
  }
  _moduleCache = new Map();
  getOptionalModule<T extends Module, O extends Options>(type: {
    new (options: O): T;
  }): T | undefined {
    // We need to use a cache and can't just set this on initialization because we sometimes search by the inheritance chain.
    const cacheEntry = this._moduleCache.get(type);
    if (cacheEntry !== undefined) {
      return cacheEntry;
    }
    // Search for a specific module by its type, accepting any modules that have the type somewhere in the inheritance chain
    const module = Object.values(this._modules).find((module) => module instanceof type);
    this._moduleCache.set(type, module);
    return module as T;
  }
  getModule<T extends Module, O extends Options>(type: { new (options: O): T }): T {
    const module = this.getOptionalModule(type);
    if (module === undefined) {
      throw new Error(`Module not found: ${type.name}`);
    }
    return module;
  }
  normalize(events: AnyEvent[]) {
    this.activeModules
      .filter((module) => module instanceof EventsNormalizer)
      .map((module) => module as EventsNormalizer)
      .sort((a, b) => a.priority - b.priority) // lowest should go first, as `priority = 0` will have highest prio
      .forEach((normalizer) => {
        if (normalizer.normalize) {
          events = normalizer.normalize(events);
        }
      });
    return events;
  }

  /** The amount of events parsed. This can reliably be used to determine if something should re-render. */
  eventCount = 0;
  eventHistory: AnyEvent[] = [];
  addEventListener<ET extends EventType, E extends AnyEvent<ET>>(
    eventFilter: ET | EventFilter<ET>,
    listener: EventListener<ET, E>,
    module: Module,
  ) {
    this.getModule(EventEmitter).addEventListener(eventFilter, listener, module);
  }

  deepDisable(module: Module, state: ModuleError, error: Error | undefined = undefined) {
    if (!module.active) {
      return; //return early
    }
    console.error('Disabling', isMinified ? module.key : module.constructor.name);
    this.disabledModules[state].push({
      key: isMinified ? module.key : module.constructor.name,
      module: module.constructor,
      ...(error && { error: error }),
    });
    module.active = false;
    this.activeModules.forEach((active) => {
      const ctor = active.constructor as typeof Module;
      const deps = ctor.dependencies;
      // Inspectors may light up `module instanceof depClass` because of the constructor cast
      if (deps && Object.values(deps).find((depClass) => module instanceof depClass)) {
        this.deepDisable(active, ModuleError.DEPENDENCY);
      }
    });
  }

  byPlayer<ET extends EventType>(event: Event<ET>, playerId = this.player.id) {
    return HasSource(event) && event.sourceID === playerId;
  }
  toPlayer<ET extends EventType>(event: Event<ET>, playerId = this.player.id) {
    return HasTarget(event) && event.targetID === playerId;
  }
  byPlayerPet<ET extends EventType>(event: Event<ET>) {
    return HasSource(event) && this.playerPets.some((pet) => pet.id === event.sourceID);
  }
  toPlayerPet<ET extends EventType>(event: Event<ET>) {
    return HasTarget(event) && this.playerPets.some((pet) => pet.id === event.targetID);
  }

  /////////////////////////////////////////////////////////////////////////////
  // Utilities - use fight context to do common calculations
  //

  /** Calculates a total amount's "amount per second" based on the encounter duration */
  getPerSecond(totalAmount: number): number {
    return (totalAmount / this.fightDuration) * 1000;
  }

  /** Calculates a total amount's "amount per second" based on the encounter duration */
  getPerMinute(totalAmount: number): number {
    return (totalAmount / this.fightDuration) * 1000 * 60;
  }

  /** Calculates a healing amount's percentage of the player's total effective healing during the encounter */
  getPercentageOfTotalHealingDone(healingDone: number): number {
    return healingDone / this.getModule(HealingDone).total.effective;
  }

  /** Formats a healing amount, showing percentage of total healing and HPS */
  formatItemHealingDone(healingDone: number): string {
    return `${formatPercentage(
      this.getPercentageOfTotalHealingDone(healingDone),
    )} % / ${formatNumber(this.getPerSecond(healingDone))} HPS`;
  }

  /** Calculates a damage amount's percentage of the player's total effective damage during the encounter */
  getPercentageOfTotalDamageDone(damageDone: number): number {
    return damageDone / this.getModule(DamageDone).total.effective;
  }

  /** Formats a damage amount, showing percentage of total damage and DPS */
  formatItemDamageDone(damageDone: number): string {
    return `${formatPercentage(this.getPercentageOfTotalDamageDone(damageDone))} % / ${formatNumber(
      this.getPerSecond(damageDone),
    )} DPS`;
  }

  /** Calculates a damage amount's percentage of the player's total damage taken during the encounter */
  getPercentageOfTotalDamageTaken(damageTaken: number) {
    return damageTaken / this.getModule(DamageTaken).total.effective;
  }

  /** Formats a timestamp to show time into the encounter in mm:ss format */
  formatTimestamp(timestamp: number, precision = 0): string {
    return formatDuration(timestamp - this.fight.start_time, precision);
  }

  /** Gets the name of this event's target. Event must have defined `targetID` and `targetIsFriendly`
   *  fields in order for the name to be looked up - if either of these are missing, 'none'
   *  is returned. If they are present but the Entity with the given ID can't be found,
   *  'unknown' is returned. */
  getTargetName(event: AnyEvent): string {
    if (
      !('targetID' in event) ||
      typeof event.targetID !== 'number' ||
      !('targetIsFriendly' in event)
    ) {
      return 'none';
    }
    if (event.targetIsFriendly) {
      const combatant = this.getModule(Combatants).getEntity(event);
      return !combatant ? 'unknown' : combatant.name;
    } else {
      const enemy = this.getModule(Enemies).getEntity(event);
      return !enemy ? 'unknown' : enemy.name;
    }
  }

  /** Gets the name of this event's source. Event must have defined `sourceID` and `sourceIsFriendly`
   *  fields in order for the name to be looked up - if either of these are missing, 'none'
   *  is returned. If they are present but the Entity with the given ID can't be found,
   *  'unknown' is returned. */
  getSourceName(event: AnyEvent): string {
    if (
      !('sourceID' in event) ||
      typeof event.sourceID !== 'number' ||
      !('sourceIsFriendly' in event)
    ) {
      return 'none';
    }
    if (event.sourceIsFriendly) {
      const combatant = this.getModule(Combatants).getSourceEntity(event);
      return !combatant ? 'unknown' : combatant.name;
    } else {
      const enemy = this.getModule(Enemies).getSourceEntity(event);
      return !enemy ? 'unknown' : enemy.name;
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // Main Calculation functions
  //

  generateResults(adjustForDowntime: boolean): ParseResults {
    this.adjustForDowntime = adjustForDowntime;

    let results: ParseResults = new ParseResults();

    const addStatistic = (statistic: any, basePosition: number, key: string) => {
      if (!statistic) {
        return;
      }
      const position =
        statistic.props.position !== undefined ? statistic.props.position : basePosition;
      results.statistics.push(
        React.cloneElement(statistic, {
          key,
          position,
        }),
      );
    };

    const attemptResultGeneration = () =>
      Object.keys(this._modules)
        .filter((key) => this._modules[key].active)
        .sort((a, b) => this._modules[b].priority - this._modules[a].priority)
        .every((key, index) => {
          const module = this._modules[key];

          try {
            if (module instanceof Analyzer) {
              const analyzer = module as Analyzer;
              if (analyzer.statistic) {
                // TODO - confirm removing i18n doesn't actually change anything here
                const statistic = analyzer.statistic();
                if (statistic) {
                  if (Array.isArray(statistic)) {
                    statistic.forEach((statistic, statisticIndex) => {
                      addStatistic(statistic, index, `${key}-statistic-${statisticIndex}`);
                    });
                  } else {
                    addStatistic(statistic, index, `${key}-statistic`);
                  }
                }
              }
              if (analyzer.tab) {
                const tab = analyzer.tab();
                if (tab) {
                  results.tabs.push(tab);
                }
              }
              if (analyzer.suggestions) {
                const maybeResult = analyzer.suggestions(results.suggestions.when);
                if (maybeResult) {
                  maybeResult.forEach((issue) => results.addIssue(issue));
                }
              }
            }
          } catch (e) {
            //error occurred during results generation of module, disable module and all modules depending on it
            if (!import.meta.env.PROD) {
              throw e;
            }
            this.deepDisable(module, ModuleError.RESULTS, e as Error);
            //break loop and start again with inaccurate modules now disabled (in case of modules being rendered before their dependencies' errors are encountered)
            return false;
          }
          return true;
        });

    //keep trying to generate results until no "new" errors are found anymore to weed out all the inaccurate / errored modules
    let generated = false;
    while (!generated) {
      results = new ParseResults();

      results.tabs = [];
      generated = attemptResultGeneration();
    }

    return results;
  }

  static guide?: Guide;
  buildGuide() {
    const ctor = this.constructor as typeof CombatLogParser;
    if (ctor.guide === undefined) {
      return undefined;
    }

    const props = {
      modules: this._modules as ModulesOf<any>,
      info: this.info,
      events: this.eventHistory,
    };

    const Component = ctor.guide;
    return () => (
      <GuideContainer>
        <GuideContext.Provider value={props}>
          <ExplanationContextProvider>
            <SpellUsageContextProvider>
              <Component {...props} />
            </SpellUsageContextProvider>
          </ExplanationContextProvider>
        </GuideContext.Provider>
      </GuideContainer>
    );
  }

  /**
   * All fight events after normalization. This does not include (non
   * normalizer) modules that fabricate or alter events.
   *
   * Do note that events may be mutated by those modules, so at a later point in
   * time some events may be modified. Fabricated events will never appear in
   * this array (unless fabricated in a normalizer).
   */
  normalizedEvents: AnyEvent[] = [];
  get info(): Info {
    return {
      abilities: this.getModule(Abilities).abilities,
      defaultRange: this.getModule(Abilities).defaultRange,
      playerId: this.selectedCombatant.id,
      pets: this.playerPets.filter((pet) => pet.fights.some((fight) => fight.id === this.fight.id)),
      fightStart: this.fight.start_time,
      fightEnd: this.fight.end_time,
      fightDuration: this.fight.end_time - this.fight.start_time,
      fightId: this.fight.id,
      reportCode: this.report.code,
      combatant: this.selectedCombatant,
    };
  }
}

export default CombatLogParser;
