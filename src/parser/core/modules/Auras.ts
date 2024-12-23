import { TALENTS_PRIEST } from 'common/TALENTS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import Module, { Options } from 'parser/core/Module';
import Ability from 'parser/core/modules/Ability';
import Haste from 'parser/shared/modules/Haste';

import Abilities from './Abilities';
import Aura, { SpellbookAura } from './Aura';

function isAbilityWithBuffSpellId(
  ability: Ability,
): ability is Ability & { buffSpellId: number | number[] } {
  return ability.buffSpellId !== null && ability.buffSpellId !== 0;
}

export type AuraOptions = Options & {
  abilities: Abilities;
  haste: Haste;
};

/**
 * @property {Haste} haste
 * @property {Abilities} abilities
 */
class Auras extends Module {
  static dependencies = {
    abilities: Abilities,
    haste: Haste,
  };

  protected abilities!: Abilities;
  protected haste!: Haste;

  activeAuras: Aura[] = [];
  constructor(options: AuraOptions) {
    super(options);
    // passing options is necessary due to how module dependencies work
    // see https://github.com/Microsoft/TypeScript/issues/6110 for more info
    this.loadAuras(this.auras(options));
  }

  /**
   * This will be called *once* during initialization. This isn't nearly as well worked out as the Abilities modules and was in fact extremely rushed. So I have no clue if you should include all buffs here, or just important ones. We'll figure it out later.
   * @returns {object[]}
   */
  auras(options: AuraOptions): SpellbookAura[] {
    // This list will NOT be recomputed during the fight. If a cooldown changes based on something like Haste or a Buff you need to put it in a function.
    // While you can put checks for talents/traits outside the cooldown prop, you generally should aim to keep everything about a single spell together. In general only move a prop up if you're regularly checking for the same talent/trait in multiple spells.
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
        spellId: TALENTS_PRIEST.POWER_INFUSION_TALENT.id,
        timelineHighlight: true,
      },
    ];
  }

  loadAuras(buffs: SpellbookAura[]) {
    this.activeAuras = buffs
      .map((options) => new Aura(options))
      .filter((ability) => ability.enabled);
  }

  /**
   * Add a buff to the list of active buffs.
   * @param {object} options An object with all the properties and their values that gets passed to the Buff class.
   */
  add(options: SpellbookAura) {
    const buff = new Aura(options);
    this.activeAuras.push(buff);
  }

  /**
   * Returns the first ACTIVE buff with the given spellId (or undefined if there is no such buff)
   */
  getAura(spellId: number) {
    return this.activeAuras.find((aura) => {
      if (aura.spellId instanceof Array) {
        return aura.spellId.includes(spellId);
      } else {
        return aura.spellId === spellId;
      }
    });
  }
}

export default Auras;
