import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import { calculateSecondaryStatDefault, calculatePrimaryStat } from 'common/stats';
import { formatMilliseconds } from 'common/format';
import SPECS from 'game/SPECS';
import RACES from 'game/RACES';
import Analyzer from 'parser/core/Analyzer';
import EventEmitter from 'parser/core/modules/EventEmitter';

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
    [SPELLS.BOUNTIFUL_CAPTAIN_FEAST_INT.id]: { intellect: 100 },
    [SPELLS.BOUNTIFUL_CAPTAIN_FEAST_STR.id]: { strength: 100 },
    [SPELLS.BOUNTIFUL_CAPTAIN_FEAST_AGI.id]: { agility: 100 },
    [SPELLS.BOUNTIFUL_CAPTAIN_FEAST_STA.id]: { stamina: 150 },
    //endregion

    // region Dungeon Trinkets
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
    [SPELLS.QUITE_SATISFIED_VERSATILITY.id]: {
      itemId: ITEMS.MAJORDOMOS_DINNER_BELL.id,
      versatility: (_, item) => calculateSecondaryStatDefault(845, 5252, item.itemLevel),
    },
    [SPELLS.QUITE_SATISFIED_CRIT.id]: {
      itemId: ITEMS.MAJORDOMOS_DINNER_BELL.id,
      crit: (_, item) => calculateSecondaryStatDefault(845, 5252, item.itemLevel),
    },
    [SPELLS.QUITE_SATISFIED_HASTE.id]: {
      itemId: ITEMS.MAJORDOMOS_DINNER_BELL.id,
      haste: (_, item) => calculateSecondaryStatDefault(845, 5252, item.itemLevel),
    },
    [SPELLS.QUITE_SATISFIED_MASTERY.id]: {
      itemId: ITEMS.MAJORDOMOS_DINNER_BELL.id,
      mastery: (_, item) => calculateSecondaryStatDefault(845, 5252, item.itemLevel),
    },
    [SPELLS.HOWL_OF_INGVAR.id]: {
      itemId: ITEMS.MEMENTO_OF_ANGERBODA.id,
      crit: (_, item) => calculateSecondaryStatDefault(845, 4207, item.itemLevel),
    },
    [SPELLS.DIRGE_OF_ANGERBODA.id]: {
      itemId: ITEMS.MEMENTO_OF_ANGERBODA.id,
      mastery: (_, item) => calculateSecondaryStatDefault(845, 4207, item.itemLevel),
    },
    [SPELLS.WAIL_OF_SVALA.id]: {
      itemId: ITEMS.MEMENTO_OF_ANGERBODA.id,
      haste: (_, item) => calculateSecondaryStatDefault(845, 4207, item.itemLevel),
    },
    [SPELLS.DOWN_DRAFT.id]: {
      itemId: ITEMS.NIGHTMARE_EGG_SHELL.id,
      haste: (_, item) => calculateSecondaryStatDefault(845, 361, item.itemLevel),
    },
    [SPELLS.ACCELERATION.id]: {
      itemId: ITEMS.CHRONO_SHARD.id,
      haste: (_, item) => calculateSecondaryStatDefault(845, 5269, item.itemLevel),
    },
    [SPELLS.GREASE_THE_GEARS.id]: {
      itemId: ITEMS.FELOILED_INFERNAL_MACHINE.id,
      haste: (_, item) => calculateSecondaryStatDefault(845, 3074, item.itemLevel),
    },
    [SPELLS.VALARJARS_PATH.id]: {
      itemId: ITEMS.HORN_OF_VALOR.id,
      haste: (_, item) => calculatePrimaryStat(820, 2332, item.itemLevel),
    },

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

    // region Raid Trinkets
    // Event weirdness makes it impossible to handle CotRT normally, it's handled instead by the CharmOfTheRisingTide module
    //[SPELLS.RISING_TIDES.id]: {
    //  itemId: ITEMS.CHARM_OF_THE_RISING_TIDE.id,
    //  haste: (_, item) => calculateSecondaryStatDefault(900, 576, item.itemLevel),
    //},
    [SPELLS.ACCELERANDO.id]: {
      itemId: ITEMS.ERRATIC_METRONOME.id,
      haste: (_, item) => calculateSecondaryStatDefault(870, 657, item.itemLevel),
    },
    [SPELLS.SOLAR_INFUSION.id]: {
      itemId: ITEMS.CHALICE_OF_MOONLIGHT.id,
      crit: (_, item) => calculateSecondaryStatDefault(900, 3619, item.itemLevel),
    },
    [SPELLS.LUNAR_INFUSION.id]: {
      itemId: ITEMS.CHALICE_OF_MOONLIGHT.id,
      haste: (_, item) => calculateSecondaryStatDefault(900, 3619, item.itemLevel),
    },
    [SPELLS.TOME_OF_UNRAVELING_SANITY_BUFF.id]: {
      itemId: ITEMS.TOME_OF_UNRAVELING_SANITY.id,
      crit: (_, item) => calculateSecondaryStatDefault(910, 2756, item.itemLevel),
    },
    [SPELLS.BRUTALITY_OF_THE_LEGION.id]: {
      itemId: ITEMS.ACRID_CATALYST_INJECTOR.id,
      crit: (_, item) => calculateSecondaryStatDefault(955, 210, item.itemLevel),
    },
    [SPELLS.FERVOR_OF_THE_LEGION.id]: {
      itemId: ITEMS.ACRID_CATALYST_INJECTOR.id,
      haste: (_, item) => calculateSecondaryStatDefault(955, 210, item.itemLevel),
    },
    [SPELLS.MALICE_OF_THE_LEGION.id]: {
      itemId: ITEMS.ACRID_CATALYST_INJECTOR.id,
      mastery: (_, item) => calculateSecondaryStatDefault(955, 210, item.itemLevel),
    },
    [SPELLS.CYCLE_OF_THE_LEGION.id]: {
      itemId: ITEMS.ACRID_CATALYST_INJECTOR.id,
      crit: (_, item) => calculateSecondaryStatDefault(955, 2397, item.itemLevel),
      haste: (_, item) => calculateSecondaryStatDefault(955, 2397, item.itemLevel),
      mastery: (_, item) => calculateSecondaryStatDefault(955, 2397, item.itemLevel),
    },
    [SPELLS.RUSH_OF_KNOWLEDGE.id]: {
      itemId: ITEMS.NORGANNONS_PROWESS.id,
      intellect: (_, item) => calculatePrimaryStat(940, 11483, item.itemLevel),
    },
    // Khaz'goroth's Courage is handled in it's own module since all 4 stat buffs use the same ID.
    //[SPELLS.KHAZGOROTHS_SHAPING.id]: {
    //  itemId: ITEMS.KHAZGOROTHS_COURAGE.id,
    //  haste: (_, item) => calculateSecondaryStatDefault(940, 4219, item.itemLevel),
    //},
    // endregion

    // region Misc
    [SPELLS.JACINS_RUSE.id]: { mastery: 136 },
    [SPELLS.MARK_OF_THE_CLAW.id]: { crit: 45, haste: 45 },
    // Antorus: Argus the Unmaker debuffs
    [SPELLS.STRENGTH_OF_THE_SKY.id]: { crit: 114, mastery: 114 },
    [SPELLS.STRENGTH_OF_THE_SEA.id]: { haste: 114, versatility: 114 },
    // endregion

    // region Death Knight
    [SPELLS.VAMPIRIC_AURA.id]: { leech: (230 * 0.20 * 100) }, // Gives 20% Leech // TODO make non static so can use this.leechRatingPerPercent ??
    // endregion

    // region Druid
    [SPELLS.ASTRAL_HARMONY.id]: { mastery: 181 },
    // endregion

    // region Mage
    [SPELLS.WARMTH_OF_THE_PHOENIX.id]: { crit: 36 },
    // endregion

    // region Paladin
    [SPELLS.SERAPHIM_TALENT.id]: { crit: 249, haste: 249, mastery: 249, versatility: 249 },
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
    //region Death Knight
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
    //endregion

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
      haste: (_, item) => calculateSecondaryStatDefault(310, 917, item.itemLevel),
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
    // region Raids
    [SPELLS.UNCONTAINED_POWER.id]: {
      itemId: ITEMS.TWITCHING_TENTACLE_OF_XALZAIX.id,
      intellect: (_, item) => calculatePrimaryStat(340, 850, item.itemLevel),
    },
    // endregion
    // endregion

    // region Consumables
    //region Flasks
    251836: { agility: 238 }, // Flask of the Currents
    251839: { strength: 238 }, // Flask of the Undertow
    152639: { intellect: 238 }, // Flask of Endless Fathoms
    251838: { stamina: 357 }, // Flask of Vast Horizon
    // endregion
    // region Potions
    279153: { strength: 900 }, // Battle Potion of Strength
    279152: { agility: 900 }, // Battle Potion of Agility
    279151: { intellect: 900 }, // Battle Potion of Intellect
    279154: { stamina: 1100 }, // Battle Potion of Stamina
    251231: { armor: 900 }, // Steelskin Potion
    // endregion
    // endregion

    // region Racials
    // Mag'har Orc
    [SPELLS.RICTUS_OF_THE_LAUGHING_SKULL.id]: { crit: 102 }, // 411 stats at level 120
    [SPELLS.ZEAL_OF_THE_BURNING_BLADE.id]: { haste: 102 },
    [SPELLS.FEROCITY_OF_THE_FROSTWOLF.id]: { mastery: 102 },
    [SPELLS.MIGHT_OF_THE_BLACKROCK.id]: { versatility: 102 },
    // endregion
  };

  statBuffs = {};

  _pullStats = {};
  _currentStats = {};

  constructor(...args) {
    super(...args);
    // TODO: Use combatantinfo event directly
    this._pullStats = {
      strength: this.selectedCombatant._combatantInfo.strength,
      agility: this.selectedCombatant._combatantInfo.agility,
      intellect: this.selectedCombatant._combatantInfo.intellect,
      stamina: this.selectedCombatant._combatantInfo.stamina,
      crit: this.selectedCombatant._combatantInfo.critSpell,
      haste: this.selectedCombatant._combatantInfo.hasteSpell,
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

  // TODO: I think these should be ratings. They behave like ratings and I think the only reason they're percentages here is because that's how they're **displayed** in-game, but not because it's more correct.
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
      case SPECS.BEAST_MASTERY_HUNTER:
        return critChance + 0.05; //baseline +5%
      case SPECS.MARKSMANSHIP_HUNTER:
        return critChance + 0.05; //baseline +5%
      case SPECS.SURVIVAL_HUNTER:
        return critChance + 0.06; //baseline +6%
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
    return 72 * 100;
  }
  critPercentage(rating, withBase = false) {
    return (withBase ? this.baseCritPercentage : 0) + rating / this.critRatingPerPercent;
  }
  get hasteRatingPerPercent() {
    return 68 * 100;
  }
  hastePercentage(rating, withBase = false) {
    return (withBase ? this.baseHastePercentage : 0) + rating / this.hasteRatingPerPercent;
  }
  get masteryRatingPerPercent() {
    return 72 * 100 / this.selectedCombatant.spec.masteryCoefficient;
  }
  masteryPercentage(rating, withBase = false) {
    return (withBase ? this.baseMasteryPercentage : 0) + rating / this.masteryRatingPerPercent;
  }
  get versatilityRatingPerPercent() {
    return 85 * 100;
  }
  versatilityPercentage(rating, withBase = false) {
    return (withBase ? this.baseVersatilityPercentage : 0) + rating / this.versatilityRatingPerPercent;
  }
  get avoidanceRatingPerPercent() {
    return 28 * 100;
  }
  avoidancePercentage(rating, withBase = false) {
    return (withBase ? this.baseAvoidancePercentage : 0) + rating / this.avoidanceRatingPerPercent;
  }
  get leechRatingPerPercent() {
    return 40 * 100;
  }
  leechPercentage(rating, withBase = false) {
    return (withBase ? this.baseLeechPercentage : 0) + rating / this.leechRatingPerPercent;
  }
  get speedRatingPerPercent() {
    return 20 * 100;
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

  on_toPlayer_changebuffstack(event) {
    this._changeBuffStack(event);
  }

  on_toPlayer_changedebuffstack(event) {
    this._changeBuffStack(event);
  }

  on_byPlayer_cast(event) {
    this._updateIntellect(event);
  }

  on_toPlayer_heal(event) {
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
      this.forceChangeStats({ intellect: delta });
    }
  }

  /**
   * This interface allows an external analyzer to force a stat change.
   * It should ONLY be used if a stat buff is so non-standard that it can't be handled by the buff format in this module.
   * change is a stat buff object just like those in the DEFAULT_BUFFS structure above, it is required.
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
      debug && this._debugPrintStats(this._currentStats);
    }
  }

  _changeBuffStack(event) {
    const spellId = event.ability.guid;
    const statBuff = this.statBuffs[spellId];
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
      debug && console.log(`StatTracker: (${event.oldStacks} -> ${event.newStacks}) ${SPELLS[spellId] ? SPELLS[spellId].name : spellId} @ ${formatMilliseconds(this.owner.fightDuration)} - Change: ${this._statPrint(delta)}`);
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
      armor: this._getBuffValue(change, change.armor) * factor,
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
    this.eventEmitter.fabricateEvent({
      type: 'changestats',
      sourceID: event ? event.sourceID : this.owner.playerId,
      targetID: this.owner.playerId,
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

