import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

/**
 * Raptor Strike (or Monogoose Bite) has a chance to make your next
 * Serpent Sting cost no Focus and deal an additional 250% initial damage.
 */

class VipersVenom extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VIPERS_VENOM_TALENT.id);
  }

}

export default VipersVenom;
