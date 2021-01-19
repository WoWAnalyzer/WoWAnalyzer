import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Spell from 'common/SPELLS/Spell';
import { ThresholdStyle } from 'parser/core/ParseResults';

/**
 * Abstract class for potions and healthstone.
 * There are three different categories of pots that share cooldown:
 * Healthstones, health pots and combat pots (DPS, HPS, mana and mitigation).
 * All potions have a 5 minute cooldown.
 *
 * @property {Abilities} abilities
 * @property {Buffs} buffs
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

  static spells: Spell[];
  static recommendedEfficiency: number;
  static extraAbilityInfo: { name?: string, buffSpellId?: number[], isDefensive?: boolean, };
  static cooldown = 300;

  maxCasts = 1;

  get static() {
    return this.constructor as typeof Potion;
  }

  constructor(options: Options) {
    super(options);
    if (!this.isAvailable) {
      this.active = false;
      return;
    }
    (options.abilities as Abilities).add({
      spell: this.static.spells,
      category: Abilities.SPELL_CATEGORIES.CONSUMABLE,
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
          triggeredBySpellId: this.static.spells.find((_, spellIndex) => spellIndex === buffIndex)!.id,
        });
      });
    }
  }

  // To be overwriten by classes extending the Potion module.
  get isAvailable() {
    return true;
  }

  get spellId() {
    const spells = this.static.spells;
    const ability = this.abilities.getAbility(spells[0].id)!;
    return ability.primarySpell.id;
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
