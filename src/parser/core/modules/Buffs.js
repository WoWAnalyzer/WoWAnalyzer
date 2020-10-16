import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import SPELLS from 'common/SPELLS';
import Module from 'parser/core/Module';
import Haste from 'parser/shared/modules/Haste';

import Buff from './Buff';
import Abilities from './Abilities';

// TODO: Make a separate but similar Debuffs module
/**
 * @property {Haste} haste
 * @property {Abilities} abilities
 */
class Buffs extends Module {
  static dependencies = {
    haste: Haste,
    abilities: Abilities,
  };
  static BUFF_CLASS = Buff;

  /**
   * This will be called *once* during initialization. This isn't nearly as well worked out as the Abilities modules and was in fact extremely rushed. So I have no clue if you should include all buffs here, or just important ones. We'll figure it out later.
   * @returns {object[]}
   */
  buffs() {
    // This list will NOT be recomputed during the fight. If a cooldown changes based on something like Haste or a Buff you need to put it in a function.
    // While you can put checks for talents/traits outside of the cooldown prop, you generally should aim to keep everything about a single spell together. In general only move a prop up if you're regularly checking for the same talent/trait in multiple spells.
    // I think anyway, this might all change lul.
    return [
      // Convert the legacy buffSpellId prop
      ...this.abilities.activeAbilities.filter(ability => Boolean(ability.buffSpellId)).map(ability => ({
        spellId: ability.buffSpellId,
        triggeredBySpellId: ability.spell.id !== ability.buffSpellId ? ability.primarySpell.id : undefined,
        timelineHighlight: true,
      })),
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.POWER_INFUSION.id,
        timelineHighlight: true,
      },
    ];
  }

  activeBuffs = [];
  constructor(options) {
    super(options);
    this.loadBuffs(this.buffs());
  }
  loadBuffs(buffs) {
    this.activeBuffs = buffs.map(options => new this.constructor.BUFF_CLASS(options)).filter(ability => ability.enabled);
  }

  /**
   * Add a buff to the list of active buffs.
   * @param {object} options An object with all the properties and their values that gets passed to the Buff class.
   */
  add(options) {
    const buff = new this.constructor.BUFF_CLASS(options);
    this.activeBuffs.push(buff);
  }

  /**
   * Returns the first ACTIVE buff with the given spellId (or undefined if there is no such buff)
   */
  getBuff(spellId) {
    return this.activeBuffs.find(buff => {
      if (buff.spellId instanceof Array) {
        return buff.spellId.includes(spellId);
      } else {
        return buff.spellId === spellId;
      }
    });
  }
}

export default Buffs;
