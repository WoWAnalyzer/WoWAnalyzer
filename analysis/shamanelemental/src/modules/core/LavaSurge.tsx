import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/shaman';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { ApplyBuffEvent } from 'parser/core/Events';

class LavaSurge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LAVA_SURGE), this.onLS);
  }

  onLS(event: ApplyBuffEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.LAVA_BURST.id)) {
      this.spellUsable.endCooldown(SPELLS.LAVA_BURST.id);
    }
  }
}

export default LavaSurge;
