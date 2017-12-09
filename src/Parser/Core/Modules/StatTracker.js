import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SPECS from 'common/SPECS';
import { calculateSecondaryStatDefault } from 'common/stats';
import { formatMilliseconds } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

// TODO: stat constants somewhere else? they're largely copied from combatant
class StatTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  static STAT_BUFFS = {
    // region Potions
    [SPELLS.POTION_OF_PROLONGED_POWER.id]: { stamina: 2500, strength: 2500, agility: 2500, intellect: 2500 },
    // endregion
    // TODO: add flasks
    // TODO: add food
    // TODO: add runes

    // region Trinkets
    [SPELLS.SHADOWS_STRIKE.id]: {
      itemId: ITEMS.DREADSTONE_OF_ENDLESS_SHADOWS.id,
      crit: (_, item) => calculateSecondaryStatDefault(845, 3480, item.itemLevel),
    },
    [SPELLS.SHADOW_MASTER.id]: {
      itemId: ITEMS.DREADSTONE_OF_ENDLESS_SHADOWS.id,
      mastery: (_, item) => calculateSecondaryStatDefault(845, 3480, item.itemLevel),
    },
    [SPELLS.SWARMING_SHADOWS.id]: {
      itemId: ITEMS.DREADSTONE_OF_ENDLESS_SHADOWS.id,
      haste: (_, item) => calculateSecondaryStatDefault(845, 3480, item.itemLevel),
    },
    // Event weirdness makes it impossible to handle CotRT normally, it's handled instead by the CharmOfTheRisingTide module
    //[SPELLS.RISING_TIDES.id]: {
    //  itemId: ITEMS.CHARM_OF_THE_RISING_TIDE.id,
    //  haste: (_, item) => calculateSecondaryStatDefault(900, 576, item.itemLevel),
    //},
    [SPELLS.ACCELERANDO.id]: {
      itemId: ITEMS.ERRATIC_METRONOME.id,
      haste: (_, item) => calculateSecondaryStatDefault(870, 657, item.itemLevel),
    },
    [SPELLS.TOME_OF_UNRAVELING_SANITY_BUFF.id]: {
      itemId: ITEMS.TOME_OF_UNRAVELING_SANITY.id,
      crit: (_, item) => calculateSecondaryStatDefault(910, 2756, item.itemLevel),
    },
    // endregion

    // region Misc
    [SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_STRENGTH.id]: { // check numbers
      strength: combatant => 4000 + (combatant.traitsBySpellId[SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_TRAIT.id] - 1) * 300,
    },
    [SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_AGILITY.id]: { // check numbers
      agility: combatant => 4000 + (combatant.traitsBySpellId[SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_TRAIT.id] - 1) * 300,
    },
    [SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_INTELLECT.id]: { // check numbers
      intellect: combatant => 4000 + (combatant.traitsBySpellId[SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_TRAIT.id] - 1) * 300,
    },
    [SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_VERSATILITY.id]: { // check numbers
      versatility: combatant => 1500 + 100 * (combatant.traitsBySpellId[SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_TRAIT.id] - 1) * 300,
    },
    [SPELLS.JACINS_RUSE.id]: { mastery: 3000 },
    [SPELLS.MARK_OF_THE_CLAW.id]: { crit: 1000, haste: 1000 },
    // endregion

    // region Druid
    [SPELLS.ASTRAL_HARMONY.id]: { mastery: 4000 },
    // endregion

    // region Mage
    [SPELLS.WARMTH_OF_THE_PHOENIX.id]: { crit: 800 },
    // endregion

    // region Priest
    [SPELLS.MIND_QUICKENING.id]: { haste: 800 },
    // endregion
  };

  _pullStats = {};
  _currentStats = {};

  on_initialized() {
    // TODO: Use combatantinfo event directly
    this._pullStats = {
      strength: this.combatants.selected.strength,
      agility: this.combatants.selected.agility,
      intellect: this.combatants.selected.intellect,
      stamina: this.combatants.selected.stamina,
      crit: this.combatants.selected.critRating,
      haste: this.combatants.selected.hasteRating,
      mastery: this.combatants.selected.masteryRating,
      versatility: this.combatants.selected.versatilityRating,
      avoidance: this.combatants.selected.avoidanceRating,
      leech: this.combatants.selected.leechRating,
      speed: this.combatants.selected.speedRating,
    };
    this._currentStats = {
      ...this._pullStats,
    };

    this._debugPrintStats(this._currentStats);
  }

  /*
   * Stat rating at pull.
   * Should be identical to what you get from Combatant.
   */
  get startingStrengthRating() {
    return this._pullStats.strength;
  }
  get startingAgilityRating() {
    return this._pullStats.agility;
  }
  get startingIntellectRating() {
    return this._pullStats.intellect;
  }
  get startingStaminaRating() {
    return this._pullStats.stamina;
  }
  get startingCritRating() {
    return this._pullStats.crit;
  }
  get startingHasteRating() {
    return this._pullStats.haste;
  }
  get startingMasteryRating() {
    return this._pullStats.mastery;
  }
  get startingVersatilityRating() {
    return this._pullStats.versatility;
  }
  get startingAvoidanceRating() {
    return this._pullStats.avoidance;
  }
  get startingLeechRating() {
    return this._pullStats.leech;
  }
  get startingSpeedRating() {
    return this._pullStats.speed;
  }

  /*
   * Current stat rating, as tracked by this module.
   */
  get currentStrengthRating() {
    return this._currentStats.strength;
  }
  get currentAgilityRating() {
    return this._currentStats.agility;
  }
  get currentIntellectRating() {
    return this._currentStats.intellect;
  }
  get currentStaminaRating() {
    return this._currentStats.stamina;
  }
  get currentCritRating() {
    return this._currentStats.crit;
  }
  get currentHasteRating() {
    return this._currentStats.haste;
  }
  get currentMasteryRating() {
    return this._currentStats.mastery;
  }
  get currentVersatilityRating() {
    return this._currentStats.versatility;
  }
  get currentAvoidanceRating() {
    return this._currentStats.avoidance;
  }
  get currentLeechRating() {
    return this._currentStats.leech;
  }
  get currentSpeedRating() {
    return this._currentStats.speed;
  }

  // TODO: I think these should be ratings. They behave like ratings and I think the only reason they're percentages here is because that's how they're **displayed** in-game, but not because it's more correct.
  /*
   * For percentage stats, the percentage you'd have with zero rating.
   * These values don't change.
   */
  get baseCritPercentage() {
    const standard = 0.05;
    switch (this.combatants.selected.spec) {
      case SPECS.HOLY_PALADIN:
        return standard + 0.03; // 3% from a trait everyone has. TODO: Make traits conditional
      case SPECS.FIRE_MAGE:
        return standard + 0.15; // an additional 15% is gained from the passive Critical Mass
      default:
        return standard;
    }
  }
  get baseHastePercentage() {
    return 0;
  }
  get baseMasteryPercentage() {
    switch (this.combatants.selected.spec) {
      case SPECS.HOLY_PALADIN:
        return 0.12;
      case SPECS.HOLY_PRIEST:
        return 0.05;
      case SPECS.SHADOW_PRIEST:
        return 0.2;
      case SPECS.RESTORATION_SHAMAN:
        return 0.24;
      case SPECS.ENHANCEMENT_SHAMAN:
        return 0.2;
      case SPECS.RESTORATION_DRUID:
        return 0.048;
      case SPECS.RETRIBUTION_PALADIN:
        return 0.14;
      case SPECS.WINDWALKER_MONK:
        return 0.1;
      case SPECS.MARKSMANSHIP_HUNTER:
        return 0.05;
      case SPECS.FROST_MAGE:
        return 0.18;
      case SPECS.FIRE_MAGE:
        return 0.06;
      case SPECS.SUBTLETY_ROGUE:
        return 0.2208;
      case SPECS.BEAST_MASTERY_HUNTER:
        return 0.18;
      case SPECS.UNHOLY_DEATH_KNIGHT:
        return 0.18;
      default:
        console.error('Mastery hasn\'t been implemented for this spec yet.');
        return 0.0;
    }
  }
  get baseVersatilityPercentage() {
    return 0;
  }
  get baseAvoidancePercentage() {
    return 0;
  }
  get baseLeechPercentage() {
    return 0;
  }
  get baseSpeedPercentage() {
    return 0;
  }

  /*
   * For percentage stats, this is the divider to go from rating to percent (expressed from 0 to 1)
   * These values don't change.
   */
  get critRatingPerPercent() {
    return 40000;
  }
  critPercentage(rating, withBase = false) {
    return (withBase ? this.baseCritPercentage : 0) + rating / this.critRatingPerPercent;
  }
  get hasteRatingPerPercent() {
    return 37500;
  }
  hastePercentage(rating, withBase = false) {
    return (withBase ? this.baseHastePercentage : 0) + rating / this.hasteRatingPerPercent;
  }
  get masteryRatingPerPercent() {
    switch (this.combatants.selected.spec) {
      case SPECS.HOLY_PALADIN:
        return 26667;
      case SPECS.HOLY_PRIEST:
        return 32000;
      case SPECS.SHADOW_PRIEST:
        return 16000;
      case SPECS.RESTORATION_SHAMAN:
        return 13333;
      case SPECS.ENHANCEMENT_SHAMAN:
        return 13333;
      case SPECS.RESTORATION_DRUID:
        return 66667;
      case SPECS.RETRIBUTION_PALADIN:
        return 22850;
      case SPECS.WINDWALKER_MONK:
        return 32000;
      case SPECS.MARKSMANSHIP_HUNTER:
        return 64000;
      case SPECS.FROST_MAGE:
        return 17778;
      case SPECS.FIRE_MAGE:
        return 53333;
      case SPECS.SUBTLETY_ROGUE:
        return 14492.61221;
      case SPECS.BEAST_MASTERY_HUNTER:
        return 17778;
      case SPECS.UNHOLY_DEATH_KNIGHT:
        return 17776;
      default:
        console.error('Mastery hasn\'t been implemented for this spec yet.');
        return 99999999;
    }
  }
  masteryPercentage(rating, withBase = false) {
    return (withBase ? this.baseMasteryPercentage : 0) + rating / this.masteryRatingPerPercent;
  }
  get versatilityRatingPerPercent() {
    return 47500;
  }
  versatilityPercentage(rating, withBase = false) {
    return (withBase ? this.baseVersatilityPercentage : 0) + rating / this.versatilityRatingPerPercent;
  }
  get avoidanceRatingPerPercent() {
    return 11000;
  }
  avoidancePercentage(rating, withBase = false) {
    return (withBase ? this.baseAvoidancePercentage : 0) + rating / this.avoidanceRatingPerPercent;
  }
  get leechRatingPerPercent() {
    return 23000;
  }
  leechPercentage(rating, withBase = false) {
    return (withBase ? this.baseLeechPercentage : 0) + rating / this.leechRatingPerPercent;
  }
  get speedRatingPerPercent() {
    return 8000;
  }
  speedPercentage(rating, withBase = false) {
    return (withBase ? this.baseSpeedPercentage : 0) + rating / this.speedRatingPerPercent;
  }

  /*
   * For percentage stats, the current stat percentage as tracked by this module.
   */
  get currentCritPercentage() {
    return this.critPercentage(this.currentCritRating, true);
  }
  get currentHastePercentage() {
    return this.hastePercentage(this.currentHasteRating, true);
  }
  get currentMasteryPercentage() {
    return this.masteryPercentage(this.currentMasteryRating, true);
  }
  get currentVersatilityPercentage() {
    return this.versatilityPercentage(this.currentVersatilityRating, true);
  }
  get currentAvoidancePercentage() {
    return this.avoidancePercentage(this.currentAvoidanceRating, true);
  }
  get currentLeechPercentage() {
    return this.leechPercentage(this.currentLeechRating, true);
  }
  get currentSpeedPercentage() {
    return this.speedPercentage(this.currentSpeedRating, true);
  }

  on_toPlayer_changebuffstack(event) {
    this._changeBuffStack(event);
  }

  on_toPlayer_changedebuffstack(event) {
    this._changeBuffStack(event);
  }

  /*
   * This interface allows an external analyzer to force a stat change.
   * It should ONLY be used if a stat buff is so non-standard that it can't be handled by the buff format in this module.
   * change is a stat buff object just like those in the STAT_BUFFS structure above, it is required.
   * eventReason is the WCL event object that caused this change, it is not required.
   */
  // For an example of how / why this function would be used, see the CharmOfTheRisingTide module.
  forceChangeStats(change, eventReason) {
    const before = Object.assign({}, this._currentStats);
    const delta = this._changeStats(change, 1);
    const after = Object.assign({}, this._currentStats);
    this._triggerChangeStats(eventReason, before, delta, after);
    if (debug) {
      const spellName = eventReason && eventReason.ability ? eventReason.ability.name : 'unspecified';
      console.log(`StatTracker: FORCED CHANGE from ${spellName} - Change: ${this._statPrint(delta)}`);
      this._debugPrintStats(this._currentStats);
    }
  }

  _changeBuffStack(event) {
    const spellId = event.ability.guid;
    const statBuff = this.constructor.STAT_BUFFS[spellId];
    if (statBuff) {
      // ignore prepull buff application, as they're already accounted for in combatantinfo
      // we have to check the stacks count because Entities incorrectly copies the prepull property onto changes and removal following the application
      if (event.oldStacks === 0 && event.prepull) {
        debug && console.log(`StatTracker prepull application IGNORED for ${SPELLS[spellId] ? SPELLS[spellId].name : spellId}`);
        return;
      }

      const before = Object.assign({}, this._currentStats);
      const delta = this._changeStats(statBuff, event.newStacks - event.oldStacks);
      const after = Object.assign({}, this._currentStats);
      this._triggerChangeStats(event, before, delta, after);
      debug && console.log(`StatTracker: (${event.oldStacks} -> ${event.newStacks}) ${SPELLS[spellId] ? SPELLS[spellId].name : spellId} @ ${formatMilliseconds(this.owner.currentTimestamp)} - Change: ${this._statPrint(delta)}`);
      debug && this._debugPrintStats(this._currentStats);
    }
  }

  _changeStats(change, factor) {
    const delta = {
      strength: this._getBuffValue(change, change.strength) * factor,
      agility: this._getBuffValue(change, change.agility) * factor,
      intellect: this._getBuffValue(change, change.intellect) * factor,
      stamina: this._getBuffValue(change, change.stamina) * factor,
      crit: this._getBuffValue(change, change.crit) * factor,
      haste: this._getBuffValue(change, change.haste) * factor,
      mastery: this._getBuffValue(change, change.mastery) * factor,
      versatility: this._getBuffValue(change, change.versatility) * factor,
      avoidance: this._getBuffValue(change, change.avoidance) * factor,
      leech: this._getBuffValue(change, change.leech) * factor,
      speed: this._getBuffValue(change, change.speed) * factor,
    };

    Object.keys(this._currentStats).forEach(key => {
      this._currentStats[key] += delta[key];
    });

    return delta;
  }

  /*
   * Fabricates an event indicating when stats change
   */
  _triggerChangeStats(event, before, delta, after) {
    this.owner.triggerEvent('changestats', {
      timestamp: event ? event.timestamp : this.owner.currentTimestamp,
      type: 'changestats',
      sourceID: event ? event.sourceID : this.owner.playerId,
      targetID: this.owner.playerId,
      reason: event,
      before,
      delta,
      after,
    });
  }

  /**
   * Gets the actual stat value in whatever format it is.
   * a number value will be returned as is
   * a function value will be called with (selectedCombatant, itemDetails) and the result returned
   * an undefined stat will default to 0.
   */
  _getBuffValue(buffObj, statVal) {
    if (statVal === undefined) {
      return 0;
    } else if (typeof statVal === 'function') {
      const selectedCombatant = this.combatants.selected;
      let itemDetails;
      if (buffObj.itemId) {
        itemDetails = this.combatants.selected.getItem(buffObj.itemId);
        if (!itemDetails) {
          console.warn('Failed to retrieve item information for item with ID:', buffObj.itemId,
            ' ...unable to handle stats buff, making no stat change.');
          return 0;
        }
      }
      return statVal(selectedCombatant, itemDetails);
    } else {
      return statVal;
    }
  }

  _debugPrintStats(stats) {
    console.log(`StatTracker: ${formatMilliseconds(this.owner.fightDuration)} - ${this._statPrint(stats)}`);
  }

  _statPrint(stats) {
    return `STR=${stats.strength} AGI=${stats.agility} INT=${stats.intellect} STM=${stats.stamina} CRT=${stats.crit} HST=${stats.haste} MST=${stats.mastery} VRS=${stats.versatility} AVD=${this._currentStats.avoidance} LCH=${stats.leech} SPD=${stats.speed}`;
  }

}

export default StatTracker;
