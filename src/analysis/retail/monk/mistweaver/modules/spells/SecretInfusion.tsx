import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Buffs from 'parser/core/modules/Auras';
import { SECRET_INFUSION_BUFFS } from '../../constants';

class SecretInfusion extends Analyzer {
  static dependencies = {
    buffs: Buffs,
  };
  protected buffs!: Buffs;

  constructor(options: Options & { buffs: Buffs }) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.SECRET_INFUSION_TALENT);

    SECRET_INFUSION_BUFFS.forEach((spell) => {
      options.buffs.add({
        spellId: spell.id,
        triggeredBySpellId: TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id,
      });
    });
  }
}

export default SecretInfusion;
