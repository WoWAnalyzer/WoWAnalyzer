import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { InterruptEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const COOLDOWN_REDUCTION_MS = 4000;

class QuickWitted extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.QUICK_WITTED_TALENT);
    this.addEventListener(
      Events.interrupt.by(SELECTED_PLAYER).spell(SPELLS.COUNTERSPELL),
      this.onInterrupt,
    );
  }

  onInterrupt(event: InterruptEvent) {
    this.spellUsable.reduceCooldown(SPELLS.COUNTERSPELL.id, COOLDOWN_REDUCTION_MS);
  }
}

export default QuickWitted;
