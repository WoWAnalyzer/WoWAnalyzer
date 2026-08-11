/** ReactiveWarding
 * When refreshing Earth Shield, your target is healed for X for each stack of Earth Shield they are missing.
 * Additionally, Earth Shield and Water Shield can consume charges 1.0 sec faster.
 */
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

export default class ReactiveWarding extends Analyzer {
  protected cooldownThroughputTracker!: CooldownThroughputTracker;

  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.REACTIVE_WARDING_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
      this.onReactiveWardingHeal,
    );
  }

  onReactiveWardingHeal(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
  }
}
