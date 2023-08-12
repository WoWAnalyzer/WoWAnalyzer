import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Auras';
import { ThresholdStyle } from 'parser/core/ParseResults';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * Abstract class for potions and healthstone.
 * There are three different categories of pots that share cooldown:
 * Healthstones, health pots and combat pots (DPS, HPS, mana and mitigation).
 * All potions have a 5 minute cooldown.
 *
 * @property {Abilities} abilities
 * @property {Auras} buffs
 * @property {SpellUsable} spellUsable
 * @property {AbilityTracker} abilityTracker
 */
class Potion extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    buffs: Buffs,
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  protected abilities!: Abilities;
  protected buffs!: Buffs;
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  static spells: number[];
  static recommendedEfficiency: number;
  static extraAbilityInfo: { name?: string; buffSpellId?: number[]; isDefensive?: boolean };
  static cooldown = 300;

  maxCasts = 1;

  get static() {
    return this.constructor as typeof Potion;
  }

  /**
   * Determine if this class should activate. Called during constructor, so dependencies are NOT available on `this`.
   */
  protected shouldActivate(options: Options) {
    return true;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.shouldActivate(options);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: this.static.spells,
      category: SPELL_CATEGORY.CONSUMABLE,
      cooldown: this.static.cooldown,
      castEfficiency: {
        suggestion: false,
        maxCasts: () => this.maxCasts,
      },
      ...this.static.extraAbilityInfo,
    });
    if (this.static.extraAbilityInfo.buffSpellId) {
      //assign each buff its corresponding spell ID
      this.static.extraAbilityInfo.buffSpellId.forEach((buff, buffIndex) => {
        (options.buffs as Buffs).add({
          spellId: buff,
          triggeredBySpellId: this.static.spells.find((_, spellIndex) => spellIndex === buffIndex)!,
        });
      });
    }
  }

  get spellId() {
    const spells = this.static.spells;
    const ability = this.abilities.getAbility(spells[0])!;
    return ability.primarySpell;
  }

  get potionCasts() {
    return this.abilityTracker.getAbility(this.spellId).casts;
  }

  get suggestionThresholds() {
    return {
      actual: this.potionCasts / this.maxCasts,
      isLessThan: {
        minor: this.static.recommendedEfficiency,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default Potion;
