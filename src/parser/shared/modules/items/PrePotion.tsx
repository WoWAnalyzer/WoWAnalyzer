import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SPECS from 'game/SPECS';
import ITEMS from 'common/ITEMS/index';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ItemLink from 'common/ItemLink';
import Events, { ApplyBuffEvent, CastEvent, FilterCooldownInfoEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

const debug = false;

// these suggestions are all based on Icy Veins guide recommendations, i.e. which potion to use in which situation.
// most guides recommend to use Battle Potion of Primary Stat, but I have broken out the class/spec combos whose guides
// recommend to use Rising Death or Bursting Blood in certain situations.
const AGI_SPECS: number[] = [
  SPECS.GUARDIAN_DRUID.id,
  SPECS.FERAL_DRUID.id,
  SPECS.BEAST_MASTERY_HUNTER.id,
  SPECS.MARKSMANSHIP_HUNTER.id,
  SPECS.ASSASSINATION_ROGUE.id,
  SPECS.OUTLAW_ROGUE.id,
  SPECS.SUBTLETY_ROGUE.id,
  SPECS.ENHANCEMENT_SHAMAN.id,
  SPECS.BREWMASTER_MONK.id,
  SPECS.WINDWALKER_MONK.id,
  SPECS.VENGEANCE_DEMON_HUNTER.id,
  SPECS.HAVOC_DEMON_HUNTER.id,
  SPECS.SURVIVAL_HUNTER.id, //They use agi pot for AoE
];

const STR_SPECS: number[] = [
  SPECS.PROTECTION_PALADIN.id,
  SPECS.PROTECTION_WARRIOR.id,
  SPECS.BLOOD_DEATH_KNIGHT.id,
  SPECS.RETRIBUTION_PALADIN.id,
  SPECS.ARMS_WARRIOR.id, //They use str pot for AoE
  SPECS.FURY_WARRIOR.id, //They use str pot for AoE
  SPECS.FROST_DEATH_KNIGHT.id,
  SPECS.UNHOLY_DEATH_KNIGHT.id,
];

const INT_SPECS: number[] = [
  SPECS.SHADOW_PRIEST.id, //They use int pot for AoE
  SPECS.FROST_MAGE.id, //They use int pot for AoE
  SPECS.AFFLICTION_WARLOCK.id,
  SPECS.DEMONOLOGY_WARLOCK.id,
  SPECS.DESTRUCTION_WARLOCK.id,
  SPECS.ELEMENTAL_SHAMAN.id,
  SPECS.FIRE_MAGE.id,
  SPECS.ARCANE_MAGE.id,
  SPECS.BALANCE_DRUID.id,
];

const HEALER_SPECS: number[] = [
  SPECS.HOLY_PALADIN.id,
  SPECS.RESTORATION_DRUID.id,
  SPECS.HOLY_PRIEST.id,
  SPECS.DISCIPLINE_PRIEST.id,
  SPECS.MISTWEAVER_MONK.id,
  SPECS.RESTORATION_SHAMAN.id,
];

const DEADLY_FIXATION: number[] = [
  //Deadly Fixation Potion specs
];

const EMPOWERED_EXORCISMS: number[] = [
  //Empowered Exorcism Potion Specs
];

const PHANTOM_FIRE: number[] = [
  //Phantom Fire Potion Specs
];

const DIVINE_AWAKENING: number[] = [
  //Divine Awakening Potion Specs
];

const SACRIFICIAL_ANIMA: number[] = [
  //Sacrificial Anima Potion Specs
];


const WEAK_PRE_POTIONS: number[] = [
  SPELLS.BATTLE_POTION_OF_INTELLECT.id,
  SPELLS.BATTLE_POTION_OF_STRENGTH.id,
  SPELLS.BATTLE_POTION_OF_AGILITY.id,
  SPELLS.BATTLE_POTION_OF_STAMINA.id,
  SPELLS.POTION_OF_RISING_DEATH.id,
  SPELLS.POTION_OF_BURSTING_BLOOD.id,
  SPELLS.STEELSKIN_POTION.id,
  SPELLS.SUPERIOR_BATTLE_POTION_OF_INTELLECT.id,
  SPELLS.SUPERIOR_BATTLE_POTION_OF_STRENGTH.id,
  SPELLS.SUPERIOR_BATTLE_POTION_OF_AGILITY.id,
  SPELLS.SUPERIOR_BATTLE_POTION_OF_STAMINA.id,
  SPELLS.SUPERIOR_STEELSKIN_POTION.id,
  SPELLS.POTION_OF_UNBRIDLED_FURY.id,
  SPELLS.POTION_OF_WILD_MENDING.id,
  SPELLS.POTION_OF_FOCUSED_RESOLVE.id,
  SPELLS.POTION_OF_EMPOWERED_PROXIMITY.id,
];

const STRONG_PRE_POTIONS: number[] = [
  SPELLS.POTION_OF_SPECTRAL_AGILITY.id,
  SPELLS.POTION_OF_SPECTRAL_INTELLECT.id,
  SPELLS.POTION_OF_SPECTRAL_STRENGTH.id,
  SPELLS.POTION_OF_SPECTRAL_STAMINA.id,
  SPELLS.POTION_OF_DEATHLY_FIXATION.id,
  SPELLS.POTION_OF_EMPOWERED_EXORCISMS.id,
  SPELLS.POTION_OF_PHANTOM_FIRE.id,
  SPELLS.POTION_OF_DIVINE_AWAKENING.id,
  SPELLS.POTION_OF_SACRIFICIAL_ANIMA.id,
];

export const SECOND_POTIONS: number[] = [
  SPELLS.POTION_OF_SPECTRAL_AGILITY.id,
  SPELLS.POTION_OF_SPECTRAL_INTELLECT.id,
  SPELLS.POTION_OF_SPECTRAL_STRENGTH.id,
  SPELLS.POTION_OF_SPECTRAL_STAMINA.id,
  SPELLS.POTION_OF_DEATHLY_FIXATION.id,
  SPELLS.POTION_OF_EMPOWERED_EXORCISMS.id,
  SPELLS.POTION_OF_PHANTOM_FIRE.id,
  SPELLS.POTION_OF_DIVINE_AWAKENING.id,
  SPELLS.POTION_OF_SACRIFICIAL_ANIMA.id,
  SPELLS.SPIRITUAL_MANA_POTION.id,
  SPELLS.SPIRITUAL_REJUVENATION_POTION.id,
  SPELLS.POTION_OF_SPIRITUAL_CLARITY.id,
  SPELLS.POTION_OF_HARDENED_SHADOWS.id,
];

const COMMON_MANA_POTION_AMOUNT = 11084;

class PrePotion extends Analyzer {
  usedPrePotion = false;
  usedSecondPotion = false;
  neededManaSecondPotion = false;
  usedStrongPrePotion = false;
  potionId = ITEMS.BATTLE_POTION_OF_INTELLECT.id; //Giving it an initial value to prevent crashing
  potionIcon = ITEMS.BATTLE_POTION_OF_INTELLECT.icon; //Giving it an initial value to prevent crashing
  strongPotionId = ITEMS.SUPERIOR_BATTLE_POTION_OF_INTELLECT.id;
  strongPotionIcon = ITEMS.SUPERIOR_BATTLE_POTION_OF_INTELLECT.icon;
  addedSuggestionText = false;
  alternatePotion = null;
  isHealer = false;

  constructor(...args: any[]) {
    super(args);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this._applybuff);
    this.addEventListener(Events.prefiltercd.by(SELECTED_PLAYER), this._cast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this._cast);
    this.addEventListener(Events.fightend, this._fightend);
  }

  _applybuff(event: ApplyBuffEvent){
    const spellId = event.ability.guid;
    if (WEAK_PRE_POTIONS.includes(spellId) && event.prepull && event.timestamp <= this.owner.fight.start_time - this.owner.fight.offset_time) {
      this.usedPrePotion = true;
    }
    if (STRONG_PRE_POTIONS.includes(spellId) && event.prepull && event.timestamp <= this.owner.fight.start_time - this.owner.fight.offset_time) {
      this.usedPrePotion = true;
      this.usedStrongPrePotion = true;
    }
  }

  _cast(event: CastEvent | FilterCooldownInfoEvent) {
    const spellId = event.ability.guid;

    if (SECOND_POTIONS.includes(spellId) && event.timestamp > this.owner.fight.start_time - this.owner.fight.offset_time) {
      this.usedSecondPotion = true;
    }
    if (STRONG_PRE_POTIONS.includes(spellId) && event.timestamp > this.owner.fight.start_time - this.owner.fight.offset_time) {
      this.usedStrongPrePotion = true;
    }

    if (event.classResources && event.classResources[0] && event.classResources[0].type === RESOURCE_TYPES.MANA.id) {
      const resource = event.classResources[0];
      const manaLeftAfterCast = resource.amount - resource.cost;
      if (manaLeftAfterCast < COMMON_MANA_POTION_AMOUNT) {
        this.neededManaSecondPotion = true;
      }
    }
  }

  _fightend() {
    if (debug) {
      console.log(`used potion:${this.usedPrePotion}`);
      console.log(`used 2nd potion:${this.usedSecondPotion}`);
    }
  }

  get prePotionSuggestionThresholds() {
    return {
      actual: this.usedPrePotion,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }
  get prePotionStrengthSuggestion() {
    return {
      actual: this.usedStrongPrePotion,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }
  get secondPotionSuggestionThresholds() {
    return {
      actual: this.usedSecondPotion,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  potionAdjuster(specID: number) {
    this.alternatePotion = STR_SPECS.includes(specID) ? ITEMS.POTION_OF_SPECTRAL_STRENGTH.id : AGI_SPECS.includes(specID) ? ITEMS.POTION_OF_SPECTRAL_AGILITY.id : ITEMS.POTION_OF_SPECTRAL_INTELLECT.id;
    if (DEADLY_FIXATION.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_DEADLY_FIXATION.id;
      this.potionIcon = ITEMS.POTION_OF_DEADLY_FIXATION.icon;
      this.addedSuggestionText = true;
    } else if (EMPOWERED_EXORCISMS.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_EMPOWERED_EXORCISMS.id;
      this.potionIcon = ITEMS.POTION_OF_EMPOWERED_EXORCISMS.icon;
      this.addedSuggestionText = true;
    } else if (PHANTOM_FIRE.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_PHANTOM_FIRE.id;
      this.potionIcon = ITEMS.POTION_OF_PHANTOM_FIRE.icon;
      this.addedSuggestionText = true;
    } else if (DIVINE_AWAKENING.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_DIVINE_AWAKENING.id;
      this.potionIcon = ITEMS.POTION_OF_DIVINE_AWAKENING.icon;
      this.addedSuggestionText = true;
    } else if (SACRIFICIAL_ANIMA.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_SACRIFICIAL_ANIMA.id;
      this.potionIcon = ITEMS.POTION_OF_SACRIFICIAL_ANIMA.icon;
      this.addedSuggestionText = true;
    } else if (AGI_SPECS.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_SPECTRAL_AGILITY.id;
      this.potionIcon = ITEMS.POTION_OF_SPECTRAL_AGILITY.icon;
    } else if (STR_SPECS.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_SPECTRAL_STRENGTH.id;
      this.potionIcon = ITEMS.POTION_OF_SPECTRAL_STRENGTH.icon;
    } else if (INT_SPECS.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_SPECTRAL_INTELLECT.id;
      this.potionIcon = ITEMS.POTION_OF_SPECTRAL_INTELLECT.icon;
    } else if (HEALER_SPECS.includes(specID)) {
      this.isHealer = true;
    }
  }

  setStrongPotionForSpec(specID: number) {
    if (AGI_SPECS.includes(specID)) {
      this.strongPotionId = ITEMS.POTION_OF_SPECTRAL_AGILITY.id;
      this.strongPotionIcon = ITEMS.POTION_OF_SPECTRAL_AGILITY.icon;
    } else if (STR_SPECS.includes(specID)) {
      this.strongPotionId = ITEMS.POTION_OF_SPECTRAL_STRENGTH.id;
      this.strongPotionIcon = ITEMS.POTION_OF_SPECTRAL_STRENGTH.icon;
    } else if (INT_SPECS.includes(specID)) {
      this.strongPotionId = ITEMS.POTION_OF_SPECTRAL_INTELLECT.id;
      this.strongPotionIcon = ITEMS.POTION_OF_SPECTRAL_INTELLECT.icon;
    }
  }

  suggestions(when: When) {
    this.potionAdjuster(this.selectedCombatant.specId);
    this.setStrongPotionForSpec(this.selectedCombatant.specId);
    when(this.prePotionSuggestionThresholds)
      .addSuggestion((suggest) => suggest(<>You did not use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. A potion such as <ItemLink id={this.strongPotionId} /> can be very effective, especially during shorter encounters. {this.addedSuggestionText ? <>In a multi-target encounter, a potion such as <ItemLink id={this.alternatePotion} /> could be very effective.</> : ''}</>,
          )
            .icon(this.strongPotionIcon)
            .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
      );
    when(this.secondPotionSuggestionThresholds)
      .addSuggestion((suggest) => suggest(<>You forgot to use a potion during combat. Using a potion during combat allows you the benefit of {this.isHealer ? 'either' : ''} increasing output through <ItemLink id={this.strongPotionId} />{this.isHealer ? <> or allowing you to gain mana using <ItemLink id={ITEMS.COASTAL_MANA_POTION.id} /> or <ItemLink id={ITEMS.POTION_OF_REPLENISHMENT.id} /></> : ''}. {this.addedSuggestionText ? <>In a multi-target encounter, a potion such as <ItemLink id={this.alternatePotion} /> could be very effective.</> : ''}</>)
          .icon(this.strongPotionIcon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR));
    if ((this.usedPrePotion || this.usedSecondPotion) && !this.usedStrongPrePotion) {
      when(this.prePotionStrengthSuggestion)
        .addSuggestion((suggest) => suggest(<>You used a weak potion. <ItemLink id={this.strongPotionId} /> can be used instead of <ItemLink id={this.potionId} /> in order to get a slightly higher damage output.</>)
            .icon(this.strongPotionIcon)
            .staticImportance(SUGGESTION_IMPORTANCE.MINOR));
    }
  }
}

export default PrePotion;
