import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const REDUCTION_MS = 300;

class FrozenOrb extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ICE_CALLER_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLIZZARD_DAMAGE),
      this._reduceCooldown,
    );
  }

  _reduceCooldown() {
    if (this.spellUsable.isOnCooldown(TALENTS.FROZEN_ORB_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS.FROZEN_ORB_TALENT.id, REDUCTION_MS);
    }
  }
}

export default FrozenOrb;
