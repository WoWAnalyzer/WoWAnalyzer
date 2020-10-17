import SPELLS from 'common/SPELLS';
import AoESpellEfficiency from 'parser/shared/modules/features/AoESpellEfficiency';

class Consumption extends AoESpellEfficiency {

  ability = SPELLS.CONSUMPTION_TALENT;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CONSUMPTION_TALENT.id);
  }
}

export default Consumption;
