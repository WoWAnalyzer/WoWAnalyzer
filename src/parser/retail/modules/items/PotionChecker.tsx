import ITEMS from 'common/ITEMS/dragonflight/potions';
import SPELLS from 'common/SPELLS/dragonflight/potions';
import ALCHEMY from 'common/SPELLS/dragonflight/crafted/alchemy';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPECS from 'game/SPECS';
import { ItemLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, FilterCooldownInfoEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

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
  SPECS.SURVIVAL_HUNTER.id,
];

const STR_SPECS: number[] = [
  SPECS.PROTECTION_PALADIN.id,
  SPECS.PROTECTION_WARRIOR.id,
  SPECS.BLOOD_DEATH_KNIGHT.id,
  SPECS.RETRIBUTION_PALADIN.id,
  SPECS.ARMS_WARRIOR.id,
  SPECS.FURY_WARRIOR.id,
  SPECS.FROST_DEATH_KNIGHT.id,
  SPECS.UNHOLY_DEATH_KNIGHT.id,
];

const INT_SPECS: number[] = [
  SPECS.SHADOW_PRIEST.id,
  SPECS.FROST_MAGE.id,
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

const BOTTLED_PUTRESCENCE: number[] = [
  // Bottled Putrescence specs
];

const POTION_OF_FROZEN_FOCUS: number[] = [
  // Potion of Frozen Focus specs
];

const RESIDUAL_NEURAL_CHANNELING_AGENT: number[] = [
  // Residual Neural Channeling Agent specs
];

const DELICATE_SUSPENSION_OF_SPORES: number[] = [
  // Delicate Suspension of Spores specs
];

const POTION_OF_CHILLED_CLARITY: number[] = [
  // Potion of Chilled Clarity specs
];

// TODO: Determine how we can tell if a potion was R1 or R2
const WEAK_POTIONS: number[] = [];

const STRONG_POTIONS: number[] = [
  SPELLS.AERATED_MANA_POTION.id,
  SPELLS.ELEMENTAL_POTION_OF_ULTIMATE_POWER.id,
  SPELLS.ELEMENTAL_POTION_OF_POWER.id,
  SPELLS.BOTTLED_PUTRESCENCE.id,
  SPELLS.POTION_OF_FROZEN_FOCUS.id,
  SPELLS.RESIDUAL_NEURAL_CHANNELING_AGENT.id,
  SPELLS.DELICATE_SUSPENSION_OF_SPORES.id,
  SPELLS.POTION_OF_SHOCKING_DISCLOSURE.id,
  SPELLS.POTION_OF_CHILLED_CLARITY_R1.id,
  SPELLS.POTION_OF_CHILLED_CLARITY_R2.id,
  SPELLS.POTION_OF_CHILLED_CLARITY_R3.id,
];

export const COMBAT_POTIONS: number[] = [
  SPELLS.ELEMENTAL_POTION_OF_ULTIMATE_POWER.id,
  SPELLS.ELEMENTAL_POTION_OF_POWER.id,
  SPELLS.BOTTLED_PUTRESCENCE.id,
  SPELLS.POTION_OF_FROZEN_FOCUS.id,
  SPELLS.RESIDUAL_NEURAL_CHANNELING_AGENT.id,
  SPELLS.DELICATE_SUSPENSION_OF_SPORES.id,
  SPELLS.POTION_OF_SHOCKING_DISCLOSURE.id,
  SPELLS.POTION_OF_CHILLED_CLARITY_R1.id,
  SPELLS.POTION_OF_CHILLED_CLARITY_R2.id,
  SPELLS.POTION_OF_CHILLED_CLARITY_R3.id,
];

const COMMON_MANA_POTION_AMOUNT = 11084;
const ALACRITOUS_ALCHEMIST_STONE_CDR_MS = 10000;

class PotionChecker extends Analyzer {
  alacritousAlchemistStoneProcs = 0;
  potionsUsed = 0;
  weakPotionsUsed = 0;
  strongPotionsUsed = 0;
  potionId = ITEMS.ELEMENTAL_POTION_OF_POWER_R3.id; // Giving it an initial value to prevent crashing
  potionIcon = ITEMS.ELEMENTAL_POTION_OF_POWER_R3.icon; // Giving it an initial value to prevent crashing
  strongPotionId = ITEMS.ELEMENTAL_POTION_OF_POWER_R3.id;
  strongPotionIcon = ITEMS.ELEMENTAL_POTION_OF_POWER_R3.icon;
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
    if (
      WEAK_POTIONS.includes(spellId) &&
      event.prepull &&
      event.timestamp <= this.owner.fight.start_time - this.owner.fight.offset_time
    ) {
      this.potionsUsed += 1;
      this.weakPotionsUsed += 1;
    }
    if (
      STRONG_POTIONS.includes(spellId) &&
      event.prepull &&
      event.timestamp <= this.owner.fight.start_time - this.owner.fight.offset_time
    ) {
      this.potionsUsed += 1;
      this.strongPotionsUsed += 1;
    }
    if (spellId === ALCHEMY.ALACRITOUS_ALCHEMIST_STONE.id) {
      this.alacritousAlchemistStoneProcs += 1;
    }
  }

  _cast(event: CastEvent | FilterCooldownInfoEvent) {
    const spellId = event.ability.guid;

    if (
      WEAK_POTIONS.includes(spellId) &&
      event.timestamp > this.owner.fight.start_time - this.owner.fight.offset_time
    ) {
      this.potionsUsed += 1;
      this.weakPotionsUsed += 1;
    }

    if (
      STRONG_POTIONS.includes(spellId) &&
      event.timestamp > this.owner.fight.start_time - this.owner.fight.offset_time
    ) {
      this.potionsUsed += 1;
      this.strongPotionsUsed += 1;
    }

    if (
      event.classResources &&
      event.classResources[0] &&
      event.classResources[0].type === RESOURCE_TYPES.MANA.id
    ) {
      const resource = event.classResources[0];
      const manaLeftAfterCast = resource.amount - resource.cost;
      if (manaLeftAfterCast < COMMON_MANA_POTION_AMOUNT) {
        this.neededManaSecondPotion = true;
      }
    }
  }

  _fightend() {
    if (debug) {
      console.log(`Alacritous Alchemist Stone Procs: ${this.alacritousAlchemistStoneProcs}`);
      console.log(
        `Alacritous Alchemist Stone CDR: ${
          this.alacritousAlchemistStoneProcs * ALACRITOUS_ALCHEMIST_STONE_CDR_MS
        }`,
      );
      console.log(`Potions Used: ${this.potionsUsed}`);
      console.log(`Max Potions: ${this.maxPotions}`);
    }
  }

  get maxPotions() {
    const alacritiousCooldownReduction =
      this.alacritousAlchemistStoneProcs * ALACRITOUS_ALCHEMIST_STONE_CDR_MS;
    // Adjusted the fight Duration by 25 seconds so that if you couldnt have gotten the full use of
    // a second potion then it wont count it against you if you dont use it
    // Also adjusted the fight duration by the amount of CDR that Alacritious Alchemist Stone
    // provided to account for additional potion usages
    return (
      1 + Math.floor((this.owner.fightDuration + alacritiousCooldownReduction - 25000) / 300000)
    );
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

  get suggestionMessage() {
    return 'Since you are able to use a combat potion every 5 minutes, you should ensure that you are getting the maximum number of potions in each encounter.';
  }

  potionAdjuster(specID: number) {
    if (BOTTLED_PUTRESCENCE.includes(specID)) {
      this.potionId = ITEMS.BOTTLED_PUTRESCENCE_R3.id;
      this.potionIcon = ITEMS.BOTTLED_PUTRESCENCE_R3.icon;
      this.addedSuggestionText = true;
    } else if (POTION_OF_FROZEN_FOCUS.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_FROZEN_FOCUS_R3.id;
      this.potionIcon = ITEMS.POTION_OF_FROZEN_FOCUS_R3.icon;
      this.addedSuggestionText = true;
    } else if (RESIDUAL_NEURAL_CHANNELING_AGENT.includes(specID)) {
      this.potionId = ITEMS.RESIDUAL_NEURAL_CHANNELING_AGENT_R3.id;
      this.potionIcon = ITEMS.RESIDUAL_NEURAL_CHANNELING_AGENT_R3.icon;
      this.addedSuggestionText = true;
    } else if (DELICATE_SUSPENSION_OF_SPORES.includes(specID)) {
      this.potionId = ITEMS.DELICATE_SUSPENSION_OF_SPORES_R3.id;
      this.potionIcon = ITEMS.DELICATE_SUSPENSION_OF_SPORES_R3.icon;
      this.addedSuggestionText = true;
    } else if (POTION_OF_CHILLED_CLARITY.includes(specID)) {
      this.potionId = ITEMS.POTION_OF_CHILLED_CLARITY_R3.id;
      this.potionIcon = ITEMS.POTION_OF_CHILLED_CLARITY_R3.icon;
      this.addedSuggestionText = true;
    } else if (AGI_SPECS.includes(specID)) {
      this.potionId = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.id;
      this.potionIcon = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.icon;
    } else if (STR_SPECS.includes(specID)) {
      this.potionId = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.id;
      this.potionIcon = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.icon;
    } else if (INT_SPECS.includes(specID)) {
      this.potionId = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.id;
      this.potionIcon = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.icon;
    } else if (HEALER_SPECS.includes(specID)) {
      this.isHealer = true;
    }
  }

  setStrongPotionForSpec(specID: number) {
    if (AGI_SPECS.includes(specID)) {
      this.strongPotionId = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.id;
      this.strongPotionIcon = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.icon;
    } else if (STR_SPECS.includes(specID)) {
      this.strongPotionId = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.id;
      this.strongPotionIcon = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.icon;
    } else if (INT_SPECS.includes(specID)) {
      this.strongPotionId = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.id;
      this.strongPotionIcon = ITEMS.ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3.icon;
    }
  }

  suggestions(when: When) {
    this.potionAdjuster(this.selectedCombatant.specId);
    this.setStrongPotionForSpec(this.selectedCombatant.specId);
    when(this.potionsUsedThresholds).addSuggestion((suggest) =>
      suggest(
        <>
          You used {this.potionsUsed} combat {this.potionsUsed === 1 ? 'potion' : 'potions'} during
          this encounter, but you could have used {this.maxPotions}. {this.suggestionMessage}
        </>,
      )
        .icon(this.strongPotionIcon)
        .staticImportance(SUGGESTION_IMPORTANCE.REGULAR),
    );
    when(this.potionStrengthThresholds).addSuggestion((suggest) =>
      suggest(
        <>
          You used {this.weakPotionsUsed} weak {this.weakPotionsUsed === 1 ? 'potion' : 'potions'}.
          Use <ItemLink id={this.strongPotionId} /> for better results.
        </>,
      )
        .icon(this.strongPotionIcon)
        .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
    );
  }
}

export default PotionChecker;
