import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';

/**
 * **Sylvan Beckoning**
 * Hero Talent - Keeper of the Grove
 *
 * Periodic heals can empower Swiftmend to summon a Dryad that casts Tranquility
 * (at reduced effectiveness) and Regrowth.
 *
 * No solo statistic card (Dryad heals are visible in the healing breakdown).
 * Tracks healing for the hero-tree total only.
 */
export default class SylvanBeckoning extends Analyzer {
  totalHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SYLVAN_BECKONING_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER_PET).spell([SPELLS.DRYAD_TRANQUILITY, SPELLS.DRYAD_REGROWTH]),
      this.onHeal,
    );
  }

  private onHeal(event: HealEvent) {
    this.totalHealing += event.amount + (event.absorbed || 0);
  }
}
