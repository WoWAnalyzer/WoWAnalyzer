import { ComboPointTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';

class OutlawComboPointTracker extends ComboPointTracker {
  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;

    // Bonus hits from Sinister Strike are not included in the energize event, so add them in here
    if (spellId === SPELLS.SINISTER_STRIKE_PROC.id) {
      let amount = 1;

      if (this.selectedCombatant.hasBuff(SPELLS.BROADSIDE.id)) {
        amount = 2;
      }

      this.processInvisibleEnergize(SPELLS.SINISTER_STRIKE.id, amount, event.timestamp);
    }
  }
}

export default OutlawComboPointTracker;
