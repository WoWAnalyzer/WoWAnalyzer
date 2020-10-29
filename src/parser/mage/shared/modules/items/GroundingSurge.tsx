import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { InterruptEvent } from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const COOLDOWN_REDUCTION_MS = [0, 2500, 2800, 3000, 3300, 3500, 3800, 4000, 4300, 4500, 4800, 5000, 5300, 5500, 5800, 6000];

class GroundingSurge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  }
  protected spellUsable!: SpellUsable;

  conduitRank = 0;
  bonusDamage = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.GROUNDING_SURGE.id);
    if (!this.active) {
      return;
    }
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.GROUNDING_SURGE.id);
    this.addEventListener(Events.interrupt.by(SELECTED_PLAYER).spell(SPELLS.COUNTERSPELL), this.onInterrupt);
  }

  onInterrupt(event: InterruptEvent) {
    this.spellUsable.reduceCooldown(SPELLS.COUNTERSPELL.id, COOLDOWN_REDUCTION_MS[this.conduitRank]);
  }
}

export default GroundingSurge;
