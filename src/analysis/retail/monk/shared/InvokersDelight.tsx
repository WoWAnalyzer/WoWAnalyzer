import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Buffs from 'parser/core/modules/Auras';

class InvokersDelight extends Analyzer {
  static dependencies = {
    buffs: Buffs,
  };
  protected buffs!: Buffs;

  constructor(options: Options & { buffs: Buffs }) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKERS_DELIGHT_TALENT);

    if (!this.active) {
      return;
    }

    const specId = options.owner.selectedCombatant.specId;
    let triggerId = 0;
    switch (specId) {
      case 269: {
        // windwalker
        triggerId = TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id;
        break;
      }
      case 270: {
        // mistweaver
        triggerId = this.owner.selectedCombatant.hasTalent(
          TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
        )
          ? TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id
          : TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id;
        break;
      }
    }

    options.buffs.add({
      spellId: SPELLS.INVOKERS_DELIGHT_BUFF.id,
      timelineHighlight: true,
      triggeredBySpellId: triggerId,
    });

    // The haste is coded into the Haste module because it increases haste by a percent.
  }
}

export default InvokersDelight;
