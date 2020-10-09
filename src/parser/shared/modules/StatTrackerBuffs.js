import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import { calculateSecondaryStatDefault, calculatePrimaryStat } from 'common/stats';

export const DEFAULT_BUFFS = {
  // region Potions
  [SPELLS.POTION_OF_PROLONGED_POWER.id]: {
    stamina: 113,
    strength: 113,
    agility: 113,
    intellect: 113,
  },
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
  269887: {
    // Boiling Time
    itemId: 159978, // Junji's Egg Timer
    haste: (_, item) => calculateSecondaryStatDefault(172, 170, item.itemLevel),
  },
  268623: {
    // Shark's Bite
    itemId: 159765, // Empowered Shark's Tooth
    crit: (_, item) => calculateSecondaryStatDefault(172, 170, item.itemLevel),
  },
  268602: {
    // Master's Sight
    itemId: 159074, // Jarkadiax's Other Eye
    mastery: (_, item) => calculateSecondaryStatDefault(172, 114, item.itemLevel),
  },
  268616: {
    // Swell of Voodoo
    itemId: 159763, // Idol of Vol'jamba
    mastery: (_, item) => calculateSecondaryStatDefault(172, 114, item.itemLevel),
  },
  273988: {
    // Primal Instinct
    itemId: 158155, // Dinobone Charm
    strength: (_, item) => calculatePrimaryStat(280, 351, item.itemLevel),
    agility: (_, item) => calculatePrimaryStat(280, 351, item.itemLevel),
    intellect: (_, item) => calculatePrimaryStat(280, 351, item.itemLevel),
  },
  269885: {
    // Residual Viciousness
    itemId: 159977, // Vindictive Golem Core
    crit: (_, item) => calculateSecondaryStatDefault(172, 170, item.itemLevel),
  },
  273992: {
    // Speed of the Spirits
    itemId: 158154, // Zandalari Bijou
    haste: (_, item) => calculateSecondaryStatDefault(280, 414, item.itemLevel),
  },
  268604: {
    // Blood Crazed
    itemId: 159075, // Bloodhex Talisman
    crit: (_, item) => calculateSecondaryStatDefault(172, 207, item.itemLevel),
  },
  271103: {
    // Rezan's Gleaming Eye
    itemId: 158712, // Rezan's Gleaming Eye
    haste: (_, item) => calculateSecondaryStatDefault(300, 455, item.itemLevel),
  },
  268836: {
    // Blood of My Enemies
    itemId: 159625, // Vial of Animated Blood
    strength: (_, item) => calculatePrimaryStat(300, 705, item.itemLevel),
  },

  // endregion
  // region World boss
  278227: {
    // Barkspines
    itemId: 161411, // T'zane's Barkspines active TODO: Make an analyzer
    crit: (_, item) => calculateSecondaryStatDefault(355, 1160, item.itemLevel), // TODO: Verify stats and if it scales with this formula (might be trinket/jewerly scaling)
  },
  // endregion
  // region Dungeons
  [SPELLS.CONCH_OF_DARK_WHISPERS_BUFF.id]: {
    // Conch of Dark Whispers
    itemId: ITEMS.CONCH_OF_DARK_WHISPERS.id,
    crit: (_, item) => calculateSecondaryStatDefault(300, 455, item.itemLevel),
  },
  271115: {
    // Ignition Mage's Fuse
    itemId: ITEMS.IGNITION_MAGES_FUSE.id,
    haste: (_, item) => calculateSecondaryStatDefault(310, 233, item.itemLevel),
  },
  [SPELLS.KINDLED_SOUL.id]: {
    // Balefire Branch trinket's buff (stack starts at 100)
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

export const STAT_MULTIPLIER_BUFFS = {
  [SPELLS.ARCANE_INTELLECT.id]: { intellect: 1.1 },
  [SPELLS.WARSCROLL_OF_INTELLECT.id]: { intellect: 1.07 },
  [SPELLS.BATTLE_SHOUT.id]: { strength: 1.1, agility: 1.1 },
  [SPELLS.WARSCROLL_OF_BATTLE_SHOUT.id]: { strength: 1.07, agility: 1.07 },
};

export const STAT_MULTIPLIER = {
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
