import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import AoESpellEfficiency from 'parser/shared/modules/features/AoESpellEfficiency';

class DragonRoar extends AoESpellEfficiency {
  constructor(options: Options) {
    super(options);
    this.ability = SPELLS.DRAGON_ROAR_TALENT;
    this.active = this.selectedCombatant.hasTalent(this.ability.id);
  }
}

export default DragonRoar;
