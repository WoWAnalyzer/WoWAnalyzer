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

  static SUGGESTION_VELENS_BREAKPOINT = 0.045;

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
    const { suggestions } = results;

    const fightDuration = this.fightDuration;

    suggestions
      .when(this.modules.prePotion.usedPrePotion).isFalse()
      .addSuggestion(suggest => {
        return suggest(<span>You did not use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. A potion such as <ItemLink id={ITEMS.POTION_OF_PROLONGED_POWER.id} /> can be very effective (even for healers), especially during shorter encounters.</span>)
          .icon(ITEMS.POTION_OF_PROLONGED_POWER.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
      });
    suggestions
      .when(this.modules.prePotion.usedSecondPotion).isFalse()
      .addSuggestion(suggest => {
        let suggestionText;
        let importance;
        if (!this.modules.prePotion.neededManaSecondPotion) {
          suggestionText = <span>You forgot to use a potion during combat. Using a potion during combat allows you the benefit of either increasing output through <ItemLink id={ITEMS.POTION_OF_PROLONGED_POWER.id} /> or allowing you to gain mana using <ItemLink id={ITEMS.ANCIENT_MANA_POTION.id}/>, for example.</span>;
          importance = SUGGESTION_IMPORTANCE.MINOR;
        } else {
          suggestionText = <span>You ran out of mana (OOM) during the encounter without using a second potion. Use a second potion such as <ItemLink id={ITEMS.ANCIENT_MANA_POTION.id}/> or if the fight allows <ItemLink id={ITEMS.LEYTORRENT_POTION.id}/> to regenerate some mana.</span>;
          importance = SUGGESTION_IMPORTANCE.REGULAR;
        }
        return suggest(suggestionText)
          .icon(ITEMS.LEYTORRENT_POTION.icon)
          .staticImportance(importance);
      });

    // Epics:
    if (this.modules.gnawedThumbRing.active) {
      results.items.push({
        item: ITEMS.GNAWED_THUMB_RING,
        result: (<dfn data-tip={`The effective healing and damage contributed by Gnawed Thumb Ring.<br/> Damage: ${this.formatItemDamageDone(this.modules.gnawedThumbRing.damageIncreased)} <br/> Healing: ${this.formatItemHealingDone(this.modules.gnawedThumbRing.healingIncreaseHealing)}`}>
            {this.modules.gnawedThumbRing.healingIncreaseHealing > this.modules.gnawedThumbRing.damageIncreased ? this.formatItemHealingDone(this.modules.gnawedThumbRing.healingIncreaseHealing) : this.formatItemDamageDone(this.modules.gnawedThumbRing.damageIncreased)}
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
        result: this.formatItemHealingDone(this.modules.barbaricMindslaver.healing),
      });
    }
    if (this.modules.seaStar.active) {
      results.items.push({
        item: ITEMS.SEA_STAR_OF_THE_DEPTHMOTHER,
        result: this.formatItemHealingDone(this.modules.seaStar.healing),
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
      suggestions
        .when(this.modules.deceiversGrandDesign.proced).isTrue()
        .addSuggestion(suggest => {
          return suggest(
            <span>
              Your <ItemLink id={ITEMS.DECEIVERS_GRAND_DESIGN.id} /> procced earlier than expected. Try to cast it on players without spiky health pools. The following events procced the effect:<br />
              {this.modules.deceiversGrandDesign.procs
                .map((procs, index) => {
                  const url = `https://www.warcraftlogs.com/reports/${procs.report}/#fight=${procs.fight}&source=${procs.target}&type=summary&start=${procs.start}&end=${procs.end}&view=events`;
                  return (
                    <div key={index}>
                      Proc {index + 1} on: <a href={url} target="_blank" rel="noopener noreferrer">{procs.name}</a>
                    </div>
                  );
                })}
            </span>
          )
            .icon(ITEMS.DECEIVERS_GRAND_DESIGN.icon);
        });
    }

    results.statistics.push(<VantusRune owner={this} />);

    Object.keys(this.modules)
      .map(key => this.modules[key])
      .sort((a, b) => b.priority - a.priority)
      .filter(module => module.active)
      .forEach(module => {
        if (module.statistic) {
          results.statistics.push(module.statistic());
        }
        if (module.item) {
          results.items.push(module.item());
        }
        if (module.tab) {
          results.tabs.push(module.tab());
        }
        if (module.suggestion) {
          module.suggestion(results.suggestions.when);
        }
      });

    return results;
  }
}

export default CombatLogParser;
