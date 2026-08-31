import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';

/**
 * **Spirit of the Thicket**
 * Hero Talent - Keeper of the Grove
 *
 * Ironbark summons a Dryad that channels a heal onto your target.
 *
 * No solo statistic card (the heal is visible in the healing breakdown).
 * Tracks healing for the hero-tree total only.
 */
export default class SpiritOfTheThicket extends Analyzer {
  totalHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SPIRIT_OF_THE_THICKET_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.DRYAD_SPIRIT_OF_THE_THICKET_HEAL),
      this.onHeal,
    );
  }

  private onHeal(event: HealEvent) {
    this.totalHealing += event.amount + (event.absorbed || 0);
  }
}
