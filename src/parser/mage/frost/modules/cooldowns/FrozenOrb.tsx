import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { FROZEN_ORB_REDUCTION } from '../../constants';

class FrozenOrb extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: any) {
    super(props);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLIZZARD_DAMAGE), this._reduceCooldown);
  }

  _reduceCooldown() {
    if (this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id, FROZEN_ORB_REDUCTION);
    }
  }

}

export default FrozenOrb;
