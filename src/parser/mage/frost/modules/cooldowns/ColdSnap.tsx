import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

const SPELL_RESETS = [
	SPELLS.ICE_BARRIER,
	SPELLS.FROST_NOVA,
	SPELLS.CONE_OF_COLD,
	SPELLS.ICE_BLOCK,
  ];

class ColdSnap extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: Options) {
    super(props);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COLD_SNAP), this._resetCooldowns);
  }

  _resetCooldowns() {
    SPELL_RESETS.forEach(spell => {
      if (this.spellUsable.isOnCooldown(spell.id)) {
        this.spellUsable.endCooldown(spell.id);
      }
    });
  }
}

export default ColdSnap;
