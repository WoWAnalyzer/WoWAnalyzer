import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class TumblingWaves extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.active = false;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TUMBLING_WAVES_BUFF),
      this.onApplyBuff,
    );
  }

  onApplyBuff() {
    if (this.spellUsable.isOnCooldown(SPELLS.PRIMORDIAL_WAVE_CAST.id)) {
      this.spellUsable.endCooldown(SPELLS.PRIMORDIAL_WAVE_CAST.id);
    }
  }
}

export default TumblingWaves;
