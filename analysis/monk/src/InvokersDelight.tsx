import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Buffs from 'parser/core/modules/Buffs';

class InvokersDelight extends Analyzer {
  static dependencies = {
    buffs: Buffs,
  };
  protected buffs!: Buffs;

  constructor(options: Options & { buffs: Buffs }) {
    super(options);

    this.active = this.selectedCombatant.hasLegendary(SPELLS.INVOKERS_DELIGHT);
    if (!this.active) {
      return;
    }

    options.buffs.add({
      spellId: SPELLS.INVOKERS_DELIGHT_BUFF.id,
      timelineHighlight: true,
      triggeredBySpellId: [
        SPELLS.INVOKE_XUEN_THE_WHITE_TIGER.id,
        SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id,
        SPELLS.INVOKE_YULON_THE_JADE_SERPENT.id,
        SPELLS.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
      ],
    });

    // The haste is coded into the Haste module because it increases haste by a percent.
  }
}

export default InvokersDelight;
