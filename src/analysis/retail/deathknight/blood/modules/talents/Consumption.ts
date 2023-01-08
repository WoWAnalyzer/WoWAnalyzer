import TALENTS from 'common/TALENTS/deathknight';
import { Options } from 'parser/core/Analyzer';
import AoESpellEfficiency from 'parser/shared/modules/features/AoESpellEfficiency';

class Consumption extends AoESpellEfficiency {
  constructor(options: Options) {
    super(options);
    this.ability = TALENTS.CONSUMPTION_TALENT;
    this.active = this.selectedCombatant.hasTalent(TALENTS.CONSUMPTION_TALENT);
  }
}

export default Consumption;
