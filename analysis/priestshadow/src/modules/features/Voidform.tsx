import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class Voidform extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM),
      this.resetMindBlastCD,
    );
  }

  resetMindBlastCD() {
    if (this.spellUsable.isOnCooldown(SPELLS.MIND_BLAST.id)) {
      this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id);
    }
  }
}

export default Voidform;
