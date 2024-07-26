import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class LavaSurge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LAVA_SURGE),
      this.applyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.LAVA_SURGE),
      this.applyBuff,
    );
  }

  applyBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.spellUsable.isOnCooldown(TALENTS.LAVA_BURST_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS.LAVA_BURST_TALENT.id, event.timestamp, true, false);
    }
  }
}

export default LavaSurge;
