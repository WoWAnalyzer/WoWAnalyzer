import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { DamageEvent } from 'parser/core/Events';

export default class Ironfur extends Analyzer {
  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event: DamageEvent) {
    // No direct way to determine which damage events are mitigated by armor, but 99% of the time
    // it's "physical, not periodic". Will add a blacklist/whitelist if needed for special cases.
    if (isArmorMitigated(event)) {
      const stacks = this.selectedCombatant.getBuffStacks(SPELLS.IRONFUR.id);
      console.log(stacks); // TODO impl
    }
  }
}
