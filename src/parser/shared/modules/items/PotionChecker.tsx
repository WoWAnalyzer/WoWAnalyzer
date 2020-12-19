import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';
import ITEMS from 'common/ITEMS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ItemLink from 'common/ItemLink';
import Events, { ApplyBuffEvent, CastEvent, FilterCooldownInfoEvent } from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import React from 'react';
import { Trans } from '@lingui/macro';

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

const DEATHLY_FIXATION: number[] = [
  //Deathly Fixation Potion specs
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

const WEAK_POTIONS: number[] = [];

const STRONG_POTIONS: number[] = [
  SPELLS.POTION_OF_SPECTRAL_AGILITY.id,
  SPELLS.POTION_OF_SPECTRAL_INTELLECT.id,
  SPELLS.POTION_OF_SPECTRAL_STRENGTH.id,
  SPELLS.POTION_OF_SPECTRAL_STAMINA.id,
  SPELLS.POTION_OF_DEATHLY_FIXATION.id,
  SPELLS.POTION_OF_EMPOWERED_EXORCISMS.id,
  SPELLS.POTION_OF_PHANTOM_FIRE.id,
  SPELLS.POTION_OF_DIVINE_AWAKENING.id,
  SPELLS.POTION_OF_SACRIFICIAL_ANIMA.id,
  SPELLS.POTION_OF_SPIRITUAL_CLARITY.id,
  SPELLS.POTION_OF_PHANTOM_FIRE.id,
];

export const COMBAT_POTIONS: number[] = [
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

class PotionChecker extends Analyzer {
  potionsUsed = 0;
  weakPotionsUsed = 0;
  strongPotionsUsed = 0;
  potionId = ITEMS.POTION_OF_SPECTRAL_INTELLECT.id; //Giving it an initial value to prevent crashing
  potionIcon = ITEMS.POTION_OF_SPECTRAL_INTELLECT.icon; //Giving it an initial value to prevent crashing
  strongPotionId = ITEMS.POTION_OF_SPECTRAL_INTELLECT.id;
  strongPotionIcon = ITEMS.POTION_OF_SPECTRAL_INTELLECT.icon;
  neededManaSecondPotion = false;
  addedSuggestionText = false;
  isHealer = false;

  constructor(args: Options) {
    super(args);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this._applybuff);
    this.addEventListener(Events.prefiltercd.by(SELECTED_PLAYER), this._cast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this._cast);
    this.addEventListener(Events.fightend, this._fightend);
  }

  _applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (WEAK_POTIONS.includes(spellId) && event.prepull && event.timestamp <= this.owner.fight.start_time - this.owner.fight.offset_time) {
      this.potionsUsed += 1;
      this.weakPotionsUsed += 1;
    }
    if (STRONG_POTIONS.includes(spellId) && event.prepull && event.timestamp <= this.owner.fight.start_time - this.owner.fight.offset_time) {
      this.potionsUsed += 1;
      this.strongPotionsUsed += 1;
    }
  }

  _cast(event: CastEvent | FilterCooldownInfoEvent) {
    const spellId = event.ability.guid;

    if (WEAK_POTIONS.includes(spellId) && event.timestamp > this.owner.fight.start_time - this.owner.fight.offset_time) {
      this.potionsUsed += 1;
      this.weakPotionsUsed += 1;
    }

    if (STRONG_POTIONS.includes(spellId) && event.timestamp > this.owner.fight.start_time - this.owner.fight.offset_time) {
      this.potionsUsed += 1;
      this.strongPotionsUsed += 1;
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
      console.log(`Potions Used: ${this.potionsUsed}`);
      console.log(`Max Potions: ${this.maxPotions}`);
    }
  }

  get maxPotions() {
    //Adjusted the fight Duration by 25 seconds so that if you couldnt have gotten the full use of a second potion then it wont count it against you if you dont use it
    return 1 + Math.floor((this.owner.fightDuration - 25000) / 300000);
  }

  get potionsUsedThresholds() {
    return {
      actual: this.potionsUsed,
      isLessThan: {
        average: this.maxPotions,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get potionStrengthThresholds() {
    return {
      actual: this.weakPotionsUsed,
      isGreaterThan: {
        minor: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  potionAdjuster(specID: number) {
    if (DEATHLY_FIXATION.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_DEATHLY_FIXATION.id;
      this.potionIcon = ITEMS.POTION_OF_DEATHLY_FIXATION.icon;
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
    when(this.potionsUsedThresholds)
      .addSuggestion((suggest) =>
        suggest(<Trans id="shared.modules.items.potionChecker.suggestions.potionsUsed">You used {this.potionsUsed} combat {this.potionsUsed === 1 ? 'potion' : 'potions'} during this encounter, but you could have used {this.maxPotions}. Since you are able to use a combat potion every 5 minutes, you should ensure that you are getting the maximum number of potions in each encounter.</Trans>)
          .icon(this.strongPotionIcon)
          .staticImportance(SUGGESTION_IMPORTANCE.REGULAR));
    when(this.potionStrengthThresholds)
      .addSuggestion((suggest) =>
        suggest(<Trans id="shared.modules.items.potionChecker.suggestions.weakPotion">You used {this.weakPotionsUsed} weak {this.weakPotionsUsed === 1 ? 'potion' : 'potions'}. <ItemLink id={this.strongPotionId} /> should be used in order to get a slightly higher damage output.</Trans>)
          .icon(this.strongPotionIcon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR));
  }
}

export default PotionChecker;
