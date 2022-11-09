import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const SPELL_RESETS = [
  TALENTS.ICE_BARRIER_TALENT,
  SPELLS.FROST_NOVA,
  SPELLS.CONE_OF_COLD,
  TALENTS.ICE_BLOCK_TALENT,
];

class ColdSnap extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: Options) {
    super(props);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COLD_SNAP_TALENT),
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
