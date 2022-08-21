import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import AoESpellEfficiency from 'parser/shared/modules/features/AoESpellEfficiency';

class Consumption extends AoESpellEfficiency {
  constructor(options: Options) {
    super(options);
    this.ability = SPELLS.CONSUMPTION_TALENT;
    this.active = this.selectedCombatant.hasTalent(SPELLS.CONSUMPTION_TALENT.id);
  }
}

export default Consumption;
