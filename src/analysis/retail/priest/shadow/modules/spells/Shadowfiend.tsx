import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import PETS from 'parser/core/PETS';

import Pet from '../core/Pet';

class Shadowfiend extends Pet {
  _pet = PETS.SHADOWFIEND;

  constructor(options: Options) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id);
  }
}

export default Shadowfiend;
