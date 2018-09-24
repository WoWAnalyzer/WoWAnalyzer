import React from 'react';

import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';
import ITEMS from 'common/ITEMS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ItemLink from 'common/ItemLink';

import Analyzer from 'Parser/Core/Analyzer';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

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

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(PRE_POTIONS.includes(spellId) && event.prepull) {
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
  suggestions(when) {
    when(this.prePotionSuggestionThresholds)
      .addSuggestion((suggest) => {
        let potionId;
        let potionIcon;
        let suggestionText;
        const agiSpecs = AGI_SPECS.includes(this.selectedCombatant.specId);
        const strSpecs = STR_SPECS.includes(this.selectedCombatant.specId);
        const risingDeath = RISING_DEATH.includes(this.selectedCombatant.specId);
        const burstingBlood = BURSTING_BLOOD.includes(this.selectedCombatant.specId);
        if (agiSpecs) {
          potionId = ITEMS.BATTLE_POTION_OF_AGILITY.id;
          potionIcon = ITEMS.BATTLE_POTION_OF_AGILITY.icon;
          suggestionText = <React.Fragment>You did not use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. A potion such as <ItemLink id={potionId} /> can be very effective, especially during shorter encounters.</React.Fragment>;
        } else if (strSpecs) {
            potionId = ITEMS.BATTLE_POTION_OF_STRENGTH.id;
            potionIcon = ITEMS.BATTLE_POTION_OF_STRENGTH.icon;
            suggestionText = <React.Fragment>You did not use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. A potion such as <ItemLink id={potionId} /> can be very effective, especially during shorter encounters.</React.Fragment>;
        } else if (risingDeath) {
            potionId = ITEMS.POTION_OF_RISING_DEATH.id;
            potionIcon = ITEMS.POTION_OF_RISING_DEATH.icon;
            suggestionText = <React.Fragment>You did not use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. A potion such as <ItemLink id={potionId} /> can be very effective in a pure single target situation, especially during shorter encounters. In a multi-target encounter, a potion such as <ItemLink id={ITEMS.BATTLE_POTION_OF_STRENGTH.id} /> could be very effective.</React.Fragment>;
        } else if (burstingBlood) {
            potionId = ITEMS.POTION_OF_BURSTING_BLOOD.id;
            potionIcon = ITEMS.POTION_OF_BURSTING_BLOOD.icon;
            suggestionText = <React.Fragment>You did not use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. A potion such as <ItemLink id={potionId} /> can be very effective in a pure single target situation, especially during shorter encounters. In a multi-target encounter, a potion such as <ItemLink id={ITEMS.BATTLE_POTION_OF_STRENGTH.id} /> could be very effective.</React.Fragment>;
        }
        else {
             potionId = ITEMS.BATTLE_POTION_OF_INTELLECT.id;
             potionIcon = ITEMS.BATTLE_POTION_OF_INTELLECT.icon;
             suggestionText = <React.Fragment>You did not use a potion before combat. Using a potion before combat allows you the benefit of two potions in a single fight. A potion such as <ItemLink id={potionId} /> can be very effective, especially during shorter encounters.</React.Fragment>;
        }
        return suggest(suggestionText)
          .icon(potionIcon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
      });


    when(this.secondPotionSuggestionThresholds)
      .addSuggestion((suggest) => {
        let suggestionText;
        let importance;
        let potionIcon;
        const agiSpecs = AGI_SPECS.includes(this.selectedCombatant.specId);
        const strSpecs = STR_SPECS.includes(this.selectedCombatant.specId);
        const risingDeath = RISING_DEATH.includes(this.selectedCombatant.specId);
        const burstingBlood = BURSTING_BLOOD.includes(this.selectedCombatant.specId);
        // Only healer specs would use a mana potion all other specs either don't use mana as a primary resource (such as bears)
        // or have another method to regen mana, this fixes an issue with Guardian where they shift out of bear form and cast a
        // spell but mana is not their primary resource and should not use a mana potion.
        // const healerSpec = HEALER_SPECS.includes(this.selectedCombatant.specId);
        if (agiSpecs) {
          suggestionText = <React.Fragment>You forgot to use a potion during combat. By using a potion during combat such as <ItemLink id={ITEMS.BATTLE_POTION_OF_AGILITY.id} /> you can increase your DPS (especially if lined up with damage cooldowns) and/or suvivability during a fight.</React.Fragment>;
          // Change the icon to fit the description
          potionIcon = ITEMS.BATTLE_POTION_OF_AGILITY.icon;
          importance = SUGGESTION_IMPORTANCE.MINOR;
        } else if (strSpecs) {
          suggestionText = <React.Fragment>You forgot to use a potion during combat. By using a potion during combat such as <ItemLink id={ITEMS.BATTLE_POTION_OF_STRENGTH.id} /> you can increase your DPS (especially if lined up with damage cooldowns) and/or suvivability during a fight.</React.Fragment>;
          // Change the icon to fit the description
          potionIcon = ITEMS.BATTLE_POTION_OF_STRENGTH.icon;
          importance = SUGGESTION_IMPORTANCE.MINOR;
        } else if (risingDeath) {
          suggestionText = <React.Fragment>You forgot to use a potion during combat. By using a potion during combat such as <ItemLink id={ITEMS.POTION_OF_RISING_DEATH.id} /> you can increase your DPS (especially if lined up with damage cooldowns). If the encounter has become multi-target at the time you would use a potion, it may be beneficial to use <ItemLink id={ITEMS.BATTLE_POTION_OF_INTELLECT.id} /> instead.</React.Fragment>;
          potionIcon = ITEMS.POTION_OF_RISING_DEATH.icon;
          importance = SUGGESTION_IMPORTANCE.MINOR;
        } else if (burstingBlood) {
          suggestionText = <React.Fragment>You forgot to use a potion during combat. By using a potion during combat such as <ItemLink id={ITEMS.POTION_OF_BURSTING_BLOOD.id} /> you can increase your DPS (especially if lined up with damage cooldowns). If the encounter has become multi-target at the time you would use a potion, it may be beneficial to use <ItemLink id={ITEMS.BATTLE_POTION_OF_STRENGTH.id} /> instead.</React.Fragment>;
          potionIcon = ITEMS.POTION_OF_BURSTING_BLOOD.icon;
          importance = SUGGESTION_IMPORTANCE.MINOR;
        } else if (!this.neededManaSecondPotion) {
          suggestionText = <React.Fragment>You forgot to use a potion during combat. Using a potion during combat allows you the benefit of either increasing output through <ItemLink id={ITEMS.BATTLE_POTION_OF_INTELLECT.id} /> or allowing you to gain mana using <ItemLink id={ITEMS.COASTAL_MANA_POTION.id} />, for example.</React.Fragment>;
          potionIcon = ITEMS.BATTLE_POTION_OF_INTELLECT.icon;
          importance = SUGGESTION_IMPORTANCE.MINOR;
        } else {
          suggestionText = <React.Fragment>You ran out of mana (OOM) during the encounter without using a second potion. Use a second potion such as <ItemLink id={ITEMS.COASTAL_MANA_POTION.id} />or if the fight allows <ItemLink id={ITEMS.POTION_OF_REPLENISHMENT.id} /> to regenerate some mana.</React.Fragment>;
          potionIcon = ITEMS.POTION_OF_REPLENISHMENT.icon;
          importance = SUGGESTION_IMPORTANCE.REGULAR;
        }
        return suggest(suggestionText)
          .icon(potionIcon)
          .staticImportance(importance);
      });
  }
}

export default PrePotion;

