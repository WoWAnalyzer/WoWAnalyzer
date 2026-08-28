import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';

/**
 * **Flower Walk**
 * Hero Talent - Wildstalker
 *
 * During Barkskin, flowers grow beneath your feet healing nearby allies.
 *
 * No solo statistic card (heal is visible in the healing breakdown).
 * Tracks healing for the hero-tree total only.
 */
export default class FlowerWalk extends Analyzer {
  totalHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.FLOWER_WALK_TALENT);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FLOWER_WALK), this.onHeal);
  }

  private onHeal(event: HealEvent) {
    this.totalHealing += event.amount + (event.absorbed || 0);
  }
}
