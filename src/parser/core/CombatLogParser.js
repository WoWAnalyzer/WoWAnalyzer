import React from 'react';

import { findByBossId } from 'raids';
import { formatDuration, formatNumber, formatPercentage, formatThousands } from 'common/format';
import ItemIcon from 'common/ItemIcon';
import ItemLink from 'common/ItemLink';
import { captureException } from 'common/errorLogger';
import ChangelogTab from 'interface/others/ChangelogTab';
import ChangelogTabTitle from 'interface/others/ChangelogTabTitle';
import DeathRecapTracker from 'interface/others/DeathRecapTracker';
import ItemStatisticBox from 'interface/others/ItemStatisticBox';

import ApplyBuffNormalizer from 'parser/shared/normalizers/ApplyBuff';
import CancelledCastsNormalizer from 'parser/shared/normalizers/CancelledCasts';

import HealingDone from './modules/HealingDone';
import DamageDone from './modules/DamageDone';
import DamageTaken from './modules/DamageTaken';
import DeathTracker from './modules/DeathTracker';

import Combatants from './modules/Combatants';
import AbilityTracker from './modules/AbilityTracker';
import Haste from './modules/Haste';
import StatTracker from './modules/StatTracker';
import AlwaysBeCasting from './modules/AlwaysBeCasting';
import Abilities from './modules/Abilities';
import CastEfficiency from './modules/CastEfficiency';
import SpellUsable from './modules/SpellUsable';
import SpellHistory from './modules/SpellHistory';
import GlobalCooldown from './modules/GlobalCooldown';
import Enemies from './modules/Enemies';
import EnemyInstances from './modules/EnemyInstances';
import Pets from './modules/Pets';
import ManaValues from './modules/ManaValues';
import SpellManaCost from './modules/SpellManaCost';
import Channeling from './modules/Channeling';
import TimelineBuffEvents from './modules/TimelineBuffEvents';
import DeathDowntime from './modules/downtime/DeathDowntime';
import TotalDowntime from './modules/downtime/TotalDowntime';

import DistanceMoved from './modules/others/DistanceMoved';

import CharacterTab from './modules/features/CharacterTab';
import EncounterPanel from './modules/features/EncounterPanel';

// Tabs
import TimelineTab from './modules/features/TimelineTab';
import ManaTab from './modules/features/ManaTab';
import RaidHealthTab from './modules/features/RaidHealthTab';

import CritEffectBonus from './modules/helpers/CritEffectBonus';

import PrePotion from './modules/items/PrePotion';
import EnchantChecker from './modules/items/EnchantChecker';
import Healthstone from './modules/items/Healthstone';
import HealthPotion from './modules/items/HealthPotion';
import CombatPotion from './modules/items/CombatPotion';
import PreparationRuleAnalyzer from './modules/features/Checklist2/PreparationRuleAnalyzer';

import ArcaneTorrent from './modules/racials/bloodelf/ArcaneTorrent';
import MightOfTheMountain from './modules/racials/dwarf/MightOfTheMountain';

// Shared Buffs
import VantusRune from './modules/spells/VantusRune';

// BFA
import GildedLoaFigurine from './modules/items/bfa/GildedLoaFigurine';
import FirstMatesSpyglass from './modules/items/bfa/FirstMatesSpyglass';
// Dungeons
import RevitalizingVoodooTotem from './modules/items/bfa/dungeons/RevitalizingVoodooTotem';
import LingeringSporepods from './modules/items/bfa/dungeons/LingeringSporepods';
import FangsOfIntertwinedEssence from './modules/items/bfa/dungeons/FangsOfIntertwinedEssence';
import BalefireBranch from './modules/items/bfa/dungeons/BalefireBranch';
import ConchofDarkWhispers from './modules/items/bfa/dungeons/ConchofDarkWhispers';
import Seabreeze from './modules/items/bfa/dungeons/Seabreeze';
import GalecallersBoon from './modules/items/bfa/dungeons/GalecallersBoon';
import HarlansLoadedDice from './modules/items/bfa/dungeons/HarlansLoadedDice';
//Enchants

// Crafted
import DarkmoonDeckTides from './modules/items/bfa/crafted/DarkmoonDeckTides';
import DarkmoonDeckFathoms from './modules/items/bfa/crafted/DarkmoonDeckFathoms';
import DarkmoonDeckBlockades from './modules/items/bfa/crafted/DarkmoonDeckBlockades';
// Azerite Traits
import Gemhide from './modules/spells/bfa/azeritetraits/Gemhide';
import Gutripper from './modules/spells/bfa/azeritetraits/Gutripper';
import HeedMyCall from './modules/spells/bfa/azeritetraits/HeedMyCall';
import LaserMatrix from './modules/spells/bfa/azeritetraits/LaserMatrix';
import MeticulousScheming from './modules/spells/bfa/azeritetraits/MeticulousScheming';
import OverWhelmingPower from './modules/spells/bfa/azeritetraits/OverwhelmingPower';
import ElementalWhirl from './modules/spells/bfa/azeritetraits/ElementalWhirl';
import BloodRite from './modules/spells/bfa/azeritetraits/BloodRite';
import ConcentratedMending from './modules/spells/bfa/azeritetraits/ConcentratedMending';
import BlessedPortents from './modules/spells/bfa/azeritetraits/BlessedPortents';
// Uldir
import TwitchingTentacleofXalzaix from './modules/items/bfa/raids/uldir/TwitchingTentacleofXalzaix';
import VigilantsBloodshaper from './modules/items/bfa/raids/uldir/VigilantsBloodshaper';
import InoculatingExtract from './modules/items/bfa/raids/uldir/InoculatingExtract';
import FreneticCorpuscle from './modules/items/bfa/raids/uldir/FreneticCorpuscle';
import ConstructOvercharger from './modules/items/bfa/raids/uldir/ConstructOvercharger';

import ParseResults from './ParseResults';
import Analyzer from './Analyzer';
import EventsNormalizer from './EventsNormalizer';

// This prints to console anything that the DI has to do
const debugDependencyInjection = false;

class CombatLogParser {
  static abilitiesAffectedByHealingIncreases = [];
  static abilitiesAffectedByDamageIncreases = [];

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

    // Tabs
    characterTab: CharacterTab,
    encounterPanel: EncounterPanel,
    timelineTab: TimelineTab,
    manaTab: ManaTab,
    raidHealthTab: RaidHealthTab,

    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
    healthstone: Healthstone,
    healthPotion: HealthPotion,
    combatPotion: CombatPotion,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    // Racials
    arcaneTorrent: ArcaneTorrent,
    mightOfTheMountain: MightOfTheMountain,

    // Items:
    // BFA
    gildedLoaFigurine: GildedLoaFigurine,
    firstMatesSpyglass: FirstMatesSpyglass,
    revitalizingVoodooTotem: RevitalizingVoodooTotem,
    // Dungeons
    lingeringSporepods: LingeringSporepods,
    fangsOfIntertwinedEssence: FangsOfIntertwinedEssence,
    balefireBranch: BalefireBranch,
    conchofDarkWhispers: ConchofDarkWhispers,
    seabreeze: Seabreeze,
    galecallersBoon: GalecallersBoon,
    harlansLoadedDice: HarlansLoadedDice,
    // Crafted
    darkmoonDeckTides: DarkmoonDeckTides,
    darkmoonDeckFathoms: DarkmoonDeckFathoms,
    darkmoonDeckBlockades: DarkmoonDeckBlockades,
    // Enchants

    // Azerite Traits
    gemhide: Gemhide,
    gutripper: Gutripper,
    heedMyCall: HeedMyCall,
    laserMatrix: LaserMatrix,
    meticulousScheming: MeticulousScheming,
    overwhelmingPower: OverWhelmingPower,
    elementalWhirl: ElementalWhirl,
    bloodRite: BloodRite,
    concentratedMending: ConcentratedMending,
    blessedPortents: BlessedPortents,

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
  addEventListener(type, listener, module, options = null) {
    this._eventListeners[type] = this._eventListeners[type] || [];
    this._eventListeners[type].push({
      ...options,
      module,
      listener,
    });
  }
  triggerEvent(event) {
    if (process.env.NODE_ENV === 'development') {
      if (!event.type) {
        console.log(event);
        throw new Error('Events should have a type. No type received. See the console for the event.');
      }
    }

    // When benchmarking the event triggering make sure to disable the event batching and turn the listener into a dummy so you get the performance of just this piece of code. At the time of writing the event triggering code only has about 12ms overhead for a full log.

    if (event.timestamp) {
      this._timestamp = event.timestamp;
    }
    this._event = event;

    const isByPlayer = this.byPlayer(event);
    const isToPlayer = this.toPlayer(event);
    const isByPlayerPet = this.byPlayerPet(event);
    const isToPlayerPet = this.toPlayerPet(event);

    const run = options => {
      if (!isByPlayer && options.byPlayer) {
        return;
      }
      if (!isToPlayer && options.toPlayer) {
        return;
      }
      if (!isByPlayerPet && options.byPlayerPet) {
        return;
      }
      if (!isToPlayerPet && options.toPlayerPet) {
        return;
      }
      try {
        options.listener(event);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          throw err;
        }
        console.error('Disabling', options.module.constructor.name, 'and child dependencies because an error occured', err);
        // Disable this module and all active modules that have this as a dependency
        this.deepDisable(options.module);
        captureException(err);
      }
    };

    {
      // Handle on_event (listeners of all events)
      const listeners = this._eventListeners.event;
      if (listeners) {
        listeners.forEach(run);
      }
    }
    {
      const listeners = this._eventListeners[event.type];
      if (listeners) {
        listeners.forEach(run);
      }
    }

    this.eventHistory.push(event);
    // Some modules need to have a primitive value to cause re-renders
    // TODO: This can probably be removed since we only render upon completion now
    this.eventCount += 1;
  }

  deepDisable(module) {
    console.error('Disabling', module.constructor.name);
    module.active = false;
    this.activeModules.forEach(active => {
        const deps = active.constructor.dependencies;
        if (deps && Object.values(deps).find(depClass => module instanceof depClass)) {
          this.deepDisable(active);
        }
      }
    );
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
