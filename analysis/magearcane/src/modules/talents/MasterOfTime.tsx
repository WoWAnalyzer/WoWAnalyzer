import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { RemoveBuffEvent } from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

class MasterOfTime extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_OF_TIME_TALENT.id);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ALTER_TIME_BUFF), this.resetBlink);
  }

  resetBlink(event: RemoveBuffEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.BLINK.id)) {
      this.spellUsable.endCooldown(SPELLS.BLINK.id);
    }
  }
}

export default MasterOfTime;
