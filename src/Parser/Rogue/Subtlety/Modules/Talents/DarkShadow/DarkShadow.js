import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';

class DarkShadow extends Analyzer {
  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DARK_SHADOW_TALENT.id);
  }
}

export default DarkShadow;
