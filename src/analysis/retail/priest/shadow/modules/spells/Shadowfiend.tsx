import TALENTS from 'common/TALENTS/priest';

import { Options } from 'parser/core/Analyzer';
import PETS from 'parser/core/PETS';

import Pet from '../core/Pet';

class Shadowfiend extends Pet {
  _pet = PETS.SHADOWFIEND;

  constructor(options: Options) {
    super(options);
    this.active = !(
      this.selectedCombatant.hasTalent(TALENTS.MINDBENDER_SHADOW_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.VOIDWRAITH_TALENT)
    );
  }
}

export default Shadowfiend;
