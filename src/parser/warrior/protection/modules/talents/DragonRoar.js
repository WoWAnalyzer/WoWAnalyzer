import SPELLS from 'common/SPELLS';
import AoESpellEfficiency from 'parser/shared/modules/features/AoESpellEfficiency';

class DragonRoar extends AoESpellEfficiency {
  
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id);
    this.ability = SPELLS.DRAGON_ROAR_TALENT;
  }
}

export default DragonRoar;

