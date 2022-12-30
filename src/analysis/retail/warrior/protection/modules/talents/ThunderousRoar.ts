import { Options } from 'parser/core/Analyzer';
import AoESpellEfficiency from 'parser/shared/modules/features/AoESpellEfficiency';
import TALENTS from 'common/TALENTS/warrior';

class ThunderousRoar extends AoESpellEfficiency {
  constructor(options: Options) {
    super(options);
    this.ability = TALENTS.THUNDEROUS_ROAR_TALENT;
    this.active = this.selectedCombatant.hasTalent(TALENTS.THUNDEROUS_ROAR_TALENT);
  }
}

export default ThunderousRoar;
