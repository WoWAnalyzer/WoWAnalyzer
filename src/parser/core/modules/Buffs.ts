import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import Module, { Options } from 'parser/core/Module';
import Ability from 'parser/core/modules/Ability';
import Haste from 'parser/shared/modules/Haste';

import Abilities from './Abilities';
import Buff, { SpellbookBuff } from './Buff';

function isAbilityWithBuffSpellId(
  ability: Ability,
): ability is Ability & { buffSpellId: number | number[] } {
  return ability.buffSpellId !== null && ability.buffSpellId !== 0;
}

type BuffsOptions = Options & {
  abilities: Abilities;
  haste: Haste;
};

/**
 * @property {Haste} haste
 * @property {Abilities} abilities
 */
class Buffs extends Module {
  static dependencies = {
    abilities: Abilities,
    haste: Haste,
  };
  static BUFF_CLASS = Buff;

  protected abilities!: Abilities;
  protected haste!: Haste;

  activeBuffs: Buff[] = [];
  constructor(options: BuffsOptions) {
    super(options);
    // passing options is necessary due to how module dependencies work
    // see https://github.com/Microsoft/TypeScript/issues/6110 for more info
    this.loadBuffs(this.buffs(options));
  }

  /**
   * This will be called *once* during initialization. This isn't nearly as well worked out as the Abilities modules and was in fact extremely rushed. So I have no clue if you should include all buffs here, or just important ones. We'll figure it out later.
   * @returns {object[]}
   */
  buffs(options: BuffsOptions): SpellbookBuff[] {
    // This list will NOT be recomputed during the fight. If a cooldown changes based on something like Haste or a Buff you need to put it in a function.
    // While you can put checks for talents/traits outside of the cooldown prop, you generally should aim to keep everything about a single spell together. In general only move a prop up if you're regularly checking for the same talent/trait in multiple spells.
    // I think anyway, this might all change lul.
    return [
      // Convert the legacy buffSpellId prop
      ...options.abilities.activeAbilities.filter(isAbilityWithBuffSpellId).map((ability) => ({
        spellId: ability.buffSpellId,
        triggeredBySpellId:
          ability.spell !== ability.buffSpellId ? ability.primarySpell : undefined,
        timelineHighlight: true,
      })),
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.POWER_INFUSION.id,
        timelineHighlight: true,
      },
    ];
  }

  loadBuffs(buffs: SpellbookBuff[]) {
    this.activeBuffs = buffs
      .map((options) => new Buffs.BUFF_CLASS(options))
      .filter((ability) => ability.enabled);
  }

  /**
   * Add a buff to the list of active buffs.
   * @param {object} options An object with all the properties and their values that gets passed to the Buff class.
   */
  add(options: SpellbookBuff) {
    const buff = new Buffs.BUFF_CLASS(options);
    this.activeBuffs.push(buff);
  }

  /**
   * Returns the first ACTIVE buff with the given spellId (or undefined if there is no such buff)
   */
  getBuff(spellId: number) {
    return this.activeBuffs.find((buff) => {
      if (buff.spellId instanceof Array) {
        return buff.spellId.includes(spellId);
      } else {
        return buff.spellId === spellId;
      }
    });
  }
}

export default Buffs;
