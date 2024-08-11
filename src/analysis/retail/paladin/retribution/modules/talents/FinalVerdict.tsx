import SPELLS from 'common/SPELLS';
import { TALENTS_PALADIN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
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
    this.active = this.selectedCombatant.hasTalent(TALENTS_PALADIN.FINAL_VERDICT_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FINAL_VERDICT_RESET),
      this.onHammerOfWrathReset,
    );
  }

  onHammerOfWrathReset() {
    if (this.spellUsable.isOnCooldown(SPELLS.HAMMER_OF_WRATH.id)) {
      this.spellUsable.endCooldown(SPELLS.HAMMER_OF_WRATH.id);
    }
  }
}
export default FinalVerdict;
