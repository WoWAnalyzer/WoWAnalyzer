import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const REDUCTION_MS = 30000;

class Flurry extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: Options) {
    super(props);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE_BUFF),
      this._gainCharge,
    );
  }

  _gainCharge() {
    if (this.spellUsable.isOnCooldown(TALENTS.FLURRY_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS.FLURRY_TALENT.id, REDUCTION_MS);
    }
  }
}

export default Flurry;
