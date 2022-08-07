import Module, { Options } from 'parser/core/Module';
import Haste from 'parser/shared/modules/Haste';

import Abilities from './Abilities';
import Debuff, { SpellbookDebuff } from './Debuff';

/**
 * @property {Haste} haste
 * @property {Abilities} abilities
 */
class Debuffs extends Module {
  static dependencies = {
    abilities: Abilities,
    haste: Haste,
  };
  static DEBUFF_CLASS = Debuff;

  protected abilities!: Abilities;
  protected haste!: Haste;

  activeDebuffs: Debuff[] = [];
  constructor(options: Options) {
    super(options);
    this.loadBuffs(this.debuffs());
  }

  /**
   * This will be called *once* during initialization. This isn't nearly as well worked out as the Abilities modules and was in fact extremely rushed. So I have no clue if you should include all buffs here, or just important ones. We'll figure it out later.
   * @returns {SpellbookDebuff[]}
   */
  debuffs(): SpellbookDebuff[] {
    // This list will NOT be recomputed during the fight. If a cooldown changes based on something like Haste or a Debuff you need to put it in a function.
    // While you can put checks for talents/traits outside of the cooldown prop, you generally should aim to keep everything about a single spell together. In general only move a prop up if you're regularly checking for the same talent/trait in multiple spells.
    // I think anyway, this might all change lul.
    return [];
  }

  loadBuffs(buffs: SpellbookDebuff[]) {
    this.activeDebuffs = buffs
      .map((options) => new Debuffs.DEBUFF_CLASS(options))
      .filter((ability) => ability.enabled);
  }

  /**
   * Add a debuff to the list of active buffs.
   * @param {object} options An object with all the properties and their values that gets passed to the Debuff class.
   */
  add(options: SpellbookDebuff) {
    const debuff = new Debuffs.DEBUFF_CLASS(options);
    this.activeDebuffs.push(debuff);
  }

  /**
   * Returns the first ACTIVE debuff with the given spellId (or undefined if there is no such debuff)
   */
  getDebuff(spellId: number) {
    return this.activeDebuffs.find((debuff) => {
      if (debuff.spellId instanceof Array) {
        return debuff.spellId.includes(spellId);
      } else {
        return debuff.spellId === spellId;
      }
    });
  }
}

export default Debuffs;
