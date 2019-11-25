import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

const ABILITY_RESETS = [
	SPELLS.ICE_BARRIER.id,
	SPELLS.FROST_NOVA.id,
	SPELLS.CONE_OF_COLD.id,
	SPELLS.ICE_BLOCK.id,
  ];

class ColdSnap extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  constructor(props) {
    super(props);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COLD_SNAP), this._resetCooldowns);
  }

  _resetCooldowns() {
    ABILITY_RESETS.forEach(spellId => {
      if (this.spellUsable.isOnCooldown(spellId)) {
        this.spellUsable.endCooldown(spellId);
      }
    });
  }

}

export default ColdSnap;
