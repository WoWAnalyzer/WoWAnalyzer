import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Buffs from 'parser/core/modules/Auras';

class InvokersDelight extends Analyzer {
  static dependencies = {
    buffs: Buffs,
  };
  protected buffs!: Buffs;

  constructor(options: Options & { buffs: Buffs }) {
    super(options);

    this.active =
      this.selectedCombatant.hasTalent(talents.INVOKERS_DELIGHT_TALENT) ||
      this.selectedCombatant.hasTalent(talents.INVOKERS_DELIGHT_TALENT);
    if (!this.active) {
      return;
    }

    options.buffs.add({
      spellId: SPELLS.INVOKERS_DELIGHT_BUFF.id,
      timelineHighlight: true,
      triggeredBySpellId: [
        talents.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id,
        talents.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
        talents.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id,
      ],
    });

    // The haste is coded into the Haste module because it increases haste by a percent.
  }
}

export default InvokersDelight;
