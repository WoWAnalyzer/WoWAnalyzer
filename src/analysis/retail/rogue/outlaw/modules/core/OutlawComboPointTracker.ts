import { ComboPointTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ROLL_THE_BONES_COMBO_POINT_STAGE, rollTheBonesStage } from '../../constants';

class OutlawComboPointTracker extends ComboPointTracker {
  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;

    // Bonus hits from Sinister Strike are not included in the energize event, so add them in here
    if (spellId === SPELLS.SINISTER_STRIKE_PROC.id) {
      const stage = rollTheBonesStage(this.selectedCombatant, event.timestamp);
      const amount = stage >= ROLL_THE_BONES_COMBO_POINT_STAGE ? 2 : 1;

      this.processInvisibleEnergize(SPELLS.SINISTER_STRIKE.id, amount, event.timestamp);
    }
  }
}

export default OutlawComboPointTracker;
