import ITEMS from 'common/ITEMS/classic/potions';
import SPELLS from 'common/SPELLS/classic/potions';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, FilterCooldownInfoEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';

const debug = false;

type WeakPotions = Record<number, { useId: number; useIcon: string }>;

const WEAK_POTIONS: WeakPotions = {
  // not listing master mana potion as weaker because it is conditional (no downtime on short fights = mana potion or int potion)
};

const STRONG_POTIONS: number[] = [
  SPELLS.VIRMENS_BITE.id,
  SPELLS.POTION_OF_FOCUS.id,
  SPELLS.POTION_OF_MOGU_POWER.id,
  SPELLS.POTION_OF_THE_JADE_SERPENT.id,
  SPELLS.MASTER_MANA_POTION.id,
];

const COMMON_MANA_POTION_AMOUNT = 10750;

class ClassicPotionChecker extends Analyzer {
  defaultPotion = ITEMS.VIRMENS_BITE;
  potionsUsed = 0;
  weakPotionsUsed = 0;
  strongPotionsUsed = 0;
  strongPotionId = this.defaultPotion.id;
  strongPotionIcon = this.defaultPotion.icon;
  neededManaSecondPotion = false;
  addedSuggestionText = false;
  isHealer = false;

  readonly maxPotions = 2;
  readonly suggestionMessage = 'You can use 1 potion pre-combat and 1 potion during combat.';

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
      spellId in WEAK_POTIONS &&
      event.prepull &&
      event.timestamp <= this.owner.fight.start_time - this.owner.fight.offset_time
    ) {
      this.potionsUsed += 1;
      this.weakPotionsUsed += 1;
      this.setStrongPotion(spellId);
    }
    if (
      STRONG_POTIONS.includes(spellId) &&
      event.prepull &&
      event.timestamp <= this.owner.fight.start_time - this.owner.fight.offset_time
    ) {
      this.potionsUsed += 1;
      this.strongPotionsUsed += 1;
    }
  }

  _cast(event: CastEvent | FilterCooldownInfoEvent) {
    const spellId = event.ability.guid;

    if (
      spellId in WEAK_POTIONS &&
      event.timestamp > this.owner.fight.start_time - this.owner.fight.offset_time
    ) {
      this.potionsUsed += 1;
      this.weakPotionsUsed += 1;
      this.setStrongPotion(spellId);
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
      console.log(`Potions Used: ${this.potionsUsed}`);
      console.log(`Max Potions: ${this.maxPotions}`);
    }
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

  setStrongPotion(spellId: number) {
    this.strongPotionId = WEAK_POTIONS[spellId].useId;
    this.strongPotionIcon = WEAK_POTIONS[spellId].useIcon;
  }
}

export default ClassicPotionChecker;
