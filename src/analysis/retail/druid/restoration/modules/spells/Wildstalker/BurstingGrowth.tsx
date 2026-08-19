import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';

/**
 * **Bursting Growth**
 * Hero Talent - Wildstalker
 *
 * When Symbiotic Blooms expire (or Rejuvenation is cast on their target), flowers heal
 * the target and nearby allies.
 *
 * No solo statistic card (heal is visible in the healing breakdown).
 * Tracks healing for the hero-tree total only.
 */
export default class BurstingGrowth extends Analyzer {
  totalHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.BURSTING_GROWTH_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.BURSTING_GROWTH_HEAL),
      this.onHeal,
    );
  }

  private onHeal(event: HealEvent) {
    this.totalHealing += event.amount + (event.absorbed || 0);
  }
}
