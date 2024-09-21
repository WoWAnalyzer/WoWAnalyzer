import { Trans } from '@lingui/macro';
import ITEMS from 'common/ITEMS/thewarwithin/potions';
import SPELLS from 'common/SPELLS/thewarwithin/potions';
import ALCHEMY from 'common/SPELLS/dragonflight/crafted/alchemy';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ROLES from 'game/ROLES';
import { Spec } from 'game/SPECS';
import { ItemLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, FilterCooldownInfoEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { PRIMARY_STAT } from 'parser/shared/modules/features/STAT';

const debug = false;

// these suggestions are all based on Icy Veins guide recommendations, i.e. which potion to use in which situation.
// all guides I've looked at recommends tempered potion, but keeping the basic code to support other specs here.

const POTION_OF_UNWAVERING_FOCUS: number[] = [
  // Specs that are recommended to use Potion of Unwavering Focus
];

// TODO: Determine how we can tell if a potion was R1 or R2
const WEAK_POTIONS: number[] = [];

const STRONG_POTIONS: number[] = [SPELLS.TEMPERED_POTION.id, SPELLS.POTION_OF_UNWAVERING_FOCUS.id];

export const COMBAT_POTIONS: number[] = [
  SPELLS.ALGARI_MANA_POTION.id,
  SPELLS.CAVEDWELLERS_DELIGHT.id,
  SPELLS.DRAUGHT_OF_SHOCKING_REVELATIONS.id,
  SPELLS.FRONTLINE_POTION.id,
  SPELLS.GROTESQUE_VIAL.id,
  SPELLS.POTION_OF_THE_REBORN_CHEETAH.id,
  SPELLS.POTION_OF_UNWAVERING_FOCUS.id,
  SPELLS.SLUMBERING_SOUL_SERUM.id,
  SPELLS.TEMPERED_POTION.id,
  SPELLS.TREADING_LIGHTLY.id,
];

const COMMON_MANA_POTION_AMOUNT = 11084;
const ALACRITOUS_ALCHEMIST_STONE_CDR_MS = 10000;

class PotionChecker extends Analyzer {
  alacritousAlchemistStoneProcs = 0;
  potionsUsed = 0;
  weakPotionsUsed = 0;
  strongPotionsUsed = 0;
  potionId = ITEMS.TEMPERED_POTION_R3.id; // Giving it an initial value to prevent crashing
  potionIcon = ITEMS.TEMPERED_POTION_R3.icon; // Giving it an initial value to prevent crashing
  strongPotionId = ITEMS.TEMPERED_POTION_R3.id;
  strongPotionIcon = ITEMS.TEMPERED_POTION_R3.icon;
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

  potionAdjuster(spec: Spec) {
    if (POTION_OF_UNWAVERING_FOCUS.includes(spec.id)) {
      this.potionId = ITEMS.POTION_OF_UNWAVERING_FOCUS_R3.id;
      this.potionIcon = ITEMS.POTION_OF_UNWAVERING_FOCUS_R3.icon;
    } else if (
      spec.primaryStat === PRIMARY_STAT.AGILITY ||
      spec.primaryStat === PRIMARY_STAT.STRENGTH ||
      spec.primaryStat === PRIMARY_STAT.INTELLECT
    ) {
      this.potionId = ITEMS.TEMPERED_POTION_R3.id;
      this.potionIcon = ITEMS.TEMPERED_POTION_R3.icon;
    } else if (spec.role === ROLES.HEALER) {
      this.isHealer = true;
    }
  }

  setStrongPotionForSpec(spec: Spec) {
    if (spec.primaryStat === PRIMARY_STAT.AGILITY) {
      this.strongPotionId = ITEMS.TEMPERED_POTION_R3.id;
      this.strongPotionIcon = ITEMS.TEMPERED_POTION_R3.icon;
    } else if (spec.primaryStat === PRIMARY_STAT.STRENGTH) {
      this.strongPotionId = ITEMS.TEMPERED_POTION_R3.id;
      this.strongPotionIcon = ITEMS.TEMPERED_POTION_R3.icon;
    } else if (spec.primaryStat === PRIMARY_STAT.INTELLECT) {
      this.strongPotionId = ITEMS.TEMPERED_POTION_R3.id;
      this.strongPotionIcon = ITEMS.TEMPERED_POTION_R3.icon;
    }
  }

  suggestions(when: When) {
    if (this.selectedCombatant.spec == null) {
      throw new Error('No spec found for selected combatant');
    }
    this.potionAdjuster(this.selectedCombatant.spec);
    this.setStrongPotionForSpec(this.selectedCombatant.spec);
    when(this.potionsUsedThresholds).addSuggestion((suggest) =>
      suggest(
        <Trans id="shared.modules.items.potionChecker.suggestions.potionsUsed">
          You used {this.potionsUsed} combat {this.potionsUsed === 1 ? 'potion' : 'potions'} during
          this encounter, but you could have used {this.maxPotions}. {this.suggestionMessage}
        </Trans>,
      )
        .icon(this.strongPotionIcon)
        .staticImportance(SUGGESTION_IMPORTANCE.REGULAR),
    );
    when(this.potionStrengthThresholds).addSuggestion((suggest) =>
      suggest(
        <Trans id="shared.modules.items.potionChecker.suggestions.weakPotion">
          You used {this.weakPotionsUsed} weak {this.weakPotionsUsed === 1 ? 'potion' : 'potions'}.
          Use <ItemLink id={this.strongPotionId} /> for better results.
        </Trans>,
      )
        .icon(this.strongPotionIcon)
        .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
    );
  }
}

export default PotionChecker;
