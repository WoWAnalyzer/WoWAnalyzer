import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { COLD_SNAP_RESETS } from '../../constants';

class ColdSnap extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: any) {
    super(props);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COLD_SNAP), this._resetCooldowns);
  }

  _resetCooldowns() {
    COLD_SNAP_RESETS.forEach(spell => {
      if (this.spellUsable.isOnCooldown(spell.id)) {
        this.spellUsable.endCooldown(spell.id);
      }
    });
  }

}

export default ColdSnap;
