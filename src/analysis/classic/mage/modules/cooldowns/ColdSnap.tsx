import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import SPELLS from 'common/SPELLS/classic/mage';

const SPELL_RESETS = [
  SPELLS.ICE_BARRIER,
  SPELLS.FROST_NOVA,
  SPELLS.CONE_OF_COLD,
  SPELLS.ICE_BLOCK,
  SPELLS.ICY_VEINS,
];

class ColdSnap extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: Options) {
    super(props);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell({ id: SPELLS.COLD_SNAP.id }),
      this._resetCooldowns,
    );
  }

  _resetCooldowns() {
    SPELL_RESETS.forEach((spell) => {
      if (this.spellUsable.isOnCooldown(spell.id)) {
        this.spellUsable.endCooldown(spell.id);
      }
    });
  }
}

export default ColdSnap;
