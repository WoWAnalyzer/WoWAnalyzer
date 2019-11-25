import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

const REDUCTION_MS = 500;

class FrozenOrb extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  constructor(props) {
    super(props);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLIZZARD_DAMAGE), this._reduceCooldown);
  }

  _reduceCooldown() {
    if (this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id, REDUCTION_MS);
    }
  }

}

export default FrozenOrb;
