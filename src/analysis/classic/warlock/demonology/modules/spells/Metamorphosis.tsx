import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/classic/warlock';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * Impending Doom (talent) has a chance to reduce Metamorphosis CD by 15s on proc
 * The proc is hidden so no way to track
 * Assume if player gained the buff while the CD was still active, it was reset
 */
class Metamorphosis extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  reductionTime: number = 15000; // ms (15 seconds)

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.METAMORPHOSIS]),
      this.onCastSpells,
    );
  }

  onCastSpells(event: ApplyBuffEvent) {
    if (!this.spellUsable.isAvailable(SPELLS.METAMORPHOSIS.id)) {
      if (!event.__fabricated) {
        return this.spellUsable.endCooldown(SPELLS.METAMORPHOSIS.id);
      }
    }
    return 0;
  }
}

export default Metamorphosis;
