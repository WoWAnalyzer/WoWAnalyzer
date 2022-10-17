import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

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
    if (this.spellUsable.isOnCooldown(TALENTS.LAVA_BURST_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS.LAVA_BURST_TALENT.id);
    }
  }
}

export default LavaSurge;
