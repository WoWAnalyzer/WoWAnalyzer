import React from 'react';

import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Combatants from './Modules/Combatants';
import AbilityTracker from './Modules/AbilityTracker';
import AlwaysBeCasting from './Modules/AlwaysBeCasting';
import Enemies from './Modules/Enemies';
import HealEventTracker from './Modules/HealEventTracker';
import ManaValues from './Modules/ManaValues';

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

// Shared Buffs
import VantusRune from './Modules/VantusRune';

import ParseResults from './ParseResults';
import SUGGESTION_IMPORTANCE from './ISSUE_IMPORTANCE';

function getSuggestionImportance(value, regular, major, higherIsWorse = false) {
  if (higherIsWorse ? value > major : value < major) {
    return SUGGESTION_IMPORTANCE.MAJOR;
  }
  if (higherIsWorse ? value > regular : value < regular) {
    return SUGGESTION_IMPORTANCE.REGULAR;
  }
  return SUGGESTION_IMPORTANCE.MINOR;
}

class CombatLogParser {
  static abilitiesAffectedByHealingIncreases = [];

  static defaultModules = {
    combatants: Combatants,
    enemies: Enemies,
    abilityTracker: AbilityTracker,
    healEventTracker: HealEventTracker,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,

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
  };
  // Override this with spec specific modules
  static specModules = {};

  report = null;
  player = null;
  fight = null;

  modules = {};

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

    this.initializeModules(this.constructor.defaultModules);
    this.initializeModules(this.constructor.specModules);
  }

  numRegisteredModules = 0;
  registerModule(module) {
    this.modules[`_${this.numRegisteredModules}`] = module;
    this.numRegisteredModules += 1;
  }
  initializeModules(modules) {
    Object.keys(modules).forEach(key => {
      const value = modules[key];
      // This may override existing modules, this is intended.
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
    })
      .then((results) => {
        this.triggerEvent('forceUpdate');
        return results;
      });
  }

  triggerEvent(eventType, event) {
    const methodName = `on_${eventType}`;
    this.constructor.tryCall(this, methodName, event);
    Object.keys(this.modules)
      .map(key => this.modules[key])
      .sort((a, b) => b.priority - a.priority)
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

  // This used to be implemented as a sanity check, may be replaced by a cleaner solution.
  totalHealing = 0;
  on_byPlayer_heal(event) {
    this.totalHealing += event.amount + (event.absorbed || 0);
  }

  on_byPlayer_absorbed(event) {
    this.totalHealing += event.amount + (event.absorbed || 0);
  }

  totalDamageDone = 0;
  totalDamageDoneToFriendly = 0;
  on_byPlayer_damage(event) {
    if (event.targetIsFriendly) {
      this.totalDamageDoneToFriendly += event.amount + (event.absorbed || 0);
    }
    else {
      this.totalDamageDone += event.amount + (event.absorbed || 0);
    }
  }
  totalDamageTaken = 0;
  on_toPlayer_damage(event) {
    this.totalDamageTaken += event.amount + (event.absorbed || 0);
  }

  // TODO: Damage taken from LOTM

  static SUGGESTION_VELENS_BREAKPOINT = 0.045;
  generateResults() {
    const results = new ParseResults();

    const fightDuration = this.fightDuration;
    const getPercentageOfTotal = healingDone => healingDone / this.totalHealing;
    const getDamagePercentOfTotal = damageDone => damageDone / this.totalDamageDone;
    const formatItemHealing = healingDone => `${formatPercentage(getPercentageOfTotal(healingDone))} % / ${formatNumber(healingDone / fightDuration * 1000)} HPS`;
    const formatItemDamage = damageDone => `${formatPercentage(getDamagePercentOfTotal(damageDone))} % / ${formatNumber(damageDone / fightDuration * 1000)} DPS`;

    if (this.modules.prydaz.active) {
      results.items.push({
        item: ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS,
        result: formatItemHealing(this.modules.prydaz.healing),
      });
    }
    if (this.modules.velens.active) {
      // TODO: Move this to the Velen's module? having it here stops making sense. If "item" modules could just provide their own item data object & suggestion then everything would be completely together. At that point the parser would have to recognize items automatically and add them to the items array as their modules are loaded. Doing this could be nice as items would be completely isolated in their module files, but I don't think mixing the currently pure JS modules with React is favorable.
      results.items.push({
        item: ITEMS.VELENS_FUTURE_SIGHT,
        result: (
          <dfn data-tip={`The effective healing contributed by the Velen's Future Sight use effect. ${formatPercentage(this.modules.velens.healingIncreaseHealing / this.totalHealing)}% of total healing was contributed by the 15% healing increase and ${formatPercentage(this.modules.velens.overhealHealing / this.totalHealing)}% of total healing was contributed by the overhealing distribution.`}>
            {formatItemHealing(this.modules.velens.healing)}
          </dfn>
        ),
      });
      const velensHealingPercentage = getPercentageOfTotal(this.modules.velens.healing);
      if (velensHealingPercentage < this.constructor.SUGGESTION_VELENS_BREAKPOINT) {
        results.addIssue({
          issue: <span>Your usage of <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} /> can be improved. Try to maximize the amount of healing during the buff without excessively overhealing on purpose, or consider using an easier legendary ({(velensHealingPercentage * 100).toFixed(2)}% healing contributed).</span>,
          icon: ITEMS.VELENS_FUTURE_SIGHT.icon,
          importance: getSuggestionImportance(velensHealingPercentage, this.constructor.SUGGESTION_VELENS_BREAKPOINT - 0.005, this.constructor.SUGGESTION_VELENS_BREAKPOINT - 0.015),
        });
      }
    }
    if (!this.modules.prePotion.usedPrePotion) {
      results.addIssue({
        issue: <span>You forgot to use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. A potion such as <ItemLink id={ITEMS.POTION_OF_PROLONGED_POWER.id} /> can be very effective (even for healers), especially during shorter encounters.</span>,
        icon: ITEMS.POTION_OF_PROLONGED_POWER.icon,
        importance: SUGGESTION_IMPORTANCE.MINOR,
      });
    }
    if (!this.modules.prePotion.usedSecondPotion) {
      let importance;
      let issue;
      if(!this.modules.prePotion.neededManaSecondPotion) {
        importance = SUGGESTION_IMPORTANCE.MINOR;
        issue = <span>You forgot to use a potion during combat. Using a potion during combat allows you the benefit of either increasing output through <ItemLink id={ITEMS.POTION_OF_PROLONGED_POWER.id} /> or allowing you to gain mana using <ItemLink id={ITEMS.ANCIENT_MANA_POTION.id}/>, for example.</span>;
      } else {
        importance = SUGGESTION_IMPORTANCE.REGULAR;
        issue = <span>You ran out of mana (OOM) during the encounter without using a second potion. Use a second potion such as <ItemLink id={ITEMS.ANCIENT_MANA_POTION.id}/> or if the fight allows <ItemLink id={ITEMS.LEYTORRENT_POTION.id}/> to regenerate some mana.</span>;
      }
      results.addIssue({
        icon: ITEMS.LEYTORRENT_POTION.icon,
        issue: issue,
        importance: importance,
      });
    }
    if (this.modules.sephuzsSecret.active) {
      results.items.push({
        item: ITEMS.SEPHUZS_SECRET,
        result: `${((this.modules.sephuzsSecret.uptime / fightDuration * 100) || 0).toFixed(2)} % uptime`,
      });
    }

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
      if (this.modules.deceiversGrandDesign.proced) {
        results.addIssue({
          issue: <span>Your <ItemLink id={ITEMS.DECEIVERS_GRAND_DESIGN.id} /> procced earlier than expected. The following events procced the effect:<br />
            {this.modules.deceiversGrandDesign.procs
              .map((procs, index) => {
                const url = `https://www.warcraftlogs.com/reports/${procs.report}/#fight=${procs.fight}&source=${procs.target}&type=summary&start=${procs.start}&end=${procs.end}&view=events`;
                return (
                  <div key={index}>
                    Proc {index + 1} on: <a href={url} target="_blank" rel="noopener noreferrer">{procs.name}</a>
                  </div>
                );
              })}
          </span>,
          icon: ITEMS.DECEIVERS_GRAND_DESIGN.icon,
        });
      }
    }

    results.statistics.push(<VantusRune owner={this} />);

    return results;
  }
}

export default CombatLogParser;
