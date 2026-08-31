import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';

/**
 * **Lethal Preservation**
 * Hero Talent - Wildstalker
 *
 * When you remove an effect with Soothe or Nature's Cure, heal for 4% of max health
 * (or an injured ally if you are full health).
 *
 * No solo statistic card (heals are visible in the healing breakdown).
 * Tracks healing for the hero-tree total only.
 */
export default class LethalPreservation extends Analyzer {
  totalHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.LETHAL_PRESERVATION_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.LETHAL_PRESERVATION_SELF_HEAL, SPELLS.LETHAL_PRESERVATION_OTHER_HEAL]),
      this.onHeal,
    );
  }

  private onHeal(event: HealEvent) {
    this.totalHealing += event.amount + (event.absorbed || 0);
  }
}
