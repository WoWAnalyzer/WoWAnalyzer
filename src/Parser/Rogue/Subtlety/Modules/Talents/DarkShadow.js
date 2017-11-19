import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import ShadowDance from './../Features/ShadowDance';

class DarkShadow extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
    shadowDance: ShadowDance,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DARK_SHADOW_TALENT.id);
  }
}

export default DarkShadow;
