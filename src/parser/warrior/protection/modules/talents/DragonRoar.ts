import SPELLS from 'common/SPELLS';
import AoESpellEfficiency from 'parser/shared/modules/features/AoESpellEfficiency';
import { Options } from 'parser/core/Analyzer';

class DragonRoar extends AoESpellEfficiency {
  
  constructor(options: Options) {
    super(options);
    this.ability = SPELLS.DRAGON_ROAR_TALENT;
    this.active = this.selectedCombatant.hasTalent(this.ability.id);
  }
}

export default DragonRoar;

