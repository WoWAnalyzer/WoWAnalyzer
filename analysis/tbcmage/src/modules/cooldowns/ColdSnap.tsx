import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import * as SPELLS from '../../SPELLS';

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
      Events.cast.by(SELECTED_PLAYER).spell({ id: SPELLS.COLD_SNAP }),
      this._resetCooldowns,
    );
  }

  _resetCooldowns() {
    SPELL_RESETS.forEach((spell) => {
      if (this.spellUsable.isOnCooldown(spell)) {
        this.spellUsable.endCooldown(spell);
      }
    });
  }
}

export default ColdSnap;
