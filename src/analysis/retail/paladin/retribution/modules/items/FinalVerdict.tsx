import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class FinalVerdict extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };
  protected spellUsable!: SpellUsable;

  constructor(
    options: Options & {
      active?: boolean;
      gcd?: number;
      abilities: Abilities;
    },
  ) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FINAL_VERDICT_RESET),
      this.onHammerOfWrathReset,
    );
    options.abilities.add({
      spell: SPELLS.FINAL_VERDICT_FINISHER.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      gcd: {
        base: 1500,
      },
    });
  }

  onHammerOfWrathReset() {
    if (this.spellUsable.isOnCooldown(SPELLS.HAMMER_OF_WRATH.id)) {
      this.spellUsable.endCooldown(SPELLS.HAMMER_OF_WRATH.id);
    }
  }
}
export default FinalVerdict;
