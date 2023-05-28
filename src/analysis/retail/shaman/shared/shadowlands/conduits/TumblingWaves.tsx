import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class TumblingWaves extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.active = false;

    // this.addEventListener(
    //   Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TUMBLING_WAVES_BUFF),
    //   this.onApplyBuff,
    // );
  }

  onApplyBuff() {
    if (this.spellUsable.isOnCooldown(TALENTS.PRIMORDIAL_WAVE_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS.PRIMORDIAL_WAVE_TALENT.id);
    }
  }
}

export default TumblingWaves;
