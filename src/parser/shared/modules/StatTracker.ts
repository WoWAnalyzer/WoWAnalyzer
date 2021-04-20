import { formatMilliseconds } from 'common/format';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import { SpellInfo } from 'parser/core/EventFilter';
import Events, {
  CastEvent,
  ChangeBuffStackEvent,
  ChangeDebuffStackEvent,
  EventType,
  Event,
  HasAbility,
  HealEvent,
  Item,
  HasSource,
} from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import { calculateSecondaryStatDefault } from 'parser/core/stats';
import STAT from 'parser/shared/modules/features/STAT';

const ARMOR_INT_BONUS = 0.05;

const debug = false;

// TODO: stat constants somewhere else? they're largely copied from combatant
/**
 * The module in charge of tracking the player's stats over the course of an encounter.
 */
class StatTracker extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
  };

  protected eventEmitter!: EventEmitter;

  // These are multipliers to the stats applied *on pull* that are not
  // included in the stats reported by WCL. These are *baked in* and do
  // not multiply temporary buffs.
  //
  // In general, it looks like armor is the only one that isn't applied
  // by WCL.
  static SPEC_MULTIPLIERS = {
    [SPECS.BREWMASTER_MONK.id]: { armor: 1.25 },
  };

  static DEFAULT_BUFFS: StatBuffsByGuid = {
    // region Potions
    [SPELLS.POTION_OF_SPECTRAL_AGILITY.id]: { agility: 190 },
    [SPELLS.POTION_OF_SPECTRAL_INTELLECT.id]: { intellect: 190 },
    [SPELLS.POTION_OF_SPECTRAL_STRENGTH.id]: { strength: 190 },
    [SPELLS.POTION_OF_SPECTRAL_STAMINA.id]: { stamina: 285 },
    [SPELLS.POTION_OF_HARDENED_SHADOWS.id]: { armor: 275 },
    // endregion

    // region Runes
    [SPELLS.VEILED_AUGMENT_RUNE.id]: { strength: 18, agility: 18, intellect: 18 },
    // endregion

    //region Flasks
    [SPELLS.FLASK_OF_THE_CURRENTS.id]: { agility: 25 },
    [SPELLS.FLASK_OF_ENDLESS_FATHOMS.id]: { intellect: 25 },
    [SPELLS.FLASK_OF_THE_UNDERTOW.id]: { strength: 25 },
    [SPELLS.FLASK_OF_THE_VAST_HORIZON.id]: { stamina: 38 },
    [SPELLS.GREATER_FLASK_OF_THE_CURRENTS.id]: { agility: 38 },
    [SPELLS.GREATER_FLASK_OF_ENDLESS_FATHOMS.id]: { intellect: 38 },
    [SPELLS.GREATER_FLASK_OF_THE_UNDERTOW.id]: { strength: 38 },
    [SPELLS.GREATER_FLASK_OF_THE_VAST_HORIZON.id]: { stamina: 57 },
    [SPELLS.SPECTRAL_FLASK_OF_POWER.id]: { strength: 70, agility: 70, intellect: 70 },
    [SPELLS.SPECTRAL_FLASK_OF_STAMINA.id]: { stamina: 105 },
    // endregion

    //region Food
    [SPELLS.BOUNTIFUL_CAPTAIN_FEAST_INT.id]: { intellect: 15 },
    [SPELLS.BOUNTIFUL_CAPTAIN_FEAST_STR.id]: { strength: 15 },
    [SPELLS.BOUNTIFUL_CAPTAIN_FEAST_AGI.id]: { agility: 15 },
    [SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_INT.id]: { intellect: 16 },
    [SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_STR.id]: { strength: 16 },
    [SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_AGI.id]: { agility: 16 },
    [SPELLS.ABYSSAL_FRIED_RISSOLE.id]: { mastery: 14 },
    [SPELLS.BIL_TONG.id]: { versatility: 14 },
    [SPELLS.MECH_DOWELS_BIG_MECH.id]: { crit: 14 },
    [SPELLS.BAKED_PORT_TATO.id]: { haste: 14 },
    [SPELLS.FRAGRANT_KAKAVIA.id]: { stamina: 29 },
    [SPELLS.BORALUS_BLOOD_SAUSAGE_AGI.id]: { agility: 13 },
    [SPELLS.BORALUS_BLOOD_SAUSAGE_INT.id]: { intellect: 13 },
    [SPELLS.BORALUS_BLOOD_SAUSAGE_STR.id]: { strength: 13 },
    [SPELLS.WELL_FED_SEASONED_STEAK_AND_POTATOES.id]: { stamina: 22 },

    [SPELLS.PICKLED_MEAT_SMOOTHIE.id]: { stamina: 14 },
    [SPELLS.SWEET_SILVERGILL_SAUSAGES.id]: { versatility: 18 },
    [SPELLS.BUTTERSCOTCH_MARINATED_RIBS.id]: { crit: 18 },
    [SPELLS.MEATY_APPLE_DUMPLINGS.id]: { mastery: 18 },
    [SPELLS.CINNAMON_BONEFISH_STEW.id]: { haste: 18 },
    [SPELLS.BANANA_BEEF_PUDDING.id]: { stamina: 22 },
    [SPELLS.STEAK_A_LA_MODE.id]: { versatility: 30 },
    [SPELLS.TENEBROUS_CROWN_ROAST_ASPIC.id]: { haste: 30 },
    [SPELLS.SPINEFIN_SOUFFLE_AND_FRIES.id]: { crit: 30 },
    [SPELLS.IRIDESCENT_RAVIOLI_WITH_APPLE_SAUCE.id]: { mastery: 30 },
    [SPELLS.SURPRISINGLY_PALATABLE_FEAST_INT.id]: { intellect: 18 },
    [SPELLS.SURPRISINGLY_PALATABLE_FEAST_STR.id]: { strength: 18 },
    [SPELLS.SURPRISINGLY_PALATABLE_FEAST_AGI.id]: { agility: 18 },
    [SPELLS.FEAST_OF_GLUTTONOUS_HEDONISM_INT.id]: { intellect: 20 },
    [SPELLS.FEAST_OF_GLUTTONOUS_HEDONISM_STR.id]: { strength: 20 },
    [SPELLS.FEAST_OF_GLUTTONOUS_HEDONISM_AGI.id]: { agility: 20 },
    //endregion

    // region Misc
    [SPELLS.JACINS_RUSE.id]: { mastery: 48 },
    [SPELLS.MARK_OF_THE_CLAW.id]: { crit: 45, haste: 45 },
    // endregion

    // region Death Knight
    // endregion

    // region Druid
    [SPELLS.ASTRAL_HARMONY.id]: { mastery: 181 },
    // endregion

    // region Mage

    // endregion

    /****************************************\
     *               SHADOWLANDS:             *
     \****************************************/

    //Trinkets
    [SPELLS.INSCRUTABLE_QUANTUM_DEVICE_CRIT.id]: {
      itemId: ITEMS.INSCRUTABLE_QUANTUM_DEVICE.id,
      crit: (_, item) => calculateSecondaryStatDefault(184, 568, item.itemLevel),
    },
    [SPELLS.INSCRUTABLE_QUANTUM_DEVICE_HASTE.id]: {
      itemId: ITEMS.INSCRUTABLE_QUANTUM_DEVICE.id,
      haste: (_, item) => calculateSecondaryStatDefault(184, 568, item.itemLevel),
    },
    [SPELLS.INSCRUTABLE_QUANTUM_DEVICE_MASTERY.id]: {
      itemId: ITEMS.INSCRUTABLE_QUANTUM_DEVICE.id,
      mastery: (_, item) => calculateSecondaryStatDefault(184, 568, item.itemLevel),
    },
    [SPELLS.INSCRUTABLE_QUANTUM_DEVICE_VERS.id]: {
      itemId: ITEMS.INSCRUTABLE_QUANTUM_DEVICE.id,
      versatility: (_, item) => calculateSecondaryStatDefault(184, 568, item.itemLevel),
    },
    [SPELLS.BLOOD_WALTZ_HASTE_BUFF.id]: {
      itemId: ITEMS.MACABRE_SHEET_MUSIC.id,
      haste: (_, item) => calculateSecondaryStatDefault(213, 95, item.itemLevel),
    },

    //endregion
    //endregion

    // region Racials
    // Mag'har Orc
    [SPELLS.RICTUS_OF_THE_LAUGHING_SKULL.id]: { crit: 125 },
    [SPELLS.ZEAL_OF_THE_BURNING_BLADE.id]: { haste: 125 },
    [SPELLS.FEROCITY_OF_THE_FROSTWOLF.id]: { mastery: 125 },
    [SPELLS.MIGHT_OF_THE_BLACKROCK.id]: { versatility: 125 },
    // endregion
  };

  // all known stat buffs
  statBuffs: StatBuffsByGuid;
  // the player's stat ratings at pull
  _pullStats: PlayerStats;
  // the player's 'current' stat ratings
  _currentStats: PlayerStats;

  playerMultipliers: PlayerMultipliers = {
    strength: 1,
    agility: 1,
    intellect: 1,
    stamina: 1,
    crit: 1,
    haste: 1, // should usually be done through the haste module
    mastery: 1,
    versatility: 1,
    avoidance: 1,
    leech: 1,
    speed: 1,
    armor: 1,
  };

  statMultiplierBuffs: StatMultipliersByGuid = {
    [SPELLS.ARCANE_INTELLECT.id]: { intellect: 1.05 },
    [SPELLS.BATTLE_SHOUT.id]: { strength: 1.05, agility: 1.05 },
  };

  //Values taken from https://github.com/simulationcraft/simc/blob/shadowlands/engine/dbc/generated/sc_scale_data.inc
  statBaselineRatingPerPercent = {
    /** Secondaries */
    [STAT.CRITICAL_STRIKE]: 35,
    [STAT.HASTE]: 33,
    [STAT.MASTERY]: 35,
    [STAT.VERSATILITY]: 40,
    /** Tertiaries */
    [STAT.AVOIDANCE]: 14,
    [STAT.LEECH]: 21,
    [STAT.SPEED]: 10,
  };

  /** Secondary stat scaling thresholds
   * Taken from https://raw.githubusercontent.com/simulationcraft/simc/shadowlands/engine/dbc/generated/item_scaling.inc
   * Search for 21024 in the first column for secondary stat scaling
   */
  secondaryStatPenaltyThresholds: PenaltyThreshold[] = [
    /** Secondary stat scaling thresholds */
    { base: 0, scaled: 0, penaltyAboveThis: 0 },
    { base: 0.3, scaled: 0.3, penaltyAboveThis: 0.1 },
    { base: 0.4, scaled: 0.39, penaltyAboveThis: 0.2 },
    { base: 0.5, scaled: 0.47, penaltyAboveThis: 0.3 },
    { base: 0.6, scaled: 0.54, penaltyAboveThis: 0.4 },
    { base: 0.8, scaled: 0.66, penaltyAboveThis: 0.5 },
    { base: 1, scaled: 0.76, penaltyAboveThis: 0.5 },
    { base: 2, scaled: 1.26, penaltyAboveThis: 1 },
  ];

  /** Tertiary stat scaling thresholds
   * Taken from https://raw.githubusercontent.com/simulationcraft/simc/shadowlands/engine/dbc/generated/item_scaling.inc
   * Search for 21025 in the first column for tertiary stat scaling
   */
  tertiaryStatPenaltyThresholds: PenaltyThreshold[] = [
    /** Tertiary stat scaling thresholds */
    { base: 0, scaled: 0, penaltyAboveThis: 0 },
    { base: 0.05, scaled: 0.05, penaltyAboveThis: 0 },
    { base: 0.1, scaled: 0.1, penaltyAboveThis: 0 },
    { base: 0.15, scaled: 0.14, penaltyAboveThis: 0.2 },
    { base: 0.2, scaled: 0.17, penaltyAboveThis: 0.4 },
    { base: 0.25, scaled: 0.19, penaltyAboveThis: 0.6 },
    { base: 1, scaled: 0.49, penaltyAboveThis: 1 },
  ];

  constructor(options: Options) {
    super(options);
    // TODO: Use combatantinfo event directly
    this._pullStats = {
      strength: this.selectedCombatant._combatantInfo.strength,
      agility: this.selectedCombatant._combatantInfo.agility,
      intellect: this.selectedCombatant._combatantInfo.intellect,
      stamina: this.selectedCombatant._combatantInfo.stamina,
      crit: this.selectedCombatant._combatantInfo.critSpell,
      haste: this.selectedCombatant._combatantInfo.hasteSpell || 0, // the || 0 fixes tests where combatantinfo may not be defined
      mastery: this.selectedCombatant._combatantInfo.mastery,
      versatility: this.selectedCombatant._combatantInfo.versatilityHealingDone,
      avoidance: this.selectedCombatant._combatantInfo.avoidance,
      leech: this.selectedCombatant._combatantInfo.leech,
      speed: this.selectedCombatant._combatantInfo.speed,
      armor: this.selectedCombatant._combatantInfo.armor,
    };

    this.applySpecModifiers();

    this.statBuffs = {
      ...StatTracker.DEFAULT_BUFFS,
    };

    this._currentStats = {
      ...this._pullStats,
    };

    // Really hoping people don't run around with wrong armor types
    this.addStatMultiplier({
      intellect: 1 + ARMOR_INT_BONUS,
      strength: 1 + ARMOR_INT_BONUS,
      agility: 1 + ARMOR_INT_BONUS,
    });

    this.addEventListener(Events.changebuffstack.to(SELECTED_PLAYER), this.onChangeBuffStack);
    this.addEventListener(Events.changedebuffstack.to(SELECTED_PLAYER), this.onChangeDebuffStack);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHealTaken);

    debug && this._debugPrintStats(this._currentStats);
  }

  /**
   * Adds a stat buff to StatTracker.
   * @param buffId Spell or ID of the stat buff
   * @param stats Object with stats (intellect, mastery, haste, crit etc.) and their respective bonus (either fixed value or a function (combatant, item) => value). If it's from item, provide also an itemId (item in the stat callback is taken from this itemId).
   */
  add(buffId: number | SpellInfo, stats: StatBuff): void {
    if (!buffId || !stats) {
      throw new Error(`StatTracker.add() called with invalid buffId ${buffId} or stats`);
    }
    if (typeof buffId === 'object') {
      buffId = buffId.id;
    }
    if (this.statBuffs[buffId]) {
      throw new Error(`Stat buff with ID ${buffId} already exists`);
    }
    // if any stat's function uses the item argument, validate that itemId property exists
    debug && this.log(`StatTracker.add(), buffId: ${buffId}, stats:`, stats);
    const usesItemArgument = Object.values(stats).some(
      (value) => typeof value === 'function' && value.length === 2,
    );
    if (usesItemArgument && !stats.itemId) {
      throw new Error(`Stat buff ${buffId} uses item argument, but does not provide item ID`);
    }
    this.statBuffs[buffId] = stats;
  }

  /**
   * Update a stat buff in StatTracker.
   * @param buffId Spell or ID of the stat buff
   * @param stats Object with stats (intellect, mastery, haste, crit etc.) and their respective bonus (either fixed value or a function (combatant, item) => value). If it's from item, provide also an itemId (item in the stat callback is taken from this itemId).
   */
  update(buffId: number | SpellInfo, stats: StatBuff): void {
    if (!buffId || !stats) {
      throw new Error(`StatTracker.update() called with invalid buffId ${buffId} or stats`);
    }
    if (typeof buffId === 'object') {
      buffId = buffId.id;
    }
    if (!this.statBuffs[buffId]) {
      throw new Error(
        `Stat buff with ID ${buffId} doesn't exist, so it can't be updated - remember to add it first!`,
      );
    }
    debug && this.log(`StatTracker.update(), buffId: ${buffId}, stats:`, stats);
    const usesItemArgument = Object.values(stats).some(
      (value) => typeof value === 'function' && value.length === 2,
    );
    if (usesItemArgument && !stats.itemId) {
      throw new Error(`Stat buff ${buffId} uses item argument, but does not provide item ID`);
    }
    this.statBuffs[buffId] = stats;
  }

  /**
   * Adds a stat multiplier to tracking
   */
  addStatMultiplier(statMult: StatMultiplier, changeCurrentStats: boolean = false): void {
    const delta: StatBuff = {};
    Object.entries(statMult).forEach(([stat, multiplier]: [string, number | undefined]) => {
      if (multiplier === undefined) {
        return;
      }
      const statKey = stat as keyof Stats;

      const before: number = this.playerMultipliers[statKey];
      this.playerMultipliers[statKey] *= multiplier;

      debug &&
        console.log(
          `StatTracker: ${stat} multiplier change (${before.toFixed(2)} -> ${this.playerMultipliers[
            statKey
          ].toFixed(2)}) @ ${formatMilliseconds(this.owner.fightDuration)}`,
        );

      if (changeCurrentStats) {
        const curr: number = this._currentStats[statKey];
        delta[statKey] = Math.round(curr * multiplier - curr);
      }
    });

    changeCurrentStats && this.forceChangeStats(delta, null, true);
  }

  /**
   * Removes a stat multiplier from tracking
   */
  removeStatMultiplier(statMult: StatMultiplier, changeCurrentStats: boolean = false): void {
    const delta: StatBuff = {};
    Object.entries(statMult).forEach(([stat, multiplier]: [string, number | undefined]) => {
      if (multiplier === undefined) {
        return;
      }
      const statKey = stat as keyof Stats;

      const before: number = this.playerMultipliers[statKey];
      this.playerMultipliers[statKey] /= multiplier;

      debug &&
        console.log(
          `StatTracker: ${stat} multiplier change (${before.toFixed(2)} -> ${this.playerMultipliers[
            statKey
          ].toFixed(2)}) @ ${formatMilliseconds(this.owner.fightDuration)}`,
        );

      if (changeCurrentStats) {
        const curr: number = this._currentStats[statKey];
        delta[statKey] = Math.round(curr / multiplier - curr);
      }
    });

    changeCurrentStats && this.forceChangeStats(delta, null, true);
  }

  applySpecModifiers(): void {
    const modifiers: StatMultiplier =
      StatTracker.SPEC_MULTIPLIERS[this.selectedCombatant.spec.id] || {};
    Object.entries(modifiers).forEach(([stat, multiplier]: [string, number | undefined]) => {
      if (multiplier !== undefined) {
        this._pullStats[stat as keyof Stats] *= multiplier;
      }
    });
  }

  /*
   * Stat rating at pull.
   * Should be identical to what you get from Combatant.
   */
  get startingStrengthRating(): number {
    return this._pullStats.strength;
  }

  get startingAgilityRating(): number {
    return this._pullStats.agility;
  }

  get startingIntellectRating(): number {
    return this._pullStats.intellect;
  }

  get startingStaminaRating(): number {
    return this._pullStats.stamina;
  }

  get startingCritRating(): number {
    return this._pullStats.crit;
  }

  get startingHasteRating(): number {
    return this._pullStats.haste;
  }

  get startingMasteryRating(): number {
    return this._pullStats.mastery;
  }

  get startingVersatilityRating(): number {
    return this._pullStats.versatility;
  }

  get startingAvoidanceRating(): number {
    return this._pullStats.avoidance;
  }

  get startingLeechRating(): number {
    return this._pullStats.leech;
  }

  get startingSpeedRating(): number {
    return this._pullStats.speed;
  }

  get startingArmorRating(): number {
    return this._pullStats.armor;
  }

  /*
   * Current stat rating, as tracked by this module.
   */
  get currentStrengthRating(): number {
    return this._currentStats.strength;
  }

  get currentAgilityRating(): number {
    return this._currentStats.agility;
  }

  get currentIntellectRating(): number {
    return this._currentStats.intellect;
  }

  get currentStaminaRating(): number {
    return this._currentStats.stamina;
  }

  get currentCritRating(): number {
    return this._currentStats.crit;
  }

  get currentHasteRating(): number {
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

  get currentArmorRating() {
    return this._currentStats.armor;
  }

  /*
   * For percentage stats, the percentage you'd have with zero rating.
   * These values don't change.
   */
  get baseCritPercentage() {
    let critChance = 0.05;
    if (this.selectedCombatant.race === RACES.BloodElf) {
      critChance += 0.01;
    }
    switch (this.selectedCombatant.spec) {
      case SPECS.FIRE_MAGE:
        return critChance + 0.15; // an additional 15% is gained from the passive Critical Mass
      case SPECS.HAVOC_DEMON_HUNTER:
      case SPECS.VENGEANCE_DEMON_HUNTER:
      case SPECS.GUARDIAN_DRUID:
      case SPECS.FERAL_DRUID:
      case SPECS.SURVIVAL_HUNTER:
      case SPECS.BEAST_MASTERY_HUNTER:
      case SPECS.MARKSMANSHIP_HUNTER:
      case SPECS.BREWMASTER_MONK:
      case SPECS.WINDWALKER_MONK:
      case SPECS.ENHANCEMENT_SHAMAN:
      case SPECS.SUBTLETY_ROGUE:
      case SPECS.ASSASSINATION_ROGUE:
      case SPECS.OUTLAW_ROGUE:
        return critChance + 0.05; //baseline +5%
      default:
        return critChance;
    }
  }

  get baseHastePercentage() {
    return 0;
  }

  get baseMasteryPercentage() {
    const spellPoints = 8; // Spellpoint is a unit of mastery, each class has 8 base Spellpoints
    return (spellPoints * this.selectedCombatant.spec.masteryCoefficient) / 100;
  }

  get hasMasteryCoefficient() {
    if (!this.selectedCombatant.spec || !this.selectedCombatant.spec.masteryCoefficient) {
      return null;
    }
    return this.selectedCombatant.spec.masteryCoefficient;
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
   * For percentage stats, the current stat percentage gained from stat ratings.
   */

  /**
   * This function handles the diminishing returns system for stats implemented in Shadowlands.
   * It will return either current stat percentage gained from rating OR the rating needed for 1% at current rating amounts
   *
   * @param rating - number -- The current rating the player has.
   * @param baselineRatingPerPercent - number -- The baseline rating needing for 1% before any penalties.
   * @param returnRatingForNextPercent - boolean -- Whether this function should return the rating needed for 1% at current rating levels or not
   * @param isSecondary - boolean -- Whether we are calculating a secondary or tertiary stat
   * @param coef - number -- Any stat coefficient, currently only used for Mastery.
   * @returns {number}
   */
  calculateStatPercentage(
    rating: number,
    baselineRatingPerPercent: number,
    returnRatingForNextPercent: boolean = false,
    isSecondary: boolean = true,
    coef: number = 1,
  ): number {
    //Which penalty thresholds we should use based on type of stat
    const penaltyThresholds = isSecondary
      ? this.secondaryStatPenaltyThresholds
      : this.tertiaryStatPenaltyThresholds;
    //The percentage of stats we would have if diminishing return was not a thing
    const baselinePercent = rating / baselineRatingPerPercent / 100;
    //If we have more stats baseline than the threshold where we can no longer gain stat percentages from ratings
    if (baselinePercent > penaltyThresholds[penaltyThresholds.length - 1].base) {
      if (returnRatingForNextPercent) {
        //At this point we can't gain more % of the given stat from rating
        return Infinity;
      } else {
        //We are at the maximum % so we use the maximum scaled value and multiply it by the coefficient
        return penaltyThresholds[penaltyThresholds.length - 1].scaled * coef;
      }
    }
    // TODO surely there's a prettier way than an indexed for loop
    //Loop through each of our penaltythresholds until we find the first one where we have more baseline stats than that curvepoint
    // eslint-disable-next-line no-plusplus
    for (let idx = 0; idx < penaltyThresholds.length; idx++) {
      //If we have a higher percent than the baseline, we can move on immediately
      if (baselinePercent >= penaltyThresholds[idx].base) {
        continue;
      }
      if (returnRatingForNextPercent) {
        //Returns the rating needed for 1% at current rating levels
        return (
          (baselineRatingPerPercent / (1 - penaltyThresholds[idx - 1].penaltyAboveThis) / coef) *
          100
        );
      } else {
        //Since we no longer have more base stats than the current curve point, we know that we atleast have the scaled value of the last curve point
        const statFromLastCurvePoint = penaltyThresholds[idx - 1].scaled;
        //Using the known stat from last curve point, we can calculate the remaining stat gain by subtracting the last curve point from our baseline percentage and multiplying it by (1-penalty) of the penalty applied to stats from the last curve point.
        const calculateStatGainWithinCurrentCurvePoint =
          (baselinePercent - penaltyThresholds[idx - 1].base) *
          (1 - penaltyThresholds[idx - 1].penaltyAboveThis);
        return (statFromLastCurvePoint + calculateStatGainWithinCurrentCurvePoint) * coef;
      }
    }
    console.error('Unreachable code hit??');
    return Infinity; // should be unreachable, but just in case
  }

  /**
   * This function makes it easier to utilize calculateStatPercentage to get the rating needed for 1% at current rating levels
   *
   * @param rating - number -- The current rating the player has.
   * @param baselineRatingPerPercent - number -- The baseline rating needing for 1% before any penalties.
   * @param coef - number -- Any stat coefficient, currently only used for Mastery.
   * @param isSecondary - boolean -- Whether we are calculating a secondary or tertiary stat
   * @returns {number}
   */
  ratingNeededForNextPercentage(
    rating: number,
    baselineRatingPerPercent: number,
    coef: number = 1,
    isSecondary: boolean = true,
  ) {
    return this.calculateStatPercentage(rating, baselineRatingPerPercent, true, isSecondary, coef);
  }

  /*
   * For percentage stats, returns the combined base stat values and the values gained from ratings -- this does not include percentage increases such as Bloodlust
   */
  critPercentage(rating: number, withBase = false): number {
    return (
      (withBase ? this.baseCritPercentage : 0) +
      this.calculateStatPercentage(rating, this.statBaselineRatingPerPercent[STAT.CRITICAL_STRIKE])
    );
  }

  hastePercentage(rating: number, withBase = false): number {
    return (
      (withBase ? this.baseHastePercentage : 0) +
      this.calculateStatPercentage(rating, this.statBaselineRatingPerPercent[STAT.HASTE])
    );
  }

  masteryPercentage(rating: number, withBase = false): number {
    return (
      (withBase ? this.baseMasteryPercentage : 0) +
      this.calculateStatPercentage(
        rating,
        this.statBaselineRatingPerPercent[STAT.MASTERY],
        false,
        true,
        this.selectedCombatant.spec.masteryCoefficient,
      )
    );
  }

  versatilityPercentage(rating: number, withBase = false): number {
    return (
      (withBase ? this.baseVersatilityPercentage : 0) +
      this.calculateStatPercentage(rating, this.statBaselineRatingPerPercent[STAT.VERSATILITY])
    );
  }

  avoidancePercentage(rating: number, withBase = false) {
    return (
      (withBase ? this.baseAvoidancePercentage : 0) +
      this.calculateStatPercentage(
        rating,
        this.statBaselineRatingPerPercent[STAT.AVOIDANCE],
        false,
        false,
      )
    );
  }

  leechPercentage(rating: number, withBase = false): number {
    return (
      (withBase ? this.baseLeechPercentage : 0) +
      this.calculateStatPercentage(
        rating,
        this.statBaselineRatingPerPercent[STAT.LEECH],
        false,
        false,
      )
    );
  }

  speedPercentage(rating: number, withBase: boolean = false): number {
    return (
      (withBase ? this.baseSpeedPercentage : 0) +
      this.calculateStatPercentage(
        rating,
        this.statBaselineRatingPerPercent[STAT.SPEED],
        false,
        false,
      )
    );
  }

  /*
   * For percentage stats, the current stat percentage as tracked by this module.
   */
  get currentCritPercentage(): number {
    return this.critPercentage(this.currentCritRating, true);
  }

  // This is only the percentage from BASE + RATING.
  // If you're looking for current haste percentage including buffs like Bloodlust, check the Haste module.
  get currentHastePercentage(): number {
    return this.hastePercentage(this.currentHasteRating, true);
  }

  get currentMasteryPercentage(): number {
    return this.masteryPercentage(this.currentMasteryRating, true);
  }

  get currentVersatilityPercentage(): number {
    return this.versatilityPercentage(this.currentVersatilityRating, true);
  }

  get currentAvoidancePercentage(): number {
    return this.avoidancePercentage(this.currentAvoidanceRating, true);
  }

  get currentLeechPercentage(): number {
    return this.leechPercentage(this.currentLeechRating, true);
  }

  get currentSpeedPercentage(): number {
    return this.speedPercentage(this.currentSpeedRating, true);
  }

  onChangeBuffStack(event: ChangeBuffStackEvent) {
    this._changeBuffStack(event);
  }

  onChangeDebuffStack(event: ChangeDebuffStackEvent) {
    this._changeBuffStack(event);
  }

  /*
   * Cast and Heal events include player's spellpower which translates directly to player's int.
   * This can be used to "check our work" with regards to tracked int.
   */
  onCast(event: CastEvent) {
    this._updateIntellect(event);
  }

  onHealTaken(event: HealEvent) {
    this._updateIntellect(event);
  }

  _updateIntellect(event: HealEvent | CastEvent): void {
    // updates intellect values directly from game events
    if (!event.spellPower) {
      return;
    }
    const currentIntellect = this.currentIntellectRating;
    const actualIntellect = event.spellPower;
    if (currentIntellect !== actualIntellect) {
      debug &&
        this.error(
          `Intellect rating calculated with StatTracker is different from actual Intellect from events! StatTracker: ${currentIntellect}, actual: ${actualIntellect}`,
        );
      const delta = actualIntellect - currentIntellect;
      this.forceChangeStats({ intellect: delta }, null, true);
    }
  }

  /**
   * This interface allows an external analyzer to force a stat change.
   * It should ONLY be used if a stat buff is so non-standard that it can't be handled by the buff format in this module.
   * change is a stat buff object just like those in the DEFAULT_BUFFS structure above, it is required.
   * eventReason is the WCL event object that caused this change, it is not required.
   */
  // For an example of how / why this function would be used, see the CharmOfTheRisingTide module.
  forceChangeStats(
    change: StatBuff,
    eventReason: Event<EventType> | null,
    withoutMultipliers = false,
  ): void {
    const before: PlayerStats = Object.assign({}, this._currentStats);
    const delta = this._changeStats(change, 1, withoutMultipliers);
    const after: PlayerStats = Object.assign({}, this._currentStats);
    if (debug) {
      const spellName =
        eventReason && HasAbility(eventReason) ? eventReason.ability.name : 'unspecified';
      console.log(
        `StatTracker: FORCED CHANGE from ${spellName} - Change: ${this._statPrint(delta)}`,
      );
      debug && this._debugPrintStats(this._currentStats);
    }
    this._triggerChangeStats(eventReason, before, delta, after);
  }

  _changeBuffStack(event: ChangeBuffStackEvent | ChangeDebuffStackEvent): void {
    const spellId = event.ability.guid;
    const statBuff: StatBuff = this.statBuffs[spellId];
    const statMult: StatMultiplier = this.statMultiplierBuffs[spellId];
    if (statBuff) {
      // ignore prepull buff application, as they're already accounted for in combatantinfo
      // we have to check the stacks count because Entities incorrectly copies the prepull property onto changes and removal following the application
      if (event.prepull && event.oldStacks === 0) {
        debug &&
          console.log(
            `StatTracker prepull application IGNORED for ${
              SPELLS[spellId] ? SPELLS[spellId].name : spellId
            }`,
          );
        return;
      }

      const before = Object.assign({}, this._currentStats);
      const delta = this._changeStats(statBuff, event.newStacks - event.oldStacks);
      const after = Object.assign({}, this._currentStats);
      debug &&
        console.log(
          `StatTracker: (${event.oldStacks} -> ${event.newStacks}) ${
            SPELLS[spellId] ? SPELLS[spellId].name : spellId
          } @ ${formatMilliseconds(this.owner.fightDuration)} - Change: ${this._statPrint(delta)}`,
        );
      debug && this._debugPrintStats(this._currentStats);
      this._triggerChangeStats(event, before, delta, after);
    }
    if (statMult) {
      // ignore prepull buff application, as they're already accounted for in combatantinfo
      // we have to check the stacks count because Entities incorrectly copies the prepull property onto changes and removal following the application
      if (event.prepull && event.oldStacks === 0) {
        debug &&
          console.log(
            `StatTracker prepull application IGNORED for ${
              SPELLS[spellId] ? SPELLS[spellId].name : spellId
            }`,
          );
        this.addStatMultiplier(statMult);
        return;
      }
      if (event.newStacks > event.oldStacks) {
        this.addStatMultiplier(statMult, true);
      } else if (event.newStacks < event.oldStacks) {
        this.removeStatMultiplier(statMult, true);
      }
    }
  }

  // withoutMultipliers should be a rare exception where you have already buffed values
  _changeStats(change: StatBuff, factor: number, withoutMultipliers: boolean = false): PlayerStats {
    const delta = {
      strength: this.getBuffValue(change, change.strength) * factor,
      agility: this.getBuffValue(change, change.agility) * factor,
      intellect: this.getBuffValue(change, change.intellect) * factor,
      stamina: this.getBuffValue(change, change.stamina) * factor,
      crit: this.getBuffValue(change, change.crit) * factor,
      haste: this.getBuffValue(change, change.haste) * factor,
      mastery: this.getBuffValue(change, change.mastery) * factor,
      versatility: this.getBuffValue(change, change.versatility) * factor,
      avoidance: this.getBuffValue(change, change.avoidance) * factor,
      leech: this.getBuffValue(change, change.leech) * factor,
      speed: this.getBuffValue(change, change.speed) * factor,
      armor: this.getBuffValue(change, change.armor) * factor,
    };

    Object.keys(this._currentStats).forEach((stat: string) => {
      const statKey = stat as keyof Stats;
      this._currentStats[statKey] += withoutMultipliers
        ? delta[statKey]
        : Math.round(delta[statKey] * this.playerMultipliers[statKey]);
    });

    return delta;
  }

  /**
   * Fabricates an event indicating when stats change
   */
  _triggerChangeStats(
    event: Event<EventType> | null,
    before: Stats,
    delta: Stats,
    after: Stats,
  ): void {
    const fabricatedEvent = {
      type: EventType.ChangeStats,
      sourceID: event !== null && HasSource(event) ? event.sourceID : this.owner.playerId,
      targetID: this.owner.playerId,
      targetIsFriendly: true,
      before,
      delta,
      after,
    };
    this.eventEmitter.fabricateEvent(fabricatedEvent, event);
  }

  /**
   * Gets the actual buff value in whatever format it is.
   * a number value will be returned as is
   * a function value will be called with (selectedCombatant, itemDetails) and the result returned
   * an undefined value will default to 0.
   */
  getBuffValue(buffObj: StatBuff, buffVal: BuffVal | undefined): number {
    if (buffVal === undefined) {
      return 0;
    } else if (typeof buffVal === 'function') {
      const selectedCombatant = this.selectedCombatant;
      let itemDetails: Item | undefined;
      if (buffObj.itemId) {
        itemDetails = this.selectedCombatant.getItem(buffObj.itemId);
        if (itemDetails) {
          return buffVal(selectedCombatant, itemDetails);
        } else {
          console.warn(
            'Failed to retrieve item information for item with ID:',
            buffObj.itemId,
            ' ...unable to handle stats buff, making no stat change.',
          );
        }
      }
      return 0;
    } else {
      return buffVal; // is raw number
    }
  }

  _debugPrintStats(stats: PlayerStats) {
    console.log(
      `StatTracker: ${formatMilliseconds(this.owner.fightDuration)} - ${this._statPrint(stats)}`,
    );
  }

  _statPrint(stats: PlayerStats) {
    return `STR=${stats.strength} AGI=${stats.agility} INT=${stats.intellect} STM=${stats.stamina} CRT=${stats.crit} HST=${stats.haste} MST=${stats.mastery} VRS=${stats.versatility} AVD=${this._currentStats.avoidance} LCH=${stats.leech} SPD=${stats.speed} ARMOR=${this._currentStats.armor}`;
  }
}

/**
 * TODO better docs for this object once I understand how it works
 */
export interface PenaltyThreshold {
  base: number;
  scaled: number;
  penaltyAboveThis: number;
}

/**
 * A base interface listing all player stats
 */
export interface Stats {
  strength: number;
  agility: number;
  intellect: number;
  stamina: number;
  crit: number;
  haste: number;
  mastery: number;
  versatility: number;
  avoidance: number;
  leech: number;
  speed: number;
  armor: number;
}

/**
 * A player's total stat ratings
 */
export type PlayerStats = Stats;

/**
 * A player's total stat multipliers
 */
export type PlayerMultipliers = Stats;

/**
 * StatBuff values can be represented as a static value
 * or as a dynamically generated value using the combatant and item
 * (typically an item buff will have power based on its ilvl)
 */
export type BuffVal = number | ((s: Combatant, t: Item) => number);

/**
 * A buff that boosts player stats.
 * 'itemId' need only be filled in for an item based buff, when we will need the ID for the BuffVal callback.
 */
export type StatBuff = Partial<Record<keyof Stats, BuffVal>> & { itemId?: number };

/**
 * StatBuffs mapped by their guid
 */
export type StatBuffsByGuid = { [key: string]: StatBuff };

/**
 * A buff or effect that multiplies stats (as opposed to adding)
 */
export type StatMultiplier = Partial<Stats>;

/**
 * StatMultipliers mapped by their guid
 */
export type StatMultipliersByGuid = { [key: string]: StatMultiplier };

export default StatTracker;
