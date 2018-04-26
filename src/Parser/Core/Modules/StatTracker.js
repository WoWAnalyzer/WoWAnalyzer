import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SPECS from 'common/SPECS';
import { calculateSecondaryStatDefault, calculatePrimaryStat } from 'common/stats';
import { formatMilliseconds } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { STAT_TRACKER_BUFFS as DARKMOON_DECK_IMMORTALITY_BUFFS } from 'Parser/Core/Modules/Items/Legion/DarkmoonDeckImmortality';

const debug = false;

// TODO: stat constants somewhere else? they're largely copied from combatant
class StatTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
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

  // These are multipliers from *binary* (have it or don't) artifact
  // traits. These are *baked in* and do not multiply temporary buffs.
  static ARTIFACT_MULTIPLIERS = {
    [SPELLS.ENDURANCE_OF_THE_BROKEN_TEMPLE_TRAIT.id]: { armor: 0.35 },
    [SPELLS.WANDERERS_HARDINESS_TRAIT.id]: { armor: 0.17 },
  };

  static STAT_BUFFS = {
    // region Potions
    [SPELLS.POTION_OF_PROLONGED_POWER.id]: { stamina: 113, strength: 113, agility: 113, intellect: 113 },
    // endregion

    // region Runes
    [SPELLS.DEFILED_AUGMENT_RUNE.id]: { strength: 15, agility: 15, intellect: 15 },
    // endregion

    //region Flasks
    [SPELLS.FLASK_OF_THE_WHISPERED_PACT.id]: { intellect: 59 },
    [SPELLS.FLASK_OF_THE_SEVENTH_DEMON.id]: { agility: 59 },
    [SPELLS.FLASK_OF_THE_COUNTLESS_ARMIES.id]: { strength: 59 },
    [SPELLS.FLASK_OF_TEN_THOUSAND_SCARS.id]: { stamina: 88 },
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
    [SPELLS.FEEDBACK_LOOP.id]: {
      itemId: ITEMS.GAROTHI_FEEDBACK_CONDUIT.id,
      haste: (_, item) => calculateSecondaryStatDefault(930, 856, item.itemLevel),
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

    // region Crafted Trinkets
    ...DARKMOON_DECK_IMMORTALITY_BUFFS,
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
    [SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_VERSATILITY.id]: {
      versatility: combatant => 1500 + (combatant.traitsBySpellId[SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_TRAIT.id] - 1) * 300,
    },
    [SPELLS.JACINS_RUSE.id]: { mastery: 136 },
    [SPELLS.MASTER_OF_COMBINATIONS.id]: { mastery: 27 },
    [SPELLS.MARK_OF_THE_CLAW.id]: { crit: 45, haste: 45 },
    [SPELLS.FURY_OF_ASHAMANE.id]: { versatility: 27 },
    [SPELLS.MURDEROUS_INTENT_BUFF.id]: { versatility: 2500 },
    // Antorus: Argus the Unmaker debuffs
    [SPELLS.STRENGTH_OF_THE_SKY.id]: { crit: 2000, mastery: 2000 },
    [SPELLS.STRENGTH_OF_THE_SEA.id]: { haste: 2000, versatility: 2000 },
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

    // region Priest
    [SPELLS.MIND_QUICKENING.id]: { haste: 36 },
    // endregion

    // region Paladin
    [SPELLS.SERAPHIM_TALENT.id]: { crit: 249, haste: 249, mastery: 249, versatility: 249 },
    // endregion
  };

  _pullStats = {};
  _currentStats = {};

  on_initialized() {
    // TODO: Use combatantinfo event directly
    this._pullStats = {
      strength: this.combatants.selected._combatantInfo.strength,
      agility: this.combatants.selected._combatantInfo.agility,
      intellect: this.combatants.selected._combatantInfo.intellect,
      stamina: this.combatants.selected._combatantInfo.stamina,
      crit: this.combatants.selected._combatantInfo.critSpell,
      haste: this.combatants.selected._combatantInfo.hasteSpell,
      mastery: this.combatants.selected._combatantInfo.mastery,
      versatility: this.combatants.selected._combatantInfo.versatilityHealingDone,
      avoidance: this.combatants.selected._combatantInfo.avoidance,
      leech: this.combatants.selected._combatantInfo.leech,
      speed: this.combatants.selected._combatantInfo.speed,
      armor: this.combatants.selected._combatantInfo.armor,
    };

    this.applySpecModifiers();
    this.applyArtifactModifiers();

    this._currentStats = {
      ...this._pullStats,
    };

    debug && this._debugPrintStats(this._currentStats);
  }

  applySpecModifiers() {
    const modifiers = this.constructor.SPEC_MULTIPLIERS[this.combatants.selected.spec.id] || {};
    Object.entries(modifiers).forEach(([stat, multiplier]) => this._pullStats[stat] *= multiplier);
  }

  applyArtifactModifiers() {
    Object.entries(this.constructor.ARTIFACT_MULTIPLIERS).forEach(([spellId, modifiers]) => {
      const rank = this.combatants.selected.traitsBySpellId[spellId] || 0;
      Object.entries(modifiers).forEach(([stat, multiplier]) => this._pullStats[stat] *= 1 + multiplier * rank);
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
    const standard = 0.05;
    switch (this.combatants.selected.spec) {
      case SPECS.HOLY_PALADIN:
        return standard + 0.03; // 3% from a trait everyone has. TODO: Make traits conditional
      case SPECS.FIRE_MAGE:
        return standard + 0.15; // an additional 15% is gained from the passive Critical Mass
      case SPECS.BEAST_MASTERY_HUNTER :
        return standard + 0.05; //baseline +5%
      case SPECS.MARKSMANSHIP_HUNTER :
        return standard + 0.05; //baseline +5%
      case SPECS.SURVIVAL_HUNTER :
        return standard + 0.06; //baseline +6%
      case SPECS.WINDWALKER_MONK:
        return standard + 0.05; //baseline +5%
      case SPECS.HAVOC_DEMON_HUNTER:
        return standard + 0.06; //baseline +6%
      case SPECS.SUBTLETY_ROGUE:
        return standard + 0.05; //baseline +5%
      case SPECS.ASSASSINATION_ROGUE:
        return standard + 0.05; //baseline +5%
      case SPECS.OUTLAW_ROGUE:
        return standard + 0.05; //baseline +5%
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
        return 0.10;
      case SPECS.SHADOW_PRIEST:
        return 0.2;
      case SPECS.DISCIPLINE_PRIEST:
        return 0.128;
      case SPECS.RESTORATION_SHAMAN:
        return 0.24;
      case SPECS.ENHANCEMENT_SHAMAN:
        return 0.2;
      case SPECS.ELEMENTAL_SHAMAN:
        return 0.15;
      case SPECS.GUARDIAN_DRUID:
        return 0.04;
      case SPECS.RESTORATION_DRUID:
        return 0.048;
      case SPECS.BALANCE_DRUID:
        return 0.18;
      case SPECS.RETRIBUTION_PALADIN:
        return 0.14;
      case SPECS.PROTECTION_PALADIN:
        return 0.08;
      case SPECS.WINDWALKER_MONK:
        return 0.1;
      case SPECS.BEAST_MASTERY_HUNTER:
        return 0.18;
      case SPECS.MARKSMANSHIP_HUNTER:
        return 0.05;
      case SPECS.SURVIVAL_HUNTER:
        return 0.04;
      case SPECS.FROST_MAGE:
        return 0.18;
      case SPECS.FIRE_MAGE:
        return 0.06;
      case SPECS.ARCANE_MAGE:
        return 0.0960;
      case SPECS.SUBTLETY_ROGUE:
        return 0.2208;
      case SPECS.ASSASSINATION_ROGUE:
        return 0.32;
      case SPECS.OUTLAW_ROGUE:
        return 0.1760;
      case SPECS.UNHOLY_DEATH_KNIGHT:
        return 0.18;
      case SPECS.MISTWEAVER_MONK:
        return 1.04;
      case SPECS.BREWMASTER_MONK:
        return 0.08;
      case SPECS.FURY_WARRIOR:
        return 0.11;
      case SPECS.AFFLICTION_WARLOCK:
        return 0.25;
      case SPECS.FROST_DEATH_KNIGHT:
        return 0.12;
      case SPECS.BLOOD_DEATH_KNIGHT:
        return 0.12;
      case SPECS.HAVOC_DEMON_HUNTER:
        return 0.12;
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
    return 60 * 100;
  }
  critPercentage(rating, withBase = false) {
    return (withBase ? this.baseCritPercentage : 0) + rating / this.critRatingPerPercent;
  }
  get hasteRatingPerPercent() {
    return 56 * 100;
  }
  hastePercentage(rating, withBase = false) {
    return (withBase ? this.baseHastePercentage : 0) + rating / this.hasteRatingPerPercent;
  }
  get masteryRatingPerPercent() {
    return 60 * 100 / this.combatants.selected.spec.masteryCoefficient;
  }
  masteryPercentage(rating, withBase = false) {
    return (withBase ? this.baseMasteryPercentage : 0) + rating / this.masteryRatingPerPercent;
  }
  get versatilityRatingPerPercent() {
    return 72 * 100;
  }
  versatilityPercentage(rating, withBase = false) {
    return (withBase ? this.baseVersatilityPercentage : 0) + rating / this.versatilityRatingPerPercent;
  }
  get avoidanceRatingPerPercent() {
    return 16.5 * 100;
  }
  avoidancePercentage(rating, withBase = false) {
    return (withBase ? this.baseAvoidancePercentage : 0) + rating / this.avoidanceRatingPerPercent;
  }
  get leechRatingPerPercent() {
    return 34.5 * 100;
  }
  leechPercentage(rating, withBase = false) {
    return (withBase ? this.baseLeechPercentage : 0) + rating / this.leechRatingPerPercent;
  }
  get speedRatingPerPercent() {
    return 12 * 100;
  }
  speedPercentage(rating, withBase = false) {
    return (withBase ? this.baseSpeedPercentage : 0) + rating / this.speedRatingPerPercent;
  }
  armorPercentage(rating) {
    // tfw you get a formula from a rando on the wow forums
    return rating / (rating + 7390);
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
  get currentArmorPercentage() {
    return this.armorPercentage(this.currentArmorRating);
  }

  on_toPlayer_changebuffstack(event) {
    this._changeBuffStack(event);
  }

  on_toPlayer_changedebuffstack(event) {
    this._changeBuffStack(event);
  }

  /**
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
      debug && this._debugPrintStats(this._currentStats);
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
    this.owner.fabricateEvent({
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
    return `STR=${stats.strength} AGI=${stats.agility} INT=${stats.intellect} STM=${stats.stamina} CRT=${stats.crit} HST=${stats.haste} MST=${stats.mastery} VRS=${stats.versatility} AVD=${this._currentStats.avoidance} LCH=${stats.leech} SPD=${stats.speed} ARMOR=${this._currentStats.armor}`;
  }
}

export default StatTracker;
