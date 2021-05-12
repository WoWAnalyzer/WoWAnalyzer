import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import { HOLY_POWER_FINISHERS } from '../../constants';

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
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.FINAL_VERDICT.bonusID);
    if (!this.active) {
      return;
    }
    HOLY_POWER_FINISHERS.push(SPELLS.FINAL_VERDICT_FINISHER);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FINAL_VERDICT_RESET),
      this.onHammerOfWrathReset,
    );
    options.abilities.add({
      spell: SPELLS.FINAL_VERDICT_FINISHER,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
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
