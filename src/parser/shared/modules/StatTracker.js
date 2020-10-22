import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import { calculateSecondaryStatDefault, calculatePrimaryStat } from 'common/stats';
import { formatMilliseconds } from 'common/format';
import SPECS from 'game/SPECS';
import RACES from 'game/RACES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Events, { EventType } from 'parser/core/Events';
import STAT from 'parser/shared/modules/features/STAT';

const ARMOR_INT_BONUS = .05;

const debug = false;

// TODO: stat constants somewhere else? they're largely copied from combatant
class StatTracker extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
  };

  // These are multipliers to the stats applied *on pull* that are not
  // included in the stats reported by WCL. These are *baked in* and do
  // not multiply temporary buffs.
  //
  // In general, it looks like armor is the only one that isn't applied
  // by WCL.
  static SPEC_MULTIPLIERS = {
    [SPECS.BREWMASTER_MONK.id]: { armor: 1.25 },
  };

  static DEFAULT_BUFFS = {
    // region Potions
    [SPELLS.POTION_OF_PROLONGED_POWER.id]: { stamina: 113, strength: 113, agility: 113, intellect: 113 },
    [SPELLS.BATTLE_POTION_OF_STRENGTH.id]: { strength: 900 },
    [SPELLS.BATTLE_POTION_OF_INTELLECT.id]: { intellect: 900 },
    [SPELLS.BATTLE_POTION_OF_AGILITY.id]: { agility: 900 },
    [SPELLS.BATTLE_POTION_OF_STAMINA.id]: { stamina: 1100 },
    [SPELLS.STEELSKIN_POTION.id]: { armor: 900 },
    [SPELLS.SUPERIOR_BATTLE_POTION_OF_STRENGTH.id]: { strength: 1215 },
    [SPELLS.SUPERIOR_BATTLE_POTION_OF_AGILITY.id]: { agility: 1215 },
    [SPELLS.SUPERIOR_BATTLE_POTION_OF_INTELLECT.id]: { intellect: 1215 },
    [SPELLS.SUPERIOR_BATTLE_POTION_OF_STAMINA.id]: { stamina: 1485 },
    [SPELLS.SUPERIOR_STEELSKIN_POTION.id]: { armor: 1215 },
    // endregion

    // region Runes
    [SPELLS.DEFILED_AUGMENT_RUNE.id]: { strength: 15, agility: 15, intellect: 15 },
    // endregion

    //region Flasks
    [SPELLS.FLASK_OF_THE_WHISPERED_PACT.id]: { intellect: 59 },
    [SPELLS.FLASK_OF_THE_SEVENTH_DEMON.id]: { agility: 59 },
    [SPELLS.FLASK_OF_THE_COUNTLESS_ARMIES.id]: { strength: 59 },
    [SPELLS.FLASK_OF_TEN_THOUSAND_SCARS.id]: { stamina: 88 },
    [SPELLS.FLASK_OF_THE_CURRENTS.id]: { agility: 238 },
    [SPELLS.FLASK_OF_ENDLESS_FATHOMS.id]: { intellect: 238 },
    [SPELLS.FLASK_OF_THE_UNDERTOW.id]: { strength: 238 },
    [SPELLS.FLASK_OF_THE_VAST_HORIZON.id]: { stamina: 357 },
    [SPELLS.GREATER_FLASK_OF_THE_CURRENTS.id]: { agility: 360 },
    [SPELLS.GREATER_FLASK_OF_ENDLESS_FATHOMS.id]: { intellect: 360 },
    [SPELLS.GREATER_FLASK_OF_THE_UNDERTOW.id]: { strength: 360 },
    [SPELLS.GREATER_FLASK_OF_THE_VAST_HORIZON.id]: { stamina: 540 },
    // endregion

    //region Food
    [SPELLS.THE_HUNGRY_MAGISTER.id]: { crit: 17 },
    [SPELLS.AZSHARI_SALAD.id]: { haste: 17 },
    [SPELLS.NIGHTBORNE_DELICACY_PLATTER.id]: { mastery: 17 },
    [SPELLS.SEED_BATTERED_FISH_PLATE.id]: { versatility: 17 },
    [SPELLS.STAM_FEAST.id]: { stamina: 27 },
    [SPELLS.STR_FEAST.id]: { strength: 23 },
    [SPELLS.AGI_FEAST.id]: { agility: 23 },
    [SPELLS.INT_FEAST.id]: { intellect: 23 },
    [SPELLS.DARKMOON_VERS_FOOD.id]: { versatility: 45 },
    [SPELLS.KUL_TIRAMISU.id]: { crit: 41 },
    [SPELLS.LOA_LEAF.id]: { mastery: 41 },
    [SPELLS.RAVENBERRY_TARTS.id]: { haste: 41 },
    [SPELLS.MON_DAZI.id]: { versatility: 41 },
    [SPELLS.HONEY_GLAZED_HAUNCHES.id]: { crit: 55 },
    [SPELLS.SAILOR_PIE.id]: { mastery: 55 },
    [SPELLS.SWAMP_FISH_N_CHIPS.id]: { haste: 55 },
    [SPELLS.SPICED_SNAPPER.id]: { versatility: 55 },
    [SPELLS.GALLEY_BANQUET_INT.id]: { intellect: 75 },
    [SPELLS.GALLEY_BANQUET_STR.id]: { strength: 75 },
    [SPELLS.GALLEY_BANQUET_AGI.id]: { agility: 75 },
    [SPELLS.GALLEY_BANQUET_STA.id]: { stamina: 113 },
    [SPELLS.WELL_FED_WILD_BERRY_BREAD.id]: { stamina: 113 },
    [SPELLS.BOUNTIFUL_CAPTAIN_FEAST_INT.id]: { intellect: 100 },
    [SPELLS.BOUNTIFUL_CAPTAIN_FEAST_STR.id]: { strength: 100 },
    [SPELLS.BOUNTIFUL_CAPTAIN_FEAST_AGI.id]: { agility: 100 },
    [SPELLS.BOUNTIFUL_CAPTAIN_FEAST_STA.id]: { stamina: 150 },
    [SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_INT.id]: { intellect: 131 },
    [SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_STR.id]: { strength: 131 },
    [SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_AGI.id]: { agility: 131 },
    [SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_STA.id]: { stamina: 198 },
    [SPELLS.ABYSSAL_FRIED_RISSOLE.id]: { mastery: 93 },
    [SPELLS.BIL_TONG.id]: { versatility: 93 },
    [SPELLS.MECH_DOWELS_BIG_MECH.id]: { crit: 93 },
    [SPELLS.BAKED_PORT_TATO.id]: { haste: 93 },
    [SPELLS.FRAGRANT_KAKAVIA.id]: { stamina: 198 },
    [SPELLS.BORALUS_BLOOD_SAUSAGE_AGI.id]: { agility: 85 },
    [SPELLS.BORALUS_BLOOD_SAUSAGE_INT.id]: { intellect: 85 },
    [SPELLS.BORALUS_BLOOD_SAUSAGE_STR.id]: { strength: 85 },
    [SPELLS.WELL_FED_REAWAKENING_INT.id]: { intellect: 60 },
    [SPELLS.WELL_FED_REAWAKENING_STR.id]: { strength: 60 },
    [SPELLS.WELL_FED_REAWAKENING_AGI.id]: { agility: 60 },
    [SPELLS.WELL_FED_SEASONED_STEAK_AND_POTATOES.id]: { stamina: 150 },
    //endregion

    // BFA quests
    [SPELLS.DIEMETRADON_FRENZY.id]: {
      itemId: ITEMS.ENGRANGED_DIEMETRADON_FIN.id,
      haste: (_, item) => calculateSecondaryStatDefault(172, 159, item.itemLevel),
    },
    [SPELLS.WILL_OF_THE_LOA.id]: {
      itemId: ITEMS.GILDED_LOA_FIGURINE.id,
      strength: (_, item) => calculatePrimaryStat(280, 676, item.itemLevel),
      agility: (_, item) => calculatePrimaryStat(280, 676, item.itemLevel),
      intellect: (_, item) => calculatePrimaryStat(280, 676, item.itemLevel),
    },
    [SPELLS.SPYGLASS_SIGHT.id]: {
      itemId: ITEMS.FIRST_MATES_SPYGLASS.id,
      crit: (_, item) => calculateSecondaryStatDefault(280, 544, item.itemLevel),
    },

    //endregion

    // region Misc
    [SPELLS.JACINS_RUSE.id]: { mastery: 136 },
    [SPELLS.MARK_OF_THE_CLAW.id]: { crit: 45, haste: 45 },
    [SPELLS.OPULENCE_QUICKENED_PULSE.id]: { haste: 261, crit: 261, mastery: 261, versatility: 261 }, // Quickened Pulse by Opulence (BoD - BFA)
    // endregion

    // region Death Knight
    // endregion

    // region Druid
    [SPELLS.ASTRAL_HARMONY.id]: { mastery: 181 },
    // endregion

    // region Mage

    // endregion

    // region Paladin
    [SPELLS.SERAPHIM_TALENT.id]: { crit: 1007, haste: 1007, mastery: 1007, versatility: 1007 },
    // endregion

    /****************************************\
     *                    BFA:                *
     \****************************************/

    // region Azerite Traits
    // region General
    [SPELLS.SECRETS_OF_THE_DEEP_SURGING_DROPLET.id]: { strength: 442, agility: 442, intellect: 442 }, // TODO: Implement primaryStat
    [SPELLS.SECRETS_OF_THE_DEEP_VOID_DROPLET.id]: { strength: 885, agility: 885, intellect: 885 }, // TODO: Implement primaryStat
    [SPELLS.CHAMPION_OF_AZEROTH.id]: { versatility: 87 },
    [SPELLS.VAMPIRIC_SPEED.id]: { speed: 196 },
    [SPELLS.WOUNDBINDER.id]: { haste: 584 }, // based on 340 TODO: Scale with item level
    // endregion
    // region Hunter
    [SPELLS.HAZE_OF_RAGE.id]: { agility: 316 },
    // endregion
    // region Warlock
    // endregion
    // region Death Knight
    // endregion
    // region Monk
    // endregion
    // region Paladin
    // endregion
    // region Priest
    // endregion
    // region Enchants
    [SPELLS.DEADLY_NAVIGATION_BUFF_SMALL.id]: { crit: 50 },
    [SPELLS.DEADLY_NAVIGATION_BUFF_BIG.id]: { crit: 600 },
    [SPELLS.QUICK_NAVIGATION_BUFF_SMALL.id]: { haste: 50 },
    [SPELLS.QUICK_NAVIGATION_BUFF_BIG.id]: { haste: 600 },
    264878: { crit: 650 }, // Crow's Nest Scope
    300693: { intellect: 264 }, // machinistts
    298431: { crit: 170 },
    300762: { mastery: 170 },
    //endregion

    // DEFINING STAT BUFFS HERE IS DEPRECATED.
    // Instead you should lazily add the buffs by adding the StatTracker as a dependency to your module, and calling `add` in the constructor.

    // region Trinkets
    [SPELLS.LOADED_DIE_CRITICAL_STRIKE_SMALL.id]: {
      itemId: ITEMS.HARLANS_LOADED_DICE.id,
      crit: (_, item) => calculateSecondaryStatDefault(355, 169, item.itemLevel),
    },
    [SPELLS.LOADED_DIE_HASTE_SMALL.id]: {
      itemId: ITEMS.HARLANS_LOADED_DICE.id,
      haste: (_, item) => calculateSecondaryStatDefault(355, 169, item.itemLevel),
    },
    [SPELLS.LOADED_DIE_MASTERY_SMALL.id]: {
      itemId: ITEMS.HARLANS_LOADED_DICE.id,
      mastery: (_, item) => calculateSecondaryStatDefault(355, 169, item.itemLevel),
    },
    [SPELLS.LOADED_DIE_CRITICAL_STRIKE_BIG.id]: {
      itemId: ITEMS.HARLANS_LOADED_DICE.id,
      crit: (_, item) => calculateSecondaryStatDefault(355, 284, item.itemLevel),
    },
    [SPELLS.LOADED_DIE_HASTE_BIG.id]: {
      itemId: ITEMS.HARLANS_LOADED_DICE.id,
      haste: (_, item) => calculateSecondaryStatDefault(355, 284, item.itemLevel),
    },
    [SPELLS.LOADED_DIE_MASTERY_BIG.id]: {
      itemId: ITEMS.HARLANS_LOADED_DICE.id,
      mastery: (_, item) => calculateSecondaryStatDefault(355, 284, item.itemLevel),
    },
    [SPELLS.GALECALLERS_BOON_BUFF.id]: {
      itemId: ITEMS.GALECALLERS_BOON.id,
      haste: (_, item) => calculateSecondaryStatDefault(340, 753, item.itemLevel),
    },
    [SPELLS.TITANIC_OVERCHARGE.id]: {
      itemId: ITEMS.CONSTRUCT_OVERCHARGER.id,
      haste: (_, item) => calculateSecondaryStatDefault(385, 60, item.itemLevel),
    },
    [SPELLS.RAPID_ADAPTATION.id]: {
      itemId: ITEMS.DREAD_GLADIATORS_MEDALLION.id,
      versatility: (_, item) => calculateSecondaryStatDefault(300, 576, item.itemLevel),
    },
    [SPELLS.TASTE_OF_VICTORY.id]: {
      itemId: ITEMS.DREAD_GLADIATORS_INSIGNIA.id,
      strength: (_, item) => calculatePrimaryStat(335, 462, item.itemLevel),
      agility: (_, item) => calculatePrimaryStat(335, 462, item.itemLevel),
      intellect: (_, item) => calculatePrimaryStat(335, 462, item.itemLevel),
    },
    [SPELLS.DIG_DEEP.id]: {
      itemId: ITEMS.DREAD_GLADIATORS_BADGE.id,
      strength: (_, item) => calculatePrimaryStat(385, 1746, item.itemLevel),
      agility: (_, item) => calculatePrimaryStat(385, 3174651, item.itemLevel),
      intellect: (_, item) => calculatePrimaryStat(385, 1746, item.itemLevel),
    },
    [SPELLS.GOLDEN_LUSTER.id]: {
      itemId: ITEMS.LUSTROUS_GOLDEN_PLUMAGE.id,
      versatility: (_, item) => calculateSecondaryStatDefault(380, 864, item.itemLevel),
    },
    // region Quests
    // Mostly implemented for beta/PTR, don't expect to ever need those spells/trinkets elsewhere, so hard-coding the ids here
    269887: { // Boiling Time
      itemId: 159978, // Junji's Egg Timer
      haste: (_, item) => calculateSecondaryStatDefault(172, 170, item.itemLevel),
    },
    268623: { // Shark's Bite
      itemId: 159765, // Empowered Shark's Tooth
      crit: (_, item) => calculateSecondaryStatDefault(172, 170, item.itemLevel),
    },
    268602: { // Master's Sight
      itemId: 159074, // Jarkadiax's Other Eye
      mastery: (_, item) => calculateSecondaryStatDefault(172, 114, item.itemLevel),
    },
    268616: { // Swell of Voodoo
      itemId: 159763, // Idol of Vol'jamba
      mastery: (_, item) => calculateSecondaryStatDefault(172, 114, item.itemLevel),
    },
    273988: { // Primal Instinct
      itemId: 158155, // Dinobone Charm
      strength: (_, item) => calculatePrimaryStat(280, 351, item.itemLevel),
      agility: (_, item) => calculatePrimaryStat(280, 351, item.itemLevel),
      intellect: (_, item) => calculatePrimaryStat(280, 351, item.itemLevel),
    },
    269885: { // Residual Viciousness
      itemId: 159977, // Vindictive Golem Core
      crit: (_, item) => calculateSecondaryStatDefault(172, 170, item.itemLevel),
    },
    273992: { // Speed of the Spirits
      itemId: 158154, // Zandalari Bijou
      haste: (_, item) => calculateSecondaryStatDefault(280, 414, item.itemLevel),
    },
    268604: { // Blood Crazed
      itemId: 159075, // Bloodhex Talisman
      crit: (_, item) => calculateSecondaryStatDefault(172, 207, item.itemLevel),
    },
    271103: { // Rezan's Gleaming Eye
      itemId: 158712, // Rezan's Gleaming Eye
      haste: (_, item) => calculateSecondaryStatDefault(300, 455, item.itemLevel),
    },
    268836: { // Blood of My Enemies
      itemId: 159625, // Vial of Animated Blood
      strength: (_, item) => calculatePrimaryStat(300, 705, item.itemLevel),
    },

    // endregion
    // region World boss
    278227: { // Barkspines
      itemId: 161411, // T'zane's Barkspines active TODO: Make an analyzer
      crit: (_, item) => calculateSecondaryStatDefault(355, 1160, item.itemLevel), // TODO: Verify stats and if it scales with this formula (might be trinket/jewerly scaling)
    },
    // endregion
    // region Dungeons
    [SPELLS.CONCH_OF_DARK_WHISPERS_BUFF.id]: { // Conch of Dark Whispers
      itemId: ITEMS.CONCH_OF_DARK_WHISPERS.id,
      crit: (_, item) => calculateSecondaryStatDefault(300, 455, item.itemLevel),
    },
    271115: { // Ignition Mage's Fuse
      itemId: ITEMS.IGNITION_MAGES_FUSE.id,
      haste: (_, item) => calculateSecondaryStatDefault(310, 233, item.itemLevel),
    },
    [SPELLS.KINDLED_SOUL.id]: { // Balefire Branch trinket's buff (stack starts at 100)
      itemId: ITEMS.BALEFIRE_BRANCH.id,
      intellect: (_, item) => calculatePrimaryStat(340, 12, item.itemLevel),
    },
    [SPELLS.BENEFICIAL_VIBRATIONS.id]: {
      itemId: ITEMS.AZEROKKS_RESONATING_HEART.id,
      agility: (_, item) => calculatePrimaryStat(300, 593, item.itemLevel),
    },
    // endregion
    // endregion

    // region Racials
    // Mag'har Orc
    [SPELLS.RICTUS_OF_THE_LAUGHING_SKULL.id]: { crit: 411 },
    [SPELLS.ZEAL_OF_THE_BURNING_BLADE.id]: { haste: 411 },
    [SPELLS.FEROCITY_OF_THE_FROSTWOLF.id]: { mastery: 411 },
    [SPELLS.MIGHT_OF_THE_BLACKROCK.id]: { versatility: 411 },
    // endregion
  };

  statBuffs = {};

  _pullStats = {};
  _currentStats = {};

  statMultiplier = {
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
  statMultiplierBuffs = {
    [SPELLS.ARCANE_INTELLECT.id]: { intellect: 1.05 },
    [SPELLS.WARSCROLL_OF_INTELLECT.id]: { intellect: 1.03 },
    [SPELLS.BATTLE_SHOUT.id]: { strength: 1.05, agility: 1.05 },
    [SPELLS.WARSCROLL_OF_BATTLE_SHOUT.id]: { strength: 1.03, agility: 1.03 },
  };

  //TODO Update these values on Shadowlands Launch
  //Values taken from https://github.com/simulationcraft/simc/blob/shadowlands/engine/dbc/generated/sc_scale_data.inc
  statBaselineRatingPerPercent = {
    /** Secondaries */
    [STAT.CRITICAL_STRIKE]: 10.67, //33 @ 60
    [STAT.HASTE]: 10.06, //35 @ 60
    [STAT.MASTERY]: 10.67, //33 @ 60
    [STAT.VERSATILITY]: 12.20, //40 @ 60
    /** Tertiaries */
    [STAT.AVOIDANCE]: 4.27, //14 @ 60
    [STAT.LEECH]: 6.4, //21 @ 60
    [STAT.SPEED]: 3.05, // 10 @ 60
  };

  /** Secondary stat scaling thresholds
   * Taken from https://raw.githubusercontent.com/simulationcraft/simc/shadowlands/engine/dbc/generated/item_scaling.inc
   * Search for 21024 in the first column for secondary stat scaling
   */
  secondaryStatPenaltyThresholds = [
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
  tertiaryStatPenaltyThresholds = [
    /** Tertiary stat scaling thresholds */
    { base: 0, scaled: 0, penaltyAboveThis: 0 },
    { base: 0.05, scaled: 0.05, penaltyAboveThis: 0 },
    { base: 0.1, scaled: 0.1, penaltyAboveThis: 0 },
    { base: 0.15, scaled: 0.14, penaltyAboveThis: 0.2 },
    { base: 0.20, scaled: 0.17, penaltyAboveThis: 0.4 },
    { base: 0.25, scaled: 0.19, penaltyAboveThis: 0.6 },
    { base: 1, scaled: 0.49, penaltyAboveThis: 1 },
  ];

  constructor(...args) {
    super(...args);
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
      ...this.constructor.DEFAULT_BUFFS,
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
   * @param buffId ID of the stat buff
   * @param stats Object with stats (intellect, mastery, haste, crit etc.) and their respective bonus (either fixed value or a function (combatant, item) => value). If it's from item, provide also an itemId (item in the stat callback is taken from this itemId).
   */
  add(buffId, stats) {
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
    const usesItemArgument = Object.values(stats).some(value => typeof value === 'function' && value.length === 2);
    if (usesItemArgument && !stats.itemId) {
      throw new Error(`Stat buff ${buffId} uses item argument, but does not provide item ID`);
    }
    this.statBuffs[buffId] = stats;
  }

  addStatMultiplier(stats, changeCurrentStats = false) {
    const delta = {};
    for (const stat in stats) {
      const before = this.statMultiplier[stat];
      this.statMultiplier[stat] *= stats[stat];

      debug && console.log(`StatTracker: ${stat} multiplier change (${before.toFixed(2)} -> ${this.statMultiplier[stat].toFixed(2)}) @ ${formatMilliseconds(this.owner.fightDuration)}`);

      if (changeCurrentStats) {
        delta[stat] = Math.round(this._currentStats[stat] * stats[stat] - this._currentStats[stat]);
      }
    }

    changeCurrentStats && this.forceChangeStats(delta, null, true);
  }

  removeStatMultiplier(stats, changeCurrentStats = false) {
    const delta = {};
    for (const stat in stats) {
      const before = this.statMultiplier[stat];
      this.statMultiplier[stat] /= stats[stat];

      debug && console.log(`StatTracker: ${stat} multiplier change (${before.toFixed(2)} -> ${this.statMultiplier[stat].toFixed(2)}) @ ${formatMilliseconds(this.owner.fightDuration)}`);

      if (changeCurrentStats) {
        delta[stat] = Math.round(this._currentStats[stat] / stats[stat] - this._currentStats[stat]);
      }
    }

    changeCurrentStats && this.forceChangeStats(delta, null, true);
  }

  applySpecModifiers() {
    const modifiers = this.constructor.SPEC_MULTIPLIERS[this.selectedCombatant.spec.id] || {};
    Object.entries(modifiers).forEach(([stat, multiplier]) => {
      this._pullStats[stat] *= multiplier;
    });
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

  get startingArmorRating() {
    return this._pullStats.armor;
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
    } else if (this.selectedCombatant.hasBuff(SPELLS.OPULENCE_BRILLAINT_AURA.id)) {
      critChance += 1.0;
    }
    switch (this.selectedCombatant.spec) {
      case SPECS.FIRE_MAGE:
        return critChance + 0.15; // an additional 15% is gained from the passive Critical Mass
      case SPECS.BEAST_MASTERY_HUNTER:
        return critChance + 0.05; //baseline +5%
      case SPECS.MARKSMANSHIP_HUNTER:
        return critChance + 0.05; //baseline +5%
      case SPECS.SURVIVAL_HUNTER:
        return critChance + 0.06; //baseline +6%
      case SPECS.BREWMASTER_MONK:
        return critChance + 0.05; //baseline +5%
      case SPECS.WINDWALKER_MONK:
        return critChance + 0.05; //baseline +5%
      case SPECS.HAVOC_DEMON_HUNTER:
        return critChance + 0.06; //baseline +6%
      case SPECS.SUBTLETY_ROGUE:
        return critChance + 0.05; //baseline +5%
      case SPECS.ASSASSINATION_ROGUE:
        return critChance + 0.05; //baseline +5%
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
    return spellPoints * this.selectedCombatant.spec.masteryCoefficient / 100;
  }

  get hasMasteryCoefficient(){
    if(!this.selectedCombatant.spec || !this.selectedCombatant.spec.masteryCoefficient){
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
  calculateStatPercentage(rating, baselineRatingPerPercent, returnRatingForNextPercent = false, isSecondary = true, coef = 1) {
    //Which penalty thresholds we should use based on type of stat
    const penaltyThresholds = isSecondary ? this.secondaryStatPenaltyThresholds : this.tertiaryStatPenaltyThresholds;
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
    //Loop through each of our penaltythresholds until we find the first one where we have more baseline stats than that curvepoint
    for (const idx in penaltyThresholds) {
      //If we have a higher percent than the baseline, we can move on immediately
      if (baselinePercent >= penaltyThresholds[idx].base) {
        continue;
      }
      if (returnRatingForNextPercent) {
        //Returns the rating needed for 1% at current rating levels
        return ((baselineRatingPerPercent / (1 - penaltyThresholds[idx - 1].penaltyAboveThis)) / coef) * 100;
      } else {
        //Since we no longer have more base stats than the current curve point, we know that we atleast have the scaled value of the last curve point
        const statFromLastCurvePoint = penaltyThresholds[idx - 1].scaled;
        //Using the known stat from last curve point, we can calculate the remaining stat gain by subtracting the last curve point from our baseline percentage and multiplying it by (1-penalty) of the penalty applied to stats from the last curve point.
        const calculateStatGainWithinCurrentCurvePoint = (baselinePercent - penaltyThresholds[idx - 1].base) * (1 - penaltyThresholds[idx - 1].penaltyAboveThis);
        return (statFromLastCurvePoint + calculateStatGainWithinCurrentCurvePoint) * coef;
      }
    }
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
  ratingNeededForNextPercentage(rating, baselineRatingPerPercent, coef = 1, isSecondary = true) {
    return this.calculateStatPercentage(rating, baselineRatingPerPercent, true, isSecondary, coef);
  }

  /*
   * For percentage stats, returns the combined base stat values and the values gained from ratings -- this does not include percentage increases such as Bloodlust
   */
  critPercentage(rating, withBase = false) {
    return (withBase ? this.baseCritPercentage : 0) + this.calculateStatPercentage(rating, this.statBaselineRatingPerPercent[STAT.CRITICAL_STRIKE]);
  }

  hastePercentage(rating, withBase = false) {
    return (withBase ? this.baseHastePercentage : 0) + this.calculateStatPercentage(rating, this.statBaselineRatingPerPercent[STAT.HASTE]);
  }

  masteryPercentage(rating, withBase = false) {
    return (withBase ? this.baseMasteryPercentage : 0) + this.calculateStatPercentage(rating, this.statBaselineRatingPerPercent[STAT.MASTERY], false, true, this.selectedCombatant.spec.masteryCoefficient);
  }

  versatilityPercentage(rating, withBase = false) {
    return (withBase ? this.baseVersatilityPercentage : 0) + this.calculateStatPercentage(rating, this.statBaselineRatingPerPercent[STAT.VERSATILITY]);
  }

  avoidancePercentage(rating, withBase = false) {
    return (withBase ? this.baseAvoidancePercentage : 0) + this.calculateStatPercentage(rating, this.statBaselineRatingPerPercent[STAT.AVOIDANCE], false, false);
  }

  leechPercentage(rating, withBase = false) {
    return (withBase ? this.baseLeechPercentage : 0) + this.calculateStatPercentage(rating, this.statBaselineRatingPerPercent[STAT.LEECH], false, false);
  }

  speedPercentage(rating, withBase = false) {
    return (withBase ? this.baseSpeedPercentage : 0) + this.calculateStatPercentage(rating, this.statBaselineRatingPerPercent[STAT.SPEED], false, false);
  }

  /*
   * For percentage stats, the current stat percentage as tracked by this module.
   */
  get currentCritPercentage() {
    return this.critPercentage(this.currentCritRating, true);
  }

  // This is only the percentage from BASE + RATING.
  // If you're looking for current haste percentage including buffs like Bloodlust, check the Haste module.
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

  onChangeBuffStack(event) {
    this._changeBuffStack(event);
  }

  onChangeDebuffStack(event) {
    this._changeBuffStack(event);
  }

  onCast(event) {
    this._updateIntellect(event);
  }

  onHealTaken(event) {
    this._updateIntellect(event);
  }

  _updateIntellect(event) {
    // updates intellect values directly from game events
    if (!event.spellPower) {
      return;
    }
    const currentIntellect = this.currentIntellectRating;
    const actualIntellect = event.spellPower;
    if (currentIntellect !== actualIntellect) {
      debug && this.error(`Intellect rating calculated with StatTracker is different from actual Intellect from events! StatTracker: ${currentIntellect}, actual: ${actualIntellect}`);
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
  forceChangeStats(change, eventReason, withoutMultipliers = false) {
    const before = Object.assign({}, this._currentStats);
    const delta = this._changeStats(change, 1, withoutMultipliers);
    const after = Object.assign({}, this._currentStats);
    if (debug) {
      const spellName = eventReason && eventReason.ability ? eventReason.ability.name : 'unspecified';
      console.log(`StatTracker: FORCED CHANGE from ${spellName} - Change: ${this._statPrint(delta)}`);
      debug && this._debugPrintStats(this._currentStats);
    }
    this._triggerChangeStats(eventReason, before, delta, after);
  }

  _changeBuffStack(event) {
    const spellId = event.ability.guid;
    const statBuff = this.statBuffs[spellId];
    const statMult = this.statMultiplierBuffs[spellId];
    if (statBuff) {
      // ignore prepull buff application, as they're already accounted for in combatantinfo
      // we have to check the stacks count because Entities incorrectly copies the prepull property onto changes and removal following the application
      if (event.prepull && event.oldStacks === 0) {
        debug && console.log(`StatTracker prepull application IGNORED for ${SPELLS[spellId] ? SPELLS[spellId].name : spellId}`);
        return;
      }

      const before = Object.assign({}, this._currentStats);
      const delta = this._changeStats(statBuff, event.newStacks - event.oldStacks);
      const after = Object.assign({}, this._currentStats);
      debug && console.log(`StatTracker: (${event.oldStacks} -> ${event.newStacks}) ${SPELLS[spellId] ? SPELLS[spellId].name : spellId} @ ${formatMilliseconds(this.owner.fightDuration)} - Change: ${this._statPrint(delta)}`);
      debug && this._debugPrintStats(this._currentStats);
      this._triggerChangeStats(event, before, delta, after);
    }
    if (statMult) {
      // ignore prepull buff application, as they're already accounted for in combatantinfo
      // we have to check the stacks count because Entities incorrectly copies the prepull property onto changes and removal following the application
      if (event.prepull && event.oldStacks === 0) {
        debug && console.log(`StatTracker prepull application IGNORED for ${SPELLS[spellId] ? SPELLS[spellId].name : spellId}`);
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
  _changeStats(change, factor, withoutMultipliers = false) {
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
      armor: this._getBuffValue(change, change.armor) * factor,
    };

    Object.keys(this._currentStats).forEach(key => {
      this._currentStats[key] += withoutMultipliers ? delta[key] : Math.round(delta[key] * this.statMultiplier[key]);
    });

    return delta;
  }

  /**
   * Fabricates an event indicating when stats change
   */
  _triggerChangeStats(event, before, delta, after) {
    this.eventEmitter.fabricateEvent({
      type: EventType.ChangeStats,
      sourceID: event ? event.sourceID : this.owner.playerId,
      targetID: this.owner.playerId,
      targetIsFriendly: true,
      before,
      delta,
      after,
    }, event);
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
      const selectedCombatant = this.selectedCombatant;
      let itemDetails;
      if (buffObj.itemId) {
        itemDetails = this.selectedCombatant.getItem(buffObj.itemId);
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
    return `STR=${stats.strength} AGI=${stats.agility} INT=${stats.intellect} STM=${stats.stamina} CRT=${stats.crit} HST=${stats.haste} MST=${stats.mastery} VRS=${stats.versatility} AVD=${this._currentStats.avoidance} LCH=${stats.leech} SPD=${stats.speed} ARMOR=${this._currentStats.armor}`;
  }
}

export default StatTracker;

