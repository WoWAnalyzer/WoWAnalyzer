import SPELLS from 'common/SPELLS';
import AoESpellEfficiency from 'Parser/Core/Modules/Features/AoESpellEfficiency';

class Consumption extends AoESpellEfficiency {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CONSUMPTION_TALENT.id);
    this.ability = SPELLS.CONSUMPTION_TALENT;
  }
}

export default Consumption;
