import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';

import Pet from '../Core/Pet';

class Shadowfiend extends Pet {
  _pet = PETS.SHADOWFIEND;

  constructor(...args) {
    super(...args);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id);
  }
}

export default Shadowfiend;
