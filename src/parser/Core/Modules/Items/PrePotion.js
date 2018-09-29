import React from 'react';

import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';
import ITEMS from 'common/ITEMS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ItemLink from 'common/ItemLink';

import Analyzer from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

const debug = false;

// const HEALER_SPECS = [
//   SPECS.HOLY_PALADIN.id,
//   SPECS.RESTORATION_DRUID.id,
//   SPECS.HOLY_PRIEST.id,
//   SPECS.DISCIPLINE_PRIEST.id,
//   SPECS.MISTWEAVER_MONK.id,
//   SPECS.RESTORATION_SHAMAN.id,
// ];
// these suggestions are all based on Icy Veins guide recommendations, i.e. which potion to use in which situation.
// most guides recommend to use Battle Potion of Primary Stat, but I have broken out the class/spec combos whose guides
// recommend to use Rising Death or Bursting Blood in certain situations.
const AGI_SPECS = [
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
];

const STR_SPECS = [
  SPECS.PROTECTION_PALADIN.id,
  SPECS.PROTECTION_WARRIOR.id,
  SPECS.BLOOD_DEATH_KNIGHT.id,
  SPECS.RETRIBUTION_PALADIN.id,
];

const BURSTING_BLOOD = [
  SPECS.SURVIVAL_HUNTER.id,
  SPECS.ARMS_WARRIOR.id,
  SPECS.FURY_WARRIOR.id,
  SPECS.FROST_DEATH_KNIGHT.id,
  SPECS.UNHOLY_DEATH_KNIGHT.id,
];

const RISING_DEATH = [
  SPECS.SHADOW_PRIEST.id,
  SPECS.FROST_MAGE.id,
];

const PRE_POTIONS = [
  SPELLS.BATTLE_POTION_OF_INTELLECT.id,
  SPELLS.BATTLE_POTION_OF_STRENGTH.id,
  SPELLS.BATTLE_POTION_OF_AGILITY.id,
  SPELLS.BATTLE_POTION_OF_STAMINA.id,
  SPELLS.POTION_OF_RISING_DEATH.id,
  SPELLS.POTION_OF_BURSTING_BLOOD.id,
  SPELLS.STEELSKIN_POTION.id,
];

const SECOND_POTIONS = [
  SPELLS.BATTLE_POTION_OF_INTELLECT.id,
  SPELLS.BATTLE_POTION_OF_STRENGTH.id,
  SPELLS.BATTLE_POTION_OF_AGILITY.id,
  SPELLS.BATTLE_POTION_OF_STAMINA.id,
  SPELLS.POTION_OF_RISING_DEATH.id,
  SPELLS.POTION_OF_BURSTING_BLOOD.id,
  SPELLS.STEELSKIN_POTION.id,
  SPELLS.COASTAL_MANA_POTION.id,
  SPELLS.COASTAL_REJUVENATION_POTION.id,
  SPELLS.POTION_OF_REPLENISHMENT.id,
];

const COMMON_MANA_POTION_AMOUNT = 11084;

class PrePotion extends Analyzer {
  usedPrePotion = false;
  usedSecondPotion = false;
  neededManaSecondPotion = false;
  potionId = ITEMS.BATTLE_POTION_OF_INTELLECT.id; //Giving it an initial value to prevent crashing
  potionIcon = ITEMS.BATTLE_POTION_OF_INTELLECT.icon; //Giving it an initial value to prevent crashing
  addedSuggestionText = false;
  alternatePotion = null;

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (PRE_POTIONS.includes(spellId) && event.prepull) {
      this.usedPrePotion = true;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (SECOND_POTIONS.includes(spellId)) {
      this.usedSecondPotion = true;
    }

    if (event.classResources && event.classResources[0] && event.classResources[0].type === RESOURCE_TYPES.MANA.id) {
      const resource = event.classResources[0];
      const manaLeftAfterCast = resource.amount - resource.cost;
      if (manaLeftAfterCast < COMMON_MANA_POTION_AMOUNT) {
        this.neededManaSecondPotion = true;
      }
    }
  }

  on_finished() {
    if (debug) {
      console.log(`used potion:${this.usedPrePotion}`);
      console.log(`used 2nd potion:${this.usedSecondPotion}`);
    }
  }

  get prePotionSuggestionThresholds() {
    return {
      actual: this.usedPrePotion,
      isEqual: false,
      style: 'boolean',
    };
  }
  get secondPotionSuggestionThresholds() {
    return {
      actual: this.usedSecondPotion,
      isEqual: false,
      style: 'boolean',
    };
  }

  potionAdjuster(specID) {
    this.alternatePotion = STR_SPECS.includes(specID) ? ITEMS.BATTLE_POTION_OF_STRENGTH.id : ITEMS.BATTLE_POTION_OF_AGILITY.id;
    if (AGI_SPECS.includes(specID)) {
      this.potionId = ITEMS.BATTLE_POTION_OF_AGILITY.id;
      this.potionIcon = ITEMS.BATTLE_POTION_OF_AGILITY.icon;
    } else if (STR_SPECS.includes(specID)) {
      this.potionId = ITEMS.BATTLE_POTION_OF_STRENGTH.id;
      this.potionIcon = ITEMS.BATTLE_POTION_OF_STRENGTH.icon;
    } else if (RISING_DEATH.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_RISING_DEATH.id;
      this.potionIcon = ITEMS.POTION_OF_RISING_DEATH.icon;
      this.addedSuggestionText = true;
    } else if (BURSTING_BLOOD.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_BURSTING_BLOOD.id;
      this.potionIcon = ITEMS.POTION_OF_BURSTING_BLOOD.icon;
      this.addedSuggestionText += true;
    } else {
      this.potionId = ITEMS.BATTLE_POTION_OF_INTELLECT.id;
      this.potionIcon = ITEMS.BATTLE_POTION_OF_INTELLECT.icon;
    }
  }
  suggestions(when) {
    this.potionAdjuster(this.selectedCombatant.specId);
    when(this.prePotionSuggestionThresholds)
      .addSuggestion((suggest) => {
          return suggest(<React.Fragment>You did not use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. A potion such as <ItemLink id={this.potionId} /> can be very effective, especially during shorter encounters. {this.addedSuggestionText ? <React.Fragment>In a multi-target encounter, a potion such as <ItemLink id={this.alternatePotion} /> could be very effective.</React.Fragment> : ''}</React.Fragment>
          )
            .icon(this.potionIcon)
            .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
        }
      );
    when(this.secondPotionSuggestionThresholds)
      .addSuggestion((suggest) => {
        return suggest(<React.Fragment>You forgot to use a potion during combat. Using a potion during combat allows you the benefit of either increasing output through <ItemLink id={this.potionId} /> {this.potionId === ITEMS.BATTLE_POTION_OF_INTELLECT.id ? <React.Fragment>or allowing you to gain mana using <ItemLink id={ITEMS.COASTAL_MANA_POTION.id} />,</React.Fragment> : ''} for example.</React.Fragment>)
          .icon(this.potionIcon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
      })
    ;
  }
}

export default PrePotion;

