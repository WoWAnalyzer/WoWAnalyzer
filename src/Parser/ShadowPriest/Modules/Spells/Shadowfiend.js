import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';

import Pet from '../Core/Pet';

class Shadowfiend extends Pet {
  _pet = PETS.SHADOWFIEND;

  on_initialized() {
    this.active = !this.combatants.selected.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id);

    super.on_initialized();
  }
}

export default Shadowfiend;
