import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { InterruptEvent } from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const COOLDOWN_REDUCTION_MS: {[rank: number]: number } = {
  1: 1000,
  2: 1500,
  3: 2000,
  4: 2500,
  5: 3000,
  6: 3500,
  7: 4000,
  8: 4500,
  9: 5000,
  10: 5500,
  11: 6000,
  12: 6500,
  13: 7000,
  14: 7500,
  15: 8000,
};

class GroundingSurge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  }
  protected spellUsable!: SpellUsable;

  conduitRank: number = 0;

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
