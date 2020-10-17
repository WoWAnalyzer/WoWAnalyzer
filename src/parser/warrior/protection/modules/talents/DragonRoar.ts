import SPELLS from 'common/SPELLS';
import AoESpellEfficiency from 'parser/shared/modules/features/AoESpellEfficiency';
import { Options } from 'parser/core/Analyzer';

class DragonRoar extends AoESpellEfficiency {
  ability = SPELLS.DRAGON_ROAR_TALENT;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id);
  }
}

export default DragonRoar;

